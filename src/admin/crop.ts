// Crop / turn editor for one picture (admin, dev server only).
// The preview comes from the same source the server will crop (the original when it is still
// in galeria-entrada/), so the area, kept as fractions of the picture, means the same on both sides.
import { post } from "./client";

type Box = { x: number; y: number; w: number; h: number };
export type CropResult = { key: string; width: number; height: number; copy: boolean };

const MIN = 0.02;                       // smallest side, as a fraction of the picture
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export async function openCrop(key: string): Promise<CropResult | null> {
  const dialog = document.querySelector<HTMLDialogElement>("#crop")!;
  const q = <T extends HTMLElement>(s: string) => dialog.querySelector<T>(s)!;
  const stage = q<HTMLElement>(".stage"), canvas = q<HTMLCanvasElement>("canvas"), boxEl = q<HTMLElement>(".cbox");
  const info = q<HTMLElement>(".cinfo"), aspectSel = q<HTMLSelectElement>('select[name="aspect"]');
  const saveBtn = q<HTMLButtonElement>('[data-c="save"]');

  q<HTMLElement>(".ctitle").textContent = key.split("/").pop()!.replace(/\.webp$/, "");
  info.textContent = "carregando...";
  saveBtn.disabled = true;
  dialog.showModal();

  // load the preview
  const res = await fetch(`/__admin/galeria/crop/preview?path=${encodeURIComponent(key)}&t=${Date.now()}`);
  if (!res.ok) { dialog.close(); throw new Error("não consegui abrir a imagem"); }
  dialog.scrollTop = 0;
  const fromOriginal = res.headers.get("x-source") === "original";
  const bmp = await createImageBitmap(await res.blob());
  // the preview is smaller than the picture that gets cropped: numbers shown use the real size
  const [realW, realH] = (res.headers.get("x-real-size") ?? `${bmp.width}x${bmp.height}`).split("x").map(Number);
  q<HTMLElement>(".csource").textContent = fromOriginal
    ? "Recorta a partir do original em galeria-entrada/ (sem perder qualidade)."
    : "O original não está mais na entrada: recorta a imagem publicada (uma recompressão leve).";

  let rot = 0;
  let box: Box = { x: 0, y: 0, w: 1, h: 1 };
  const dims = () => (rot % 180 ? { W: realH, H: realW } : { W: realW, H: realH });

  // aspect ratio as width/height in pixels (0 = free)
  const aspect = () => {
    const v = aspectSel.value;
    if (!v) return 0;
    if (v === "orig") { const { W, H } = dims(); return W / H; }
    const [a, b] = v.split(":").map(Number);
    return a / b;
  };

  // fit the preview to the dialog's free space (its height minus the controls)
  function fitStage() {
    const { W, H } = dims();
    const others = [...dialog.children].filter((el) => !el.classList.contains("stage"))
      .reduce((sum, el) => sum + (el as HTMLElement).offsetHeight, 0);
    const style = getComputedStyle(dialog);
    const chrome = others + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      + parseFloat(style.rowGap || "0") * (dialog.children.length - 1) + 24;
    const maxH = Math.max(180, window.innerHeight * 0.92 - chrome);
    const maxW = Math.max(220, dialog.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 2);
    const scale = Math.min(maxW / W, maxH / H);
    stage.style.width = `${Math.max(1, Math.round(W * scale))}px`;
    stage.style.height = `${Math.max(1, Math.round(H * scale))}px`;
  }
  window.addEventListener("resize", fitStage);

  function draw() {
    fitStage();
    const { W, H } = dims();
    const sc = bmp.width / realW;                       // preview pixels per real pixel
    canvas.width = Math.round(W * sc); canvas.height = Math.round(H * sc);
    const c = canvas.getContext("2d")!;
    c.save();
    c.translate(canvas.width / 2, canvas.height / 2); c.rotate((rot * Math.PI) / 180);
    c.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
    c.restore();
  }
  function paint() {
    const { W, H } = dims();
    Object.assign(boxEl.style, { left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` });
    const pw = Math.round(box.w * W), ph = Math.round(box.h * H);
    const out = Math.min(1, 1800 / Math.max(pw, ph));
    info.textContent = `${pw} × ${ph} px` + (out < 1 ? ` → ${Math.round(pw * out)} × ${Math.round(ph * out)} no site` : "");
  }
  // largest box of the current ratio that fits, centered where the box is now
  function fit() {
    const a = aspect(), { W, H } = dims();
    if (!a) return;
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    let w = box.w, h = (w * W) / a / H;
    if (h > 1) { h = 1; w = (h * H * a) / W; }
    if (w > 1) { w = 1; h = (w * W) / a / H; }
    box = { w, h, x: clamp(cx - w / 2, 0, 1 - w), y: clamp(cy - h / 2, 0, 1 - h) };
  }
  function reset() { box = { x: 0, y: 0, w: 1, h: 1 }; fit(); paint(); }

  // ── dragging ──
  let drag: { h: string; start: Box; px: number; py: number } | null = null;
  const point = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) };
  };
  const onDown = (e: PointerEvent) => {
    const h = (e.target as HTMLElement).closest<HTMLElement>("[data-h]")?.dataset.h;
    if (!h) return;
    e.preventDefault();
    const p = point(e);
    drag = { h, start: { ...box }, px: p.x, py: p.y };
    stage.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const p = point(e), s = drag.start, { W, H } = dims(), a = aspect();
    if (drag.h === "move") {
      box = { ...s, x: clamp(s.x + p.x - drag.px, 0, 1 - s.w), y: clamp(s.y + p.y - drag.py, 0, 1 - s.h) };
      return paint();
    }
    let l = s.x, t = s.y, r = s.x + s.w, b = s.y + s.h;
    if (drag.h.includes("w")) l = Math.min(p.x, r - MIN);
    if (drag.h.includes("e")) r = Math.max(p.x, l + MIN);
    if (drag.h.includes("n")) t = Math.min(p.y, b - MIN);
    if (drag.h.includes("s")) b = Math.max(p.y, t + MIN);
    if (a) {
      const corner = drag.h.length === 2, vertical = drag.h === "n" || drag.h === "s";
      let w = r - l, h = b - t;
      if (vertical) w = (h * H * a) / W; else h = (w * W) / a / H;
      // room available from the fixed point (a corner, or the middle of the opposite side)
      const roomX = corner || vertical ? (drag.h.includes("w") ? s.x + s.w : drag.h.includes("e") ? 1 - s.x : Math.min(s.x + s.w / 2, 1 - s.x - s.w / 2) * 2) : 0;
      const roomY = corner || !vertical ? (drag.h.includes("n") ? s.y + s.h : drag.h.includes("s") ? 1 - s.y : Math.min(s.y + s.h / 2, 1 - s.y - s.h / 2) * 2) : 0;
      const kx = roomX ? roomX / w : Infinity, ky = roomY ? roomY / h : Infinity;
      const k = Math.min(1, kx, ky);
      w *= k; h *= k;
      if (w < MIN || h < MIN) return;
      if (drag.h.includes("w")) l = r - w; else if (drag.h.includes("e")) r = l + w; else { const cx = s.x + s.w / 2; l = cx - w / 2; r = cx + w / 2; }
      if (drag.h.includes("n")) t = b - h; else if (drag.h.includes("s")) b = t + h; else { const cy = s.y + s.h / 2; t = cy - h / 2; b = cy + h / 2; }
    }
    box = { x: l, y: t, w: r - l, h: b - t };
    paint();
  };
  const onUp = () => { drag = null; };
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);

  // ── controls and answer ──
  aspectSel.value = "";
  q<HTMLInputElement>('input[name="cmode"][value="replace"]').checked = true;
  draw(); reset(); saveBtn.disabled = false;

  return new Promise((resolve) => {
    const turn = (deg: number) => { rot = (rot + deg + 360) % 360; draw(); reset(); };
    const finish = (value: CropResult | null) => {
      dialog.removeEventListener("click", onClick);
      dialog.removeEventListener("cancel", onCancel);
      aspectSel.removeEventListener("change", onAspect);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      if (dialog.open) dialog.close();
      window.removeEventListener("resize", fitStage);
      bmp.close();
      resolve(value);
    };
    const onAspect = () => { fit(); paint(); };
    const onCancel = (e: Event) => { e.preventDefault(); finish(null); };
    const onClick = async (e: Event) => {
      const c = (e.target as HTMLElement).closest<HTMLElement>("[data-c]")?.dataset.c;
      if (!c) return;
      if (c === "cancel") return finish(null);
      if (c === "left") return turn(-90);
      if (c === "right") return turn(90);
      if (c === "reset") { rot = 0; aspectSel.value = ""; draw(); return reset(); }
      if (c === "save") {
        const copy = q<HTMLInputElement>('input[name="cmode"]:checked').value === "copy";
        saveBtn.disabled = true; info.textContent = "salvando...";
        try {
          const out = await post("galeria/picture/crop", { key, rot, ...box, mode: copy ? "copy" : "replace" });
          finish({ key: out.key, width: out.width, height: out.height, copy });
        } catch (err: any) { info.textContent = err.message; saveBtn.disabled = false; }
      }
    };
    dialog.addEventListener("click", onClick);
    dialog.addEventListener("cancel", onCancel);
    aspectSel.addEventListener("change", onAspect);
  });
}
