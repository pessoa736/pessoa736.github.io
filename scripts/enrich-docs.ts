// CLI: popula o cache de docs/ em `.cache/repo-docs/<owner>--<repo>.json`.
//
// Uso:
//   npm run enrich-docs          → enriquece todos os repos, 3.5s entre cada
//   npm run enrich-docs -- 0 5   → enriquece os próximos 5 a partir do índice 0
//   npm run enrich-docs -- 5 3   → enriquece os próximos 3 a partir do índice 5
//   npm run enrich-docs -- 0 5 1000  → com gap de 1s (cuidado com rate-limit)
//
// Compatível com `output: 'export'`: não precisa de API route.
// Quando você sobe pra gh-pages, basta rodar uma vez em dev e commitar
// o conteúdo de `.cache/repo-docs/` (ou usar o hook do repo pra repopular).

import { fetchRepoDocs } from "../src/lib/github";
import { writeRepoDocsCache } from "../src/lib/repoDocsCache";
import { siteConfig } from "../src/config/site";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_GAP_MS = 3500;
const HARD_CAP = 32;

interface GhRepoFull {
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

async function listReposOrdered(owner: string): Promise<GhRepoFull[]> {
  const res = await fetch(
    `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} ao listar repos`);
  }
  return (await res.json()) as GhRepoFull[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(): { start: number; count: number; gapMs: number } {
  const argv = process.argv.slice(2);
  const start = Number(argv[0] ?? "0");
  const countRaw = Number(argv[1] ?? "999");
  const count = Math.min(HARD_CAP, Math.max(1, countRaw));
  const gapMs = Math.max(500, Number(argv[2] ?? DEFAULT_GAP_MS));
  return { start, count, gapMs };
}

async function main() {
  const { start, count, gapMs } = parseArgs();
  const owner = siteConfig.owner;
  console.log(`[enrich-docs] owner=${owner} start=${start} count=${count} gapMs=${gapMs}`);

  const all = await listReposOrdered(owner);
  // Cacheia a lista COMPLETA (sem filtro) em `.cache/repos.json` — a build
  // lê daqui e nunca mais faz rede pra listar repos. Também atualiza o
  // `reposLocal.json` (fallback offline) só com repos válidos.
  persistReposList(all);

  const blacklist = new Set(siteConfig.blacklist);
  const valid = all.filter(
    (r) =>
      !r.archived &&
      !r.fork &&
      r.name !== siteConfig.self.repoName &&
      !blacklist.has(r.name),
  );
  const sliced = valid.slice(start, start + count);
  if (!sliced.length) {
    console.log(`[enrich-docs] nada pra fazer (total=${valid.length})`);
    return;
  }

  let ok = 0;
  let empty = 0;
  let fail = 0;

  for (let i = 0; i < sliced.length; i++) {
    const repo = sliced[i].name;
    process.stdout.write(`[enrich-docs] ${i + 1}/${sliced.length} ${repo} ... `);
    try {
      const docs = await fetchRepoDocs(owner, repo);
      writeRepoDocsCache(owner, repo, docs);
      if (docs === null) empty += 1;
      else ok += 1;
      console.log("ok" + (docs === null ? " (sem docs/)" : ""));
    } catch (e) {
      fail += 1;
      console.log("ERROR " + String(e).slice(0, 80));
    }
    if (i < sliced.length - 1) {
      await sleep(gapMs);
    }
  }

  console.log(
    `\n[enrich-docs] done. ok=${ok} empty=${empty} fail=${fail} total=${sliced.length}`,
  );
}

/** Escreve `.cache/repos.json` (cache de build) e `src/lib/reposLocal.json` (fallback offline). */
function persistReposList(repos: GhRepoFull[]): void {
  const cacheDir = join(process.cwd(), ".cache");
  try {
    writeFileSync(
      join(cacheDir, "repos.json"),
      JSON.stringify({ _cachedAt: new Date().toISOString(), repos }, null, 2),
      "utf8",
    );
  } catch {
    /* best-effort */
  }
  // Fallback offline: só os repos válidos (sem archived/fork/self/blacklist).
  // Mantém o shape `{"repos":[...]}` esperado por loadLocalRepos().
  const blacklist = new Set(siteConfig.blacklist);
  const valid = repos.filter(
    (r) =>
      !r.archived &&
      !r.fork &&
      r.name !== siteConfig.self.repoName &&
      !blacklist.has(r.name),
  );
  try {
    writeFileSync(
      join(process.cwd(), "src", "lib", "reposLocal.json"),
      JSON.stringify(
        {
          _comment:
            "Backup local da lista de repos. Usado quando a API do GitHub está indisponível (rate-limit, sem rede, etc) durante BUILD ou prerender. Mantém só os campos mínimos que o site usa.",
          _updatedAt: new Date().toISOString(),
          repos: valid,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(
      `[enrich-docs] reposLocal.json atualizado com ${valid.length} repos válidos`,
    );
  } catch {
    /* best-effort */
  }
}

main().catch((e) => {
  console.error("[enrich-docs] fatal:", e);
  process.exit(1);
});
