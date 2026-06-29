// Helper central para falar com a GitHub API.
// Cacheia em memória pelo tempo da sessão pra evitar rate-limit.
// `next: { revalidate: 3600 }` chama o cache do Next quando em Route/Page server.
//
// Estratégia de assets por repo:
//   - Se `has_pages === true`: procura em `public/` (servido pelo gh-pages
//     em `https://<owner>.github.io/<repo>/<path>`).
//   - Caso contrário: procura em `docs/` (acessível só via GitHub API).
//   Em qualquer um dos dois, suporta:
//     public/thumbnail/* (ou docs/images/thumbnail/*)   → thumb do card
//     public/icon*       (ou docs/images/icon*    ou docs/icons/*)   → ícone
//     outras imagens                                  → gallery na slug page
//     description.md                                  → markdown descritivo
//     setting.json                                    → overrides (featured/area/color/tags/…)

import { siteConfig } from "mySite/config/site";

const API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN; // opcional, aumenta rate-limit

export interface GhRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  has_pages: boolean;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  archived: boolean;
  fork: boolean;
  default_branch: string;
  /** Preenchido se `getAllRepos({withAssets: true})` foi chamado. */
  assets?: RepoAssets | null;
}

/**
 * Assets de um repo. Para projetos com `has_pages`, a fonte primária é a
 * pasta `public/` (servida em gh-pages). Para projetos sem Pages, a fonte
 * primária é a pasta `docs/`.
 */
export interface RepoAssets {
  /** Thumb do card. Primeiro arquivo encontrado em thumbnail/, ou 1ª img na pasta. */
  thumb: string | null;
  /** Ícone pequeno. `icon*` na raiz de `images/` ou em `icons/`. */
  icon: string | null;
  /** Demais imagens. Exibidas como galeria no topo do slug page. */
  gallery: string[];
  /** Conteúdo (markdown) de `description.md`. */
  description: string | null;
  /** JSON parseado de `setting.json`. */
  settings: RepoSettings | null;
  /** `'pages'` se os assets vieram de `public/`, `'docs'` se de `docs/`. */
  source: "pages" | "docs" | null;
}

