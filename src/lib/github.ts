// Helper central para falar com a GitHub API.
// Cacheia em memória pelo tempo da sessão pra evitar rate-limit.
// `next: { revalidate: 3600 }` chama o cache do Next quando em Route/Page server.

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
  /** Extraído da pasta `docs/` do repositório (best-effort). */
  docs?: RepoDocs | null;
}

/**
 * Conteúdo enriquecido vindo da pasta `docs/` do repositório.
 *
 * Contrato esperado em cada repo:
 *   docs/images/thumbnail/*    → primeiro arquivo encontrado vira `thumbnail`
 *   docs/images/icon*          → primeiro "icon*" vira `icon`
 *   docs/icons/*               → fallback de ícone
 *   docs/description.md        → se existir, sobrescreve `repo.description`
 *   docs/setting.json          → overrides de exibição (featured/area/color…)
 *
 * Se um arquivo específico não existir, a busca cai pra "qualquer imagem em
 * docs/" como fallback flexível.
 */
export interface RepoDocs {
  thumbnail: string | null;
  icon: string | null;
  description: string | null;
  settings: RepoSettings | null;
  /** Lista bruta de nomes de arquivos em `docs/images/*` — útil pra debug. */
  imagesFound: string[];
}

/** Conteúdo parseado de `docs/setting.json` (todos os campos opcionais). */
export interface RepoSettings {
  featured?: boolean;
  area?: string;
  languageColor?: string;
  order?: number;
  tags?: string[];
  [key: string]: unknown;
}

interface CacheEntry<T> { ts: number; data: T }
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

// — helpers de baixo nível pra navegar `docs/` sem estourar rate-limit —

/** Formatos de imagem aceitos como thumbs/icons (case-insensitive). */
const IMG_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

/** Lê o conteúdo de `docs/<path>` num repo. Retorna `null` se 404. */
async function fetchDocsFile(
  owner: string,
  repo: string,
  path: string,
): Promise<{ content: string; download_url: string | null } | null> {
  try {
    const file = await fetchJson<{
      content: string;
      download_url: string | null;
    }>(`${API}/repos/${owner}/${repo}/contents/docs/${path}`);
    return file;
  } catch {
    return null;
  }
}

/** Lista o conteúdo de uma pasta em `docs/`. Retorna `[]` se 404. */
async function listDocsDir(
  owner: string,
  repo: string,
  folder: string,
): Promise<{ name: string; download_url: string | null; type: string }[]> {
  try {
    return await fetchJson<
      { name: string; download_url: string | null; type: string }[]
    >(`${API}/repos/${owner}/${repo}/contents/docs/${folder}`);
  } catch {
    return [];
  }
}

/**
 * Extrai da pasta `docs/`:
 *   - thumbnail: `docs/images/thumbnail/*` ou cai pra primeira imagem em docs/
 *   - icon: `docs/images/icon*` ou `docs/icons/*` (primeiro)
 *   - description: `docs/description.md` (decodificado)
 *   - settings: `docs/setting.json` (parseado)
 *
 * Best-effort: nunca lança. Repos sem `docs/` recebem `null`.
 */
export async function fetchRepoDocs(
  owner: string,
  repo: string,
): Promise<RepoDocs | null> {
  // blindagem: qualquer falha de rede aqui retorna null em vez de jogar
  // pra fora (quebraria o enrich loop e a página inteira).
  let imgs: Awaited<ReturnType<typeof listDocsDir>> = [];
  let iconsRoot: Awaited<ReturnType<typeof listDocsDir>> = [];
  let descFile: Awaited<ReturnType<typeof fetchDocsFile>> = null;
  let settingFile: Awaited<ReturnType<typeof fetchDocsFile>> = null;
  try {
    [imgs, iconsRoot, descFile, settingFile] = await Promise.all([
      listDocsDir(owner, repo, "images"),
      listDocsDir(owner, repo, "icons"),
      fetchDocsFile(owner, repo, "description.md"),
      fetchDocsFile(owner, repo, "setting.json"),
    ]);
  } catch {
    return null;
  }

  // — thumbnail —
  // prioridade: docs/images/thumbnail/* (qualquer extensão/nome)
  let thumbnail: string | null = null;
  const thumbDir = imgs.find(
    (e) => e.type === "dir" && e.name.toLowerCase() === "thumbnail",
  );
  if (thumbDir) {
    const thumbImgs = await listDocsDir(owner, repo, "images/thumbnail");
    const first = thumbImgs.find((e) => e.type === "file" && IMG_EXT.test(e.name));
    if (first?.download_url) thumbnail = first.download_url;
  }
  // fallback: primeira imagem em docs/images/
  if (!thumbnail) {
    const firstImg = imgs.find(
      (e) => e.type === "file" && IMG_EXT.test(e.name),
    );
    if (firstImg?.download_url) thumbnail = firstImg.download_url;
  }

  // — icon —
  let icon: string | null = null;
  const iconImg =
    imgs.find((e) => e.type === "file" && /^icon/i.test(e.name)) ||
    iconsRoot.find((e) => e.type === "file" && IMG_EXT.test(e.name));
  if (iconImg?.download_url) icon = iconImg.download_url;

  // — description.md —
  let description: string | null = null;
  if (descFile?.content) {
    try {
      description = decodeBase64Utf8(descFile.content).trim();
    } catch {
      description = null;
    }
  }

  // — setting.json —
  let settings: RepoSettings | null = null;
  if (settingFile?.content) {
    try {
      const raw = decodeBase64Utf8(settingFile.content);
      const parsed = JSON.parse(raw);
      // valida que é objeto não-array
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        settings = parsed as RepoSettings;
      }
    } catch {
      settings = null;
    }
  }

  // se tudo for null e as duas listas vazias, repo não tem pasta docs/ útil
  const nothingUseful =
    !thumbnail &&
    !icon &&
    !description &&
    !settings &&
    imgs.length === 0 &&
    iconsRoot.length === 0;
  if (nothingUseful) return null;

  return {
    thumbnail,
    icon,
    description,
    settings,
    imagesFound: imgs.map((e) => e.name),
  };
}

