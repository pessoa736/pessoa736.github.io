// Funções puras (sem fs/path) derivadas da GitHub API.
// Seguras pra Client e Server Components — não puxa node:* nem faz rede.
// Tudo que precisa de disco/rede continua em `github.ts` (server-only).

import { siteConfig } from "mySite/config/site";

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

export interface RepoDocs {
  /** Thumbnail principal. `docs/images/thumbnail/*` ou 1ª imagem em docs/. */
  thumbnail: string | null;
  /** Ícone pequeno. `docs/images/icon*` ou 1º arquivo em `docs/icons/`. */
  icon: string | null;
  /** Conteúdo bruto de `docs/description.md` (markdown). */
  description: string | null;
  /** Conteúdo parseado de `docs/setting.json`. */
  settings: RepoSettings | null;
  /** Lista bruta de nomes de arquivos em `docs/images/*` — útil pra debug. */
  imagesFound: string[];
}

export interface RepoSettings {
  featured?: boolean;
  area?: string;
  languageColor?: string;
  order?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface GhReadme {
  name: string;
  path: string;
  content: string;
  encoding: "base64";
  html_url: string;
  download_url: string | null;
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
 * Descrição canônica de um repo: prefere `docs/description.md` quando
 * preenchido, cai pra `repo.description` do GitHub. Útil pra cards e listas.
 */
export function repoDescription(r: GhRepo): string | null {
  return r.docs?.description ?? r.description ?? null;
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