/** Conteúdo parseado de `setting.json` (todos os campos opcionais). */
export interface RepoSettings {
  featured?: boolean;
  area?: string;
  languageColor?: string;
  order?: number;
  tags?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

interface CacheEntry<T> {
  ts: number;
  data: T;
}
const cache = new Map<string, CacheEntry<unknown>>();
const TTL = 1000 * 60 * 10; // 10 min

async function fetchJson<T>(url: string): Promise<T> {
  const hit = cache.get(url) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  const data = (await res.json()) as T;
  cache.set(url, { ts: Date.now(), data });
  return data;
}

// — helpers de baixo nível —

/** Formatos de imagem aceitos como thumbs/icons/gallery (case-insensitive). */
const IMG_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/** Constrói a URL pública de um arquivo servidos via gh-pages. */
export function ghPagesUrl(
  owner: string,
  repo: string,
  path: string,
): string {
  // sem barra inicial pra evitar doubling
  const clean = path.replace(/^\/+/, "");
  return `https://${owner}.github.io/${repo}/${clean}`;
}

/** Lista o conteúdo de uma pasta arbitrária (`docs/…` ou `public/…`). 404 → []. */
async function listFolder(
  owner: string,
  repo: string,
  folder: string,
): Promise<{ name: string; path: string; download_url: string | null; type: string }[]> {
  try {
    return await fetchJson<
      { name: string; path: string; download_url: string | null; type: string }[]
    >(`${API}/repos/${owner}/${repo}/contents/${folder}`);
  } catch {
    return [];
  }
}

/** Lê o conteúdo (base64) de um arquivo em `docs/` ou `public/`. 404 → null. */
async function readFile(
  owner: string,
  repo: string,
  folder: string,
  path: string,
): Promise<{ content: string; download_url: string | null } | null> {
  try {
    return await fetchJson<{ content: string; download_url: string | null }>(
      `${API}/repos/${owner}/${repo}/contents/${folder}/${path}`,
    );
  } catch {
    return null;
  }
}

function decodeBase64(input: string): string {
  const clean = input.replace(/\s/g, "");
  if (typeof Buffer !== "undefined") {
    return Buffer.from(clean, "base64").toString("utf8");
  }
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

/**
 * Resolve thumb+icon+gallery+description+settings de UM repo.
 *
 * Origem primária dos assets:
 *   - projects COM `has_pages` → pasta `public/` (URLs servidas por gh-pages)
 *   - projects SEM pages       → pasta `docs/`    (URLs via GitHub raw)
 *
 * Em ambos os casos, os arquivos-alvo são:
 *   thumbnail/* (em public/) ou images/thumbnail/* (em docs/), images/* (em docs/)
 *   icon* (em public/), icon* (em images/), ou icons/*
 *   description.md
 *   setting.json
 *
 * Best-effort: nunca lança. Retorna `null` se repo não tem pasta útil.
 */
export async function fetchRepoAssets(
  owner: string,
  repo: string,
  hasPages: boolean,
): Promise<RepoAssets | null> {
  const folder = hasPages ? "public" : "docs";
  const imagesFolder = hasPages ? "public/images" : "docs/images";
  const useGhPagesUrl = hasPages;

  // Helper: converte um entry de listFolder numa URL absoluta servida
  // (gh-pages URL se source=pages; caso contrário, mantém o download_url da API).
  const urlFor = (
    entry: { download_url: string | null; path: string },
  ): string => {
    if (useGhPagesUrl && entry.download_url) {
      // download_url da API para public/ aponta pro raw — não serve. Precisamos
      // construir a URL do gh-pages: tirar "public/" do path e prefixar owner/repo.
      const relPath = entry.path.replace(/^public\//, "");
      return ghPagesUrl(owner, repo, relPath);
    }
    return entry.download_url ?? "";
  };

  // 1) Listar imagens E description + setting em paralelo
  let imgs: Awaited<ReturnType<typeof listFolder>> = [];
  let iconsRoot: Awaited<ReturnType<typeof listFolder>> = [];
  let descFile: Awaited<ReturnType<typeof readFile>> = null;
  let settingFile: Awaited<ReturnType<typeof readFile>> = null;
  try {
    [imgs, iconsRoot, descFile, settingFile] = await Promise.all([
      listFolder(owner, repo, imagesFolder),
      listFolder(owner, repo, hasPages ? "public/icons" : "docs/icons"),
      readFile(owner, repo, folder, "description.md"),
      readFile(owner, repo, folder, "setting.json"),
    ]);
  } catch {
    return null;
  }

  // 2) Thumbnail — pasta dedicada primeiro
  let thumb: string | null = null;
  const thumbDirEntry = imgs.find(
    (e) => e.type === "dir" && e.name.toLowerCase() === "thumbnail",
  );
  if (thumbDirEntry) {
    const subFolder = hasPages
      ? "public/images/thumbnail"
      : "docs/images/thumbnail";
    const thumbImgs = await listFolder(owner, repo, subFolder);
    const first = thumbImgs.find((e) => e.type === "file" && IMG_EXT.test(e.name));
    if (first) thumb = urlFor(first);
  }
  // fallback: 1ª imagem em images/
  if (!thumb) {
    const firstImg = imgs.find((e) => e.type === "file" && IMG_EXT.test(e.name));
    if (firstImg) thumb = urlFor(firstImg);
  }

  // 3) Icon — `icon*` em images/ ou 1º arquivo em icons/
  let icon: string | null = null;
  const iconInImages = imgs.find(
    (e) => e.type === "file" && /^icon/i.test(e.name) && IMG_EXT.test(e.name),
  );
  const iconInIcons = iconsRoot.find(
    (e) => e.type === "file" && IMG_EXT.test(e.name),
  );
  const pickedIcon = iconInImages ?? iconInIcons;
  if (pickedIcon) icon = urlFor(pickedIcon);

  // 4) Gallery — todas as imagens que NÃO são thumb usada nem icon
  const thumbPath = imgs.find((e) => urlFor(e) === thumb)?.path ?? null;
  const iconPath = pickedIcon?.path ?? null;
  const gallery: string[] = [];
  for (const e of imgs) {
    if (e.type !== "file" || !IMG_EXT.test(e.name)) continue;
    if (thumbPath && e.path === thumbPath) continue;
    if (iconPath && e.path === iconPath) continue;
    const u = urlFor(e);
    if (u) gallery.push(u);
  }
  // também varrer arquivos na raiz da pasta (caso public/) de fora de images/
  if (hasPages) {
    const root = await listFolder(owner, repo, "public");
    for (const e of root) {
      if (e.type !== "file" || !IMG_EXT.test(e.name)) continue;
      if (/^icon/i.test(e.name)) continue; // já considerado
      const u = urlFor(e);
      if (u && !gallery.includes(u)) gallery.push(u);
    }
  }

  // 5) description.md e setting.json
  let description: string | null = null;
  if (descFile?.content) {
    try {
      description = decodeBase64(descFile.content).trim();
    } catch {
      description = null;
    }
  }

  let settings: RepoSettings | null = null;
  if (settingFile?.content) {
    try {
      const raw = decodeBase64(settingFile.content);
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        settings = parsed as RepoSettings;
      }
    } catch {
      settings = null;
    }
  }

  // Se nada retornou útil, diz que não tem assets
  const nothingUseful =
    !thumb &&
    !icon &&
    gallery.length === 0 &&
    !description &&
    !settings &&
    imgs.length === 0 &&
    iconsRoot.length === 0;
  if (nothingUseful) return null;

  return {
    thumb,
    icon,
    gallery,
    description,
    settings,
    source: hasPages ? "pages" : "docs",
  };
}

/**
 * `Promise.all` com concurrency limit. Evita estourar rate-limit ao
 * enriquecer muitos repos em série.
 */
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const i = idx++;
        if (i >= items.length) return;
        out[i] = await fn(items[i]);
      }
    },
  );
  await Promise.all(workers);
  return out;
}

