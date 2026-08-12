// Helper central para falar com a GitHub API.
// SERVER-ONLY: usa node:fs e node:path (cache em disco). NÃO importar em
// Client Components — pra isso use `mySite/lib/github-utils` (puro, sem I/O).
//
// Reexporta tipos/funções puras de github-utils pra manter compat com callers
// existentes que ainda importam de "mySite/lib/github".

import { siteConfig } from "mySite/config/site";
import fs from "node:fs";
import nodePath from "node:path";
import reposLocal from "./reposLocal.json";

// Reexporta o que é puro (Client-safe) pra callers legados não quebrarem.
export {
  type GhRepo,
  type RepoDocs,
  type RepoSettings,
  type GhReadme,
  ghPagesThumb,
  projectSlug,
  repoDescription,
  decodeBase64Utf8,
} from "./github-utils";
import type { GhRepo, RepoDocs, RepoSettings, GhReadme } from "./github-utils";

const API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN; // opcional, aumenta rate-limit

interface CacheEntry<T> { ts: number; data: T }
const cache = new Map<string, CacheEntry<unknown>>();
const TTL = 1000 * 60 * 10; // 10 min

// — helpers de baixo nível pra navegar `docs/` sem estourar rate-limit —

/**
 * Cache em disco da lista de repos, em `.cache/repos.json`.
 * `getAllRepos()` lê daqui primeiro; só faz rede se o cache não existir
 * OU se `NO_CACHE=1` estiver setado. Em build estática (output: 'export')
 * isso reduz N fetches por página pra 1 fetch por build inteiro.
 */
function cacheReposPath(): string {
  // Server-only. Em Client Components este módulo não roda.
  return nodePath.join(process.cwd(), ".cache", "repos.json");
}

function tryReadReposCache(): GhRepo[] | null {
  try {
    const file = cacheReposPath();
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as { repos?: GhRepo[] };
    return Array.isArray(parsed?.repos) && parsed.repos.length
      ? parsed.repos
      : null;
  } catch {
    return null;
  }
}

function tryWriteReposCache(repos: GhRepo[]): void {
  try {
    const file = cacheReposPath();
    const dir = nodePath.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      file,
      JSON.stringify({ _cachedAt: new Date().toISOString(), repos }, null, 2),
      "utf8",
    );
  } catch {
    /* best-effort */
  }
}

/** Formatos de imagem aceitos como thumbs/icons (case-insensitive). */
const IMG_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

async function fetchJson<T>(url: string): Promise<T> {
  const hit = cache.get(url) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    // No modo output: 'export' o Next ignora `next.revalidate` (sem ISR).
    // Mantém só cache em memória por sessão (TTL acima) e disco (tryWriteReposCache).
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  const data = (await res.json()) as T;
  cache.set(url, { ts: Date.now(), data });
  return data;
}

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

/** Best-effort: nunca lança. Repos sem `docs/` recebem `null`. */
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
  let thumbnail: string | null = null;
  const thumbDir = imgs.find(
    (e) => e.type === "dir" && e.name.toLowerCase() === "thumbnail",
  );
  if (thumbDir) {
    const thumbImgs = await listDocsDir(owner, repo, "images/thumbnail");
    const first = thumbImgs.find((e) => e.type === "file" && IMG_EXT.test(e.name));
    if (first?.download_url) thumbnail = first.download_url;
  }
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
      description = Buffer.from(
        descFile.content.replace(/\s/g, ""),
        "base64",
      ).toString("utf8").trim();
    } catch {
      description = null;
    }
  }

  // — setting.json —
  let settings: RepoSettings | null = null;
  if (settingFile?.content) {
    try {
      const raw = Buffer.from(
        settingFile.content.replace(/\s/g, ""),
        "base64",
      ).toString("utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        settings = parsed as RepoSettings;
      }
    } catch {
      settings = null;
    }
  }

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

export async function getAllRepos(): Promise<GhRepo[]> {
  // 1) Cache em disco (.cache/repos.json) — 0 rede na build se já populado.
  //    Populado por npm run enrich-docs (ou automaticamente na 1ª chamada).
  if (process.env.NO_CACHE !== "1") {
    const cached = tryReadReposCache();
    if (cached) return applyFiltersAndSort(cached);
  }

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
      return applyFiltersAndSort(fallback);
    }
    // Sem nada: propaga o erro pra página mostrar "GitHub indisponível"
    // em vez de site silenciosamente vazio.
    throw e;
  }
  // Salvou no disco pra próximas chamadas da mesma build não refazer fetch.
  tryWriteReposCache(data);
  return applyFiltersAndSort(data);
}

/** Aplica blacklist/filtros/sort a uma lista já carregada. Não faz rede. */
function applyFiltersAndSort(data: GhRepo[]): GhRepo[] {
  const blacklist = new Set(siteConfig.blacklist);
  const filtered = data.filter(
    (r) =>
      !r.archived &&
      !r.fork &&
      r.name !== siteConfig.self.repoName &&
      !blacklist.has(r.name),
  );

  // Ordena por `pushed_at` (desc) — já vem da API em `sort=updated`. Sem rede.
  // Antes isso fazia 1 fetch por repo só pra checar "tem README?"; pra um
  // site estático isso era ~30 fetches extras por chamada de getAllRepos().
  return filtered.sort(
    (a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at),
  );
}

/** Carrega a lista de backup de `reposLocal.json`. Retorna [] se falhar. */
function loadLocalRepos(): GhRepo[] {
  return Array.isArray(reposLocal?.repos) ? reposLocal.repos : [];
}

/**
 * Recupera `docs/` enriquecido de um único repo. Útil pra página
 * `/projetos/[slug]` que precisa de detalhes ricos de UM projeto só.
 * Best-effort: retorna `null` em qualquer falha (rede, 404, JSON inválido).
 *
 * NOTA: essa função FAZ rede. Pra leitura **só do cache** sem rede
 * (recomendado em build estático), importe `getRepoDocsCached` diretamente
 * de `mySite/lib/repoDocsCache`.
 */
export async function getRepoDocs(repo: string): Promise<RepoDocs | null> {
  try {
    return await fetchRepoDocs(siteConfig.owner, repo);
  } catch {
    return null;
  }
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
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub markdown ${res.status}`);
  return await res.text();
}