/**
 * Promise.all com concurrency limit. Evita estourar rate-limit ao enriquecer
 * muitos repos por vez.
 */
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function getAllRepos(opts?: {
  /** Quando true, enriquece cada repo com info de `docs/`. Default: false. */
  withDocs?: boolean;
}): Promise<GhRepo[]> {
  const withDocs = opts?.withDocs === true;
  let data: GhRepo[];
  try {
    data = await fetchJson<GhRepo[]>(
      `${API}/users/${siteConfig.owner}/repos?per_page=100&sort=updated`,
    );
  } catch (e) {
    // Fallback: rede falha (rate-limit 403/429, sem connectivity). Usa o
    // backup local `reposLocal.json` se existir e não estiver vazio.
    const fallback = loadLocalRepos();
    if (fallback.length) {
      return applyFiltersAndSort(fallback, withDocs);
    }
    // Sem nada: propaga o erro pra página mostrar "GitHub indisponível"
    // em vez de site silenciosamente vazio.
    throw e;
  }
  return applyFiltersAndSort(data, withDocs);
}

/** Aplica blacklist/filtros/hasReadme/sort a uma lista já carregada. */
async function applyFiltersAndSort(
  data: GhRepo[],
  withDocs: boolean,
): Promise<GhRepo[]> {
  const blacklist = new Set(siteConfig.blacklist);
  const filtered = data.filter(
    (r) =>
      !r.archived &&
      !r.fork &&
      r.name !== siteConfig.self.repoName &&
      !blacklist.has(r.name),
  );

  // Enriquece cada repo com info vinda de `docs/` apenas se o caller pediu.
  // Concurrency limit 6 pra não estourar rate-limit não-autenticado. Falhas
  // viram `docs: null` e não derrubam a página.
  const enriched = withDocs
    ? await mapWithLimit(filtered, 6, async (r) => {
        try {
          const docs = await fetchRepoDocs(siteConfig.owner, r.name);
          return docs ? { ...r, docs } : r;
        } catch {
          return r;
        }
      })
    : filtered;

  // Ordena: quem tem README vem antes, mantendo a ordem original (updated) dentro de cada grupo.
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

/**
 * Recupera `docs/` enriquecido de um único repo. Útil pra página
 * `/projetos/[slug]` que precisa de detalhes ricos de UM projeto só.
 * Best-effort: retorna `null` em qualquer falha (rede, 404, JSON inválido).
 *
 * NOTA: essa função FAZ rede. Pra leitura **só do cache** sem rede
 * (recomendado em build estático), importe `getRepoDocsCached` diretamente
 * de `mySite/lib/repoDocsCache` (este módulo é server-only — não pode ser
 * usado em componentes client).
 */
export async function getRepoDocs(repo: string): Promise<RepoDocs | null> {
  try {
    return await fetchRepoDocs(siteConfig.owner, repo);
  } catch {
    return null;
  }
}

/**
 * Descrição canônica de um repo: prefere `docs/description.md` quando
 * preenchido, cai pra `repo.description` do GitHub. Útil pra cards e listas.
 */
export function repoDescription(r: GhRepo): string | null {
  return r.docs?.description ?? r.description ?? null;
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
 * Resolve a URL da thumb. Ordem de prioridade:
 *   1. `docs.images.thumbnail/*` ou primeira imagem em `docs/` (já preenchido
 *      em `repo.docs.thumbnail` por `fetchRepoDocs`)
 *   2. Regra antiga: `/images/projImg.png` no gh-pages do repo
 *   3. Self-repo → `/images/projImg.png` local
 */
export function ghPagesThumb(repo: GhRepo): string {
  if (repo.docs?.thumbnail) return repo.docs.thumbnail;
  if (repo.name === siteConfig.self.repoName) return "/images/projImg.png";
  return `https://${siteConfig.owner}.github.io/${repo.name}/images/projImg.png`;
}

export function projectSlug(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, "-");
}

/**
 * Renderiza markdown cru no HTML oficial do GitHub.
 * Reaproveita o mesmo renderizador que o site deles usa nos READMEs.
 * Retorna HTML string sanitizado pelo backend do GitHub.
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