export async function getAllRepos(opts?: {
  /**
   * Quando true, enriquece cada repo com `assets` (thumb/icon/gallery/
   * description/settings) lendo de `public/` (se has_pages) ou `docs/`.
   * Default: false — preserva compatibilidade e não estoura build.
   */
  withAssets?: boolean;
}): Promise<GhRepo[]> {
  const withAssets = opts?.withAssets === true;
  let data: GhRepo[];
  try {
    data = await fetchJson<GhRepo[]>(
      `${API}/users/${siteConfig.owner}/repos?per_page=100&sort=updated`,
    );
  } catch (e) {
    const fallback = loadLocalRepos();
    if (fallback.length) {
      return applyFiltersAndSort(fallback, withAssets);
    }
    throw e;
  }
  return applyFiltersAndSort(data, withAssets);
}

/** Aplica blacklist/filtros/enrich/sort a uma lista já carregada. */
async function applyFiltersAndSort(
  data: GhRepo[],
  withAssets: boolean,
): Promise<GhRepo[]> {
  const blacklist = new Set(siteConfig.blacklist);
  const filtered = data.filter(
    (r) =>
      !r.archived &&
      !r.fork &&
      r.name !== siteConfig.self.repoName &&
      !blacklist.has(r.name),
  );

  const enriched = withAssets
    ? await mapWithLimit(filtered, 6, async (r) => {
        try {
          const assets = await fetchRepoAssets(
            siteConfig.owner,
            r.name,
            r.has_pages,
          );
          return assets ? { ...r, assets } : r;
        } catch {
          return r;
        }
      })
    : filtered;

  const withReadme = await Promise.all(
    enriched.map(async (r) => {
      try {
        await fetchJson(`${API}/repos/${siteConfig.owner}/${r.name}/readme`);
        return { repo: r, hasReadme: true };
      } catch {
        return { repo: r, hasReadme: false };
      }
    }),
  );

  return withReadme
    .sort((a, b) => Number(b.hasReadme) - Number(a.hasReadme))
    .map((x) => x.repo);
}

/** Carrega a lista de backup de `reposLocal.json`. Retorna [] se falhar. */
function loadLocalRepos(): GhRepo[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const local = require("./reposLocal.json") as {
      repos?: GhRepo[];
    };
    return Array.isArray(local?.repos) ? local.repos : [];
  } catch {
    return [];
  }
}

export interface GhReadme {
  name: string;
  path: string;
  content: string;
  encoding: "base64";
  html_url: string;
  download_url: string | null;
}

export async function getRepoReadme(repo: string): Promise<GhReadme | null> {
  try {
    return await fetchJson<GhReadme>(
      `${API}/repos/${siteConfig.owner}/${repo}/readme`,
    );
  } catch {
    return null;
  }
}

export function decodeBase64Utf8(input: string): string {
  return decodeBase64(input);
}

/** Slug seguro de URL a partir do nome do repo. */
export function projectSlug(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, "-");
}

/**
 * Resolve a URL final do thumb pra um repo.
 * Ordem:
 *   1. `assets.thumb` (se getAllRepos foi chamado com `withAssets: true`)
 *   2. fallback SELF-repo (este próprio site) → /images/projImg.png local
 *   3. fallback gh-pages → https://<owner>.github.io/<repo>/images/projImg.png
 *
 * NOTA: atualizar callers pra usar `assets.thumb` diretamente quando possível.
 */
export function ghPagesThumb(repo: GhRepo): string {
  if (repo.assets?.thumb) return repo.assets.thumb;
  if (repo.name === siteConfig.self.repoName) return "/images/projImg.png";
  return `https://${siteConfig.owner}.github.io/${repo.name}/images/projImg.png`;
}

/**
 * Descrição canônica: prefere `assets.description`, cai pra `repo.description`.
 */
export function repoDescription(r: GhRepo): string | null {
  return r.assets?.description ?? r.description ?? null;
}

/**
 * Renderiza markdown cru no HTML oficial do GitHub. Reaproveita o mesmo
 * renderizador que o site deles usa nos READMEs. Retorna HTML string
 * sanitizado pelo backend do GitHub.
 */
export async function renderMarkdown(raw: string): Promise<string> {
  const res = await fetch(`${API}/markdown`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ mode: "gfm", text: raw }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GitHub markdown ${res.status}`);
  return await res.text();
}
