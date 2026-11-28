// Browser-side helpers shared by the admin pages (/admin/*). Dev server only.

export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;

// every value interpolated into innerHTML goes through esc() (or encodeURIComponent for
// URLs), so file names and texts can't inject markup
export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Status line. Saving a file makes the dev server reload the page, so the last message
// is kept for a few seconds in sessionStorage and shown again after the reload.
export function say(text: string, bad = false) {
  const s = $("#status");
  s.textContent = text;
  s.className = bad ? "bad" : "ok";
  sessionStorage.setItem("admin-status", JSON.stringify([text, bad, Date.now()]));
}
export function restoreStatus() {
  const last = JSON.parse(sessionStorage.getItem("admin-status") ?? "null");
  if (last && Date.now() - last[2] < 5000) say(last[0], last[1]);
}

export async function get<T = any>(name: string): Promise<T> {
  const r = await fetch(`/__admin/${name}`);
  const out = await r.json();
  if (!r.ok) throw new Error(out.error);
  return out;
}

export async function post<T = any>(action: string, body: object): Promise<T> {
  const r = await fetch(`/__admin/${action}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin": "1" },
    body: JSON.stringify(body),
  });
  const out = await r.json();
  if (!r.ok) throw new Error(out.error);
  return out;
}

// What is selected is kept in the address (#...) so it survives the reload too.
export const hashValue = () => (location.hash ? decodeURIComponent(location.hash.slice(1)) : "");
export const setHash = (v: string) => history.replaceState(null, "", v ? "#" + encodeURIComponent(v) : location.pathname);

// form fields as plain strings ("on" for checked boxes)
export const fields = (form: HTMLFormElement) => Object.fromEntries(new FormData(form)) as Record<string, string>;
// one item per non-empty line
export const lines = (s: string | undefined) => (s ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
export const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// ── gallery uploads ──
// Pictures from the computer go to galeria-entrada/ first (the originals stay there, like
// files dropped in the folder by hand); publishing makes the light WebP copies.
const ACCEPTED = /\.(jpe?g|png|webp|avif|tiff?)$/i;
export const isImage = (f: File) => ACCEPTED.test(f.name);

// params: { dir: "<inbox folder>" } or { album: "<published album path>" }
export async function uploadFiles(files: File[], params: Record<string, string>) {
  const images = files.filter(isImage);
  const skipped = files.filter((f) => !isImage(f)).map((f) => f.name);
  const paths: string[] = [];
  let existed = 0;
  for (const [i, file] of images.entries()) {
    say(`enviando ${i + 1}/${images.length}: ${file.name}`);
    const q = new URLSearchParams({ ...params, name: file.name });
    const r = await fetch(`/__admin/galeria/entrada/upload?${q}`, {
      method: "POST",
      headers: { "content-type": "application/octet-stream", "x-admin": "1" },
      body: file,
    });
    const out = await r.json();
    if (!r.ok) throw new Error(out.error);
    paths.push(out.path);
    if (out.existed) existed++;
  }
  return { paths, existed, skipped };
}

// a drop area for files from the computer (internal drags of pictures are ignored)
export function fileDrop(el: HTMLElement, onFiles: (files: File[]) => void) {
  const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes("Files") ?? false;
  el.addEventListener("dragover", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    el.classList.add("drop-target");
  });
  el.addEventListener("dragleave", (e) => { if (!el.contains(e.relatedTarget as Node)) el.classList.remove("drop-target"); });
  el.addEventListener("drop", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    el.classList.remove("drop-target");
    onFiles([...e.dataTransfer!.files]);
  });
}

// ── partial dates ──
// A date field with a precision switch: full date, month and year, or only the year.
// The value sent with the form sits in a hidden input named `name`: "2021", "2021-03"
// or "2021-03-05" ("" = no date). `hint` is shown under it (e.g. the date guessed from
// the file name, used by the site while no date is written).
type Prec = "ano" | "mes" | "dia";
const precOf = (v: string): Prec => (v.length >= 10 ? "dia" : v.length >= 7 ? "mes" : "ano");
const partInput = (prec: Prec, v: string) =>
  prec === "dia" ? `<input type="date" data-part value="${esc(v.length >= 10 ? v.slice(0, 10) : "")}">`
  : prec === "mes" ? `<input type="month" data-part value="${esc(v.length >= 7 ? v.slice(0, 7) : "")}">`
  : `<input type="number" data-part min="1900" max="2100" step="1" placeholder="ex.: 2021" value="${esc(v.slice(0, 4))}">`;

export function dateField(name: string, value: unknown, hint = "", label = "data") {
  const v = String(value ?? "");
  const prec = precOf(v);
  const opt = (p: Prec, text: string) => `<option value="${p}" ${p === prec ? "selected" : ""}>${text}</option>`;
  return `
    <div class="fdate">
      <span class="fdate-label">${esc(label)}</span>
      <div class="fdate-row">
        <select data-prec aria-label="precisão da ${esc(label)}">${opt("ano", "só o ano")}${opt("mes", "mês e ano")}${opt("dia", "data completa")}</select>
        ${partInput(prec, v)}
      </div>
      <input type="hidden" name="${esc(name)}" value="${esc(v)}">
      ${hint ? `<small class="muted-note">${esc(hint)}</small>` : ""}
    </div>`;
}

// one listener for every date field on the page (they are created with innerHTML)
document.addEventListener("change", (e) => {
  const t = e.target as HTMLElement;
  const box = t.closest<HTMLElement>(".fdate");
  if (!box) return;
  const hidden = box.querySelector<HTMLInputElement>('input[type="hidden"]')!;
  if (t.matches("[data-prec]")) {
    // switching precision keeps what is known: 2021-03-05 -> 2021-03 -> 2021;
    // going finer, the field starts empty and the old value stays until a new one is typed
    const prec = (t as HTMLSelectElement).value as Prec;
    const v = hidden.value;
    const kept = prec === "ano" ? v.slice(0, 4) : prec === "mes" && v.length >= 7 ? v.slice(0, 7) : v;
    hidden.value = kept;
    box.querySelector("[data-part]")!.outerHTML = partInput(prec, kept);
    box.querySelector<HTMLInputElement>("[data-part]")!.focus();
  }
});
document.addEventListener("input", (e) => {
  const t = e.target as HTMLInputElement;
  if (!t.matches?.(".fdate [data-part]")) return;
  const hidden = t.closest(".fdate")!.querySelector<HTMLInputElement>('input[type="hidden"]')!;
  const v = t.value.trim();
  hidden.value = t.type === "number" ? (/^\d{4}$/.test(v) ? v : v ? hidden.value : "") : v;
});

// "3 mar. 2021" for hints
const MONTHS = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
export function dateLabel(v: string) {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return [d && String(Number(d)), m && MONTHS[Number(m) - 1], y].filter(Boolean).join(" ");
}

// ── "rascunho" on pictures ──
// A drawing starts as a draft. The checkbox follows the type (desenho = on, foto = off)
// while it is "automatic" (data-auto: the picture has no draft decision saved and the box
// wasn't touched); once clicked, it keeps what was chosen.
export const draftChecked = (meta: { kind?: string; draft?: boolean }) =>
  meta.draft === true || (meta.draft === undefined && meta.kind === "desenho");
export const draftBox = (meta: { kind?: string; draft?: boolean }) =>
  `<label class="check draft-box" title="rascunho: continua no site, mas depois de todas as outras">
    <input type="checkbox" name="draft" ${draftChecked(meta) ? "checked" : ""} ${meta.draft === undefined ? "data-auto" : ""}> rascunho
  </label>`;
document.addEventListener("change", (e) => {
  const t = e.target as HTMLElement;
  if (t.matches('input[name="draft"]')) { delete (t as HTMLInputElement).dataset.auto; return; }
  if (!t.matches('select[name="kind"]')) return;
  const box = t.closest("form")?.querySelector<HTMLInputElement>('input[name="draft"][data-auto]');
  if (box) box.checked = (t as HTMLSelectElement).value === "desenho";
});
