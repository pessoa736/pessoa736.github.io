// Configuração manual do site.
// Aqui mora tudo que é decisão humana, não automatizada pela GitHub API.

export const siteConfig = {
  owner: "pessoa736",

  // O repo do próprio portfólio. Tem slug próprio, não entra nas listas,
  // e tem rota dedicada com slug abaixo.
  self: {
    repoName: "pessoa736.github.io",
    slug: "sobre-este-site",
    title: "sobre este site",
    // caminho relativo gh-pages onde a thumbnail deveria estar, se existir
    thumbnail: "https://pessoa736.github.io/images/projImg.png",
  },

  // Quem aparece na vitrine da home (cartões grandes em "projetos").
  // Slug = nome do repo (igual vem da API). Ordem = ordem de exibição.
  featured: [
    "puddingMoon",
    "Mathmancer",
    "Pudim-Luarix",
    "Apollo-Hotel",
    "LogLua",
  ],

  // Bloco curto "no ar": GitHub Pages / Vercel / etc.
  // Se vazio, escondo a seção inteira. Aceita slugs com has_pages OU homepage preenchida.
  onAirSlugs: [
    "lifegameConway-react",
    "Apollo-Hotel",
    "Apollo-Hotel-front",
    "Super-Careca-Man",
    "roleta",
  ],

  // Mapa de área/relações por linguagem. Adiciono conforme puxo os repos.
  // As chaves têm que bater com o que a API do GitHub retorna em `language`.
  languageArea: {
    Lua: "linguagens",
    JavaScript: "front",
    TypeScript: "front",
    TSX: "front",
    JSX: "front",
    HTML: "front",
    CSS: "front",
    SCSS: "front",
    Python: "linguagens",
    C: "sistemas",
    "C++": "sistemas",
    Rust: "sistemas",
    Shell: "devops",
    Dockerfile: "devops",
  } as Record<string, string>,

  // Cor de destaque por linguagem (heurística conhecida, fallback cinza).
  languageColor: {
    Lua: "#000080",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    TSX: "#3178c6",
    JSX: "#f1e05a",
    Python: "#3572A5",
    C: "#555555",
    "C++": "#f34b7d",
    Rust: "#dea584",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Dockerfile: "#384d54",
  } as Record<string, string>,

  // Categorias visíveis no filtro de /projetos
  // "all" sempre presente. `badge` controla se a categoria aparece como tag nos cards.
  areas: ["front", "linguagens", "sistemas", "devops"] as const,
};
