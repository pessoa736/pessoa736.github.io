// Cache persistente de assets por repo, em `.cache/repo-docs/<owner>--<repo>.json`.
//
// IMPORTANTE: este módulo usa `node:fs` e SÓ roda no servidor.

import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { RepoAssets } from "./github";
import { siteConfig } from "mySite/config/site";

const REPO_ASSETS_DIR = path.join(process.cwd(), ".cache", "repo-docs");

/** Caminho do arquivo de cache pra um repo específico. */
function pathFor(owner: string, repo: string): string {
  return path.join(REPO_ASSETS_DIR, `${owner}--${repo}.json`);
}

/** Lê o cache de assets pra UM repo. `null` se não existe ou falha. */
export function readRepoAssetsCache(
  owner: string,
  repo: string,
): RepoAssets | null {
  try {
    const file = pathFor(owner, repo);
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as RepoAssets;
    return parsed;
  } catch {
    return null;
  }
}

/** Escreve o cache de assets pra UM repo. Falhas silenciosas. */
export function writeRepoAssetsCache(
  owner: string,
  repo: string,
  assets: RepoAssets | null,
): void {
  try {
    if (!fs.existsSync(REPO_ASSETS_DIR)) {
      fs.mkdirSync(REPO_ASSETS_DIR, { recursive: true });
    }
    const file = pathFor(owner, repo);
    if (assets === null) {
      fs.writeFileSync(file, "null", "utf8");
    } else {
      fs.writeFileSync(file, JSON.stringify(assets, null, 2), "utf8");
    }
  } catch {
    /* best-effort */
  }
}

/** Aliases para preservar compatibilidade com callers antigos. */
export const readRepoDocsCache = readRepoAssetsCache;
export const writeRepoDocsCache = writeRepoAssetsCache;

/** Verifica se um repo já tem cache (qualquer versão, null incluso). */
export function hasRepoAssetsCache(owner: string, repo: string): boolean {
  try {
    return fs.existsSync(pathFor(owner, repo));
  } catch {
    return false;
  }
}

/** Lista todos os slugs que JÁ têm cache preenchido (não-null). */
export function listCachedAssets(): string[] {
  try {
    if (!fs.existsSync(REPO_ASSETS_DIR)) return [];
    return fs
      .readdirSync(REPO_ASSETS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

/**
 * Enriquece uma lista de `GhRepo` SEM rede, lendo do cache em disco.
 * Repos sem cache ficam com `assets: null` (caller decide fallback).
 *
 * IMPORTANTE: server-only. Use só em server components / API routes /
 * pre-render estático.
 */
export async function withCachedAssets<R extends { name: string }>(
  repos: R[],
): Promise<Array<R & { assets?: RepoAssets | null }>> {
  return repos.map((r) => {
    const assets = readRepoAssetsCache(siteConfig.owner, r.name);
    return { ...r, assets };
  });
}

/** Atalho: lê o cache do repo atual (`siteConfig.owner`) pelo nome. Server-only. */
export async function getRepoAssetsCached(
  repo: string,
): Promise<RepoAssets | null> {
  return readRepoAssetsCache(siteConfig.owner, repo);
}

/** Alias legacy de getRepoAssetsCached. */
export const getRepoDocsCached = getRepoAssetsCached;
