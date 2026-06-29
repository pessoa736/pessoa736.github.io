"use client";

import { useEffect, useRef } from "react";

interface Props {
  gridStep?: number;
  markEvery?: number;
}

/**
 * Plano cartesiano sutil de fundo.
 *
 * - Linhas espaçadas de `gridStep`. Uma linha passa exatamente no meio
 *   (eixo principal), e a cada `markEvery` linhas há uma marcação maior.
 * - Desenhado em coordenadas nativas com pixel snap (+0.5) pra evitar
 *   anti-alias duplo nas linhas dos eixos.
 *
 * Tudo `pointer-events:none` pra não interferir com cliques do site.
 */
export default function CartesianAura({
  gridStep = 96,
  markEvery = 4,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const el = containerRef.current as HTMLDivElement | null;
    const cv = canvasRef.current as HTMLCanvasElement | null;
    if (!el || !cv) return;
    const cx = cv.getContext("2d", { alpha: true });
    if (!cx) return;

    const c: CanvasRenderingContext2D = cx;
    let mounted = true;

    function fgVar() {
      const s = getComputedStyle(document.documentElement);
      return s.getPropertyValue("--foreground").trim() || "#e9e9e9";
    }

    function resize(w: number, h: number) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv!.width = Math.floor(w * dpr);
      cv!.height = Math.floor(h * dpr);
      cv!.style.width = w + "px";
      cv!.style.height = h + "px";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let lastSize = { w: 0, h: 0 };
    let rafId = 0;

    function draw() {
      if (!mounted) return;
      const w = el!.clientWidth;
      const h = el!.clientHeight;
      if (w === 0 || h === 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      if (lastSize.w !== w || lastSize.h !== h) {
        resize(w, h);
        lastSize = { w, h };
      }
      const fg = fgVar();
      c.clearRect(0, 0, w, h);

      // Centro em pixel-snap (+0.5) pra alinhar linhas ímpares sem anti-alias duplo
      const midX = Math.round(w / 2) + 0.5;
      const midY = Math.round(h / 2) + 0.5;

      const minorAlpha = 0.018;
      const majorAlpha = 0.04;

      c.lineWidth = 1;

      // —— verticais ——
      for (let x = midX % gridStep; x <= w; x += gridStep) {
        if (x < 0) continue;
        const distFromCenter = Math.abs(x - midX);
        const isAxis = distFromCenter < 0.5;
        const isMajor = isAxis || distFromCenter % (gridStep * markEvery) < 0.5;
        c.strokeStyle = withAlpha(
          fg,
          isAxis ? 0.09 : isMajor ? majorAlpha : minorAlpha,
        );
        c.beginPath();
        c.moveTo(x + 0.5, 0);
        c.lineTo(x + 0.5, h);
        c.stroke();
      }
      // —— horizontais ——
      for (let y = midY % gridStep; y <= h; y += gridStep) {
        if (y < 0) continue;
        const distFromCenter = Math.abs(y - midY);
        const isAxis = distFromCenter < 0.5;
        const isMajor = isAxis || distFromCenter % (gridStep * markEvery) < 0.5;
        c.strokeStyle = withAlpha(
          fg,
          isAxis ? 0.09 : isMajor ? majorAlpha : minorAlpha,
        );
        c.beginPath();
        c.moveTo(0, y + 0.5);
        c.lineTo(w, y + 0.5);
        c.stroke();
      }

      // ponto de origem
      c.fillStyle = withAlpha(fg, 0.28);
      c.beginPath();
      c.arc(midX, midY, 1.4, 0, Math.PI * 2);
      c.fill();

      rafId = requestAnimationFrame(draw);
    }

    resize(el.clientWidth, el.clientHeight);
    lastSize = { w: el.clientWidth, h: el.clientHeight };
    rafId = requestAnimationFrame(draw);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [gridStep, markEvery]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

function withAlpha(color: string, alpha: number): string {
  const c = color.trim();
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((s) => s.trim());
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }
  return `rgba(255,255,255,${alpha})`;
}
