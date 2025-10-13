/**
 * Utilitários para detectar se a página/cliente atual é um dispositivo móvel.
 *
 * Uso recomendado:
 * - Em componentes client: useIsMobile() ou isMobileClient()
 * - Em componentes/rotas server (App Router): isMobileFromHeaders(headers())
 */

export const MOBILE_MAX_WIDTH = 900; // px ~ tablets pequenos para baixo

/**
 * Verifica se um user-agent pertence a um dispositivo móvel.
 */
export function isMobileUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  const re = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Opera Mini|IEMobile/i;
  return re.test(ua);
}

/**
 * Tenta detectar por viewport (apenas no client).
 */
export function isMobileByViewport(maxWidth: number = MOBILE_MAX_WIDTH): boolean {
  if (typeof window === "undefined") return false;
  // matchMedia é mais confiável que window.innerWidth para CSS-like queries
  if (typeof window.matchMedia === "function") {
    return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
  }
  return window.innerWidth <= maxWidth;
}

/**
 * Detecta no client usando userAgent e/ou viewport.
 */
export function isMobileClient(maxWidth: number = MOBILE_MAX_WIDTH): boolean {
  if (typeof navigator !== "undefined") {
    if (isMobileUserAgent(navigator.userAgent)) return true;
  }
  return isMobileByViewport(maxWidth);
}

/**
 * Detecta em ambiente server a partir de Headers (Next.js App Router).
 * Aceita tanto Web Headers quanto objetos de headers (Node/Edge).
 */
export function isMobileFromHeaders(
  headersLike:
    | Headers
    | Record<string, string | string[] | undefined>
    | { get(name: string): string | null }
): boolean {
  let ua: string | null | undefined = null;

  // Web Headers ou qualquer objeto com get(name)
  if (headersLike && typeof (headersLike as any).get === "function") {
    try {
      ua = (headersLike as any).get("user-agent");
    } catch {
      ua = null;
    }
  } else if (headersLike && typeof headersLike === "object") {
    const lowerKeys = Object.keys(headersLike).reduce<Record<string, any>>((acc, k) => {
      acc[k.toLowerCase()] = (headersLike as any)[k];
      return acc;
    }, {});
    const val = lowerKeys["user-agent"];
    if (Array.isArray(val)) ua = val[0];
    else ua = val ?? null;
  }

  return isMobileUserAgent(ua);
}

/**
 * Hook para client components: retorna true/false com fallback inicial opcional.
 * Observação: use este hook apenas em Client Components (arquivos com "use client").
 */
import { useEffect, useState } from "react";

export function useIsMobile(initial?: boolean, maxWidth: number = MOBILE_MAX_WIDTH): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window === "undefined" ? Boolean(initial) : isMobileClient(maxWidth)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);

    const update = () => setIsMobile(isMobileClient(maxWidth));
    update();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      window.addEventListener("orientationchange", update);
      window.addEventListener("resize", update);
      return () => {
        mql.removeEventListener("change", update);
        window.removeEventListener("orientationchange", update);
        window.removeEventListener("resize", update);
      };
    } else if (typeof (mql as any).addListener === "function") {
      (mql as any).addListener(update);
      window.addEventListener("orientationchange", update);
      window.addEventListener("resize", update);
      return () => {
        (mql as any).removeListener(update);
        window.removeEventListener("orientationchange", update);
        window.removeEventListener("resize", update);
      };
    }

    return;
  }, [maxWidth]);

  return isMobile;
}
