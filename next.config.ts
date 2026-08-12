import type { NextConfig } from "next";

// Termux/Android não tem bindings nativos do Turbopack — o next cai pra WASM,
// que quebra em `turbo.createProject`. Por isso o script `dev` usa
// `next dev --webpack` aqui.
//
// `output: 'export'` gera HTML/CSS/JS 100% estático em `out/`. Sem server
// runtime, sem ISR, sem API routes. Ideal pra GitHub Pages. As rotas deixam
// de fazer fetch em runtime: tudo é prerenderizado no build (com fallback
// pro cache em `.cache/repos.json` populado por `npm run enrich-docs`).
const nextConfig: NextConfig = {
  output: "export",
  images: {
    // `output: 'export'` não tem server runtime pra otimizar imagens.
    // `next/image` exige `unoptimized: true` nesse modo.
    unoptimized: true,
  },
};

export default nextConfig;
