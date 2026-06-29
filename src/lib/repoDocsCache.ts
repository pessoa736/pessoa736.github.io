// Cache persistente de `docs/` por repo, em `.cache/repo-docs/<owner>--<repo>.json`.
//
// IMPORTANTE: este módulo usa `node:fs` e SÓ roda no servidor.
// Em Next.js, a checagem é feita via `import "server-only"` (módulo especial
// da runtime do Next que explode se importado em client component). Aqui já
// estamos em server-only por construção: o único "cliente" que importa arquivos
// em runtime é o `scripts/enrich-docs.ts` (Node puro), e nunca componentes.
// Em Client Components do Next, este módulo não deve ser importado — ele já
// falha em build por design (sem `server-only`, Turbopack tentaria empacotar
// `node:fs` no bundle do browser).

import fs from "node:fs";
import path from "node:path";
import type { RepoDocs } from "./github";
import { siteConfig } from "mySite/config/site";

const REPO_DOCS_DIR = path.join(process.cwd(), ".cache", "repo-docs");

/** Caminho do arquivo de cache pra um repo específico. */
function pathFor(owner: string, repo: string): string {
  return path.join(REPO_DOCS_DIR, `${owner}--${repo}.json`);
}

/** Lê o cache de docs pra UM repo. Retorna `null` se não existe ou falha. */
export function readRepoDocsCache(
  owner: string,
  repo: string,
): RepoDocs | null {
  try {
    const file = pathFor(owner, repo);
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as RepoDocs;
    return parsed;
  } catch {
    return null;
  }
}

/** Escreve o cache de docs pra UM repo. Falhas silenciosas. */
export function writeRepoDocsCache(
  owner: string,
  repo: string,
  docs: RepoDocs | null,
): void {
  try {
    if (!fs.existsSync(REPO_DOCS_DIR)) {
      fs.mkdirSync(REPO_DOCS_DIR, { recursive: true });
    }
    const file = pathFor(owner, repo);
    if (docs === null) {
      // null = repo não tem pasta docs/. Cacheia esse fato pra não
      // tentar de novo no futuro.
      fs.writeFileSync(file, "null", "utf8");
    } else {
      fs.writeFileSync(file, JSON.stringify(docs, null, 2), "utf8");
    }
  } catch {
    /* best-effort */
  }
}

/** Verifica se um repo já tem cache (qualquer versão, null incluso). */
export function hasRepoDocsCache(owner: string, repo: string): boolean {
  try {
    return fs.existsSync(pathFor(owner, repo));
  } catch {
    return false;
  }
}

/** Lista todos os slugs que JÁ têm cache preenchido (não-null). */
export function listCachedDocs(): string[] {
  try {
    if (!fs.existsSync(REPO_DOCS_DIR)) return [];
    return fs
      .readdirSync(REPO_DOCS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

/**
 * Atalho: lê o cache do repo atual (`siteConfig.owner`) pelo nome.
 * Server-only — não usar em componentes client. Use `readRepoDocsCache`
 * diretamente em client se precisar, mas a regra é: nunca importe este
 * módulo de algo que vira client component.
 */
export async function getRepoDocsCached(repo: string): Promise<RepoDocs | null> {
  return readRepoDocsCache(siteConfig.owner, repo);
}
