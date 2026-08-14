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
 *   do documento, uma vez找我 a cada `markEvery` linhas há uma marcação maior.
 * - Desenhado em coordenadas nativas com pixel snap (+0.5) pra evitar
 *   anti-alias duplo nas linhas dos eixos.
 * - Redesenha no scroll, resize e mudança de tema — sem rAF loop.
 * - O centro do grid é relativo ao documento, não à viewport: quando você
 *   scrolla, o grid acompanha como se fosse parte do conteúdo.
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
    const el = containerRef.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;
    const cx = cv.getContext("2d", { alpha: true });
    if (!cx) return;
    const c: CanvasRenderingContext2D = cx;

    function fgVar() {
      const s = getComputedStyle(document.documentElement);
      return s.getPropertyValue("--foreground").trim() || "#e9e9e9";
    }

    function draw() {
      if (!el || !cv) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (vw === 0 || vh === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.floor(vw * dpr);
      cv.height = Math.floor(vh * dpr);
      cv.style.width = vw + "px";
      cv.style.height = vh + "px";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fg = fgVar();
      c.clearRect(0, 0, vw, vh);

      // O centro do grid é relativo ao documento (não à viewport).
      // Compensa o scrollY pra que o eixo principal fique no meio do
      // documento, não no meio do que você tá vendo.
      const scrollY = window.scrollY;
      const docMidY = (document.documentElement.scrollHeight) / 2;
      const midX = Math.round(vw / 2) + 0.5;
      // Offset do centro do documento relativo ao topo da viewport:
      const midYOffset = docMidY - scrollY;

      // Alinha o eixo Y no centro do documento (que pode estar fora da
      // viewport em páginas altas — linhas seguem normais a partir dele).
      const midY = Math.round(midYOffset) + 0.5;

      const minorAlpha = 0.018;
      const majorAlpha = 0.04;

      c.lineWidth = 1;

      // —— verticais ——
      for (let x = midX % gridStep; x <= vw; x += gridStep) {
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
        c.lineTo(x + 0.5, vh);
        c.stroke();
      }
      // —— horizontais ——
      // Começa do centro do documento e expande pra cobrir a viewport.
      const topY = midY - Math.ceil(midY / gridStep) * gridStep;
      for (let y = topY; y <= vh; y += gridStep) {
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
        c.lineTo(vw, y + 0.5);
        c.stroke();
      }

      // ponto de origem (só se estiver visível na viewport)
      if (midY >= 0 && midY <= vh) {
        c.fillStyle = withAlpha(fg, 0.28);
        c.beginPath();
        c.arc(midX, midY, 1.4, 0, Math.PI * 2);
        c.fill();
      }
    }

    let rafScheduled = false;
    function scheduleDraw() {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => {
        rafScheduled = false;
        draw();
      });
    }

    draw();

    // Redesenha no scroll, resize e mudança de tema.
    window.addEventListener("scroll", scheduleDraw, { passive: true });
    window.addEventListener("resize", scheduleDraw);

    const themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          scheduleDraw();
          return;
        }
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("scroll", scheduleDraw);
      window.removeEventListener("resize", scheduleDraw);
      themeObserver.disconnect();
    };
  }, [gridStep, markEvery]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none box-ghost fixed inset-0 z-0"
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
