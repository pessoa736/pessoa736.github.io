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

export async function getAllRepos(): Promise<GhRepo[]> {
  const data = await fetchJson<GhRepo[]>(
    `${API}/users/${siteConfig.owner}/repos?per_page=100&sort=updated`,
  );
  return data.filter(
    (r) => !r.archived && !r.fork && r.name !== siteConfig.self.repoName,
  );
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

/** Resolve a URL da thumb. Mesma regra do código antigo: /images/projImg.png no gh-pages. */
export function ghPagesThumb(repo: GhRepo): string {
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

