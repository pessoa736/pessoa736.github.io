// Curated list of projects. This file is the source of truth for what the site says
// about each project: the GitHub API is only used for stars and dates (src/lib/github.ts).
//
// To add a project: /admin/projetos in `npm run dev`, or an entry in projects.json. `repo`
// must be the exact repository name on GitHub, because it is also the URL
// (/projetos/<repo>), the same slugs the old site used.

/** Where a project stands, in plain words. Same vocabulary as the READMEs. */
export type Status =
  | "ativo"
  | "em desenvolvimento"
  | "pausado"
  | "descontinuado"
  | "arquivo"
  | "estudo";

export const STATUS_INFO: Record<Status, string> = {
  "ativo": "funciona e eu ainda mexo nele",
  "em desenvolvimento": "ainda não está pronto pra usar",
  "pausado": "parado por enquanto; pode voltar",
  "descontinuado": "não vou continuar",
  "arquivo": "guardado como registro",
  "estudo": "feito pra aprender uma matéria ou um assunto",
};

export type Area = "sistemas" | "lua" | "web" | "ia e redes" | "jogos";
export const AREAS: Area[] = ["sistemas", "lua", "web", "ia e redes", "jogos"];

export interface Project {
  repo: string;              // GitHub repository name (also the URL slug)
  title: string;             // display name
  summary: string;           // one sentence: what it is
  status: Status;
  area: Area;
  stack: string[];
  featured?: boolean;        // shown on the home page
  notes?: string[];          // honest details: what works, what doesn't
  links?: { label: string; href: string }[];
}

// The entries live in projects.json so the dev-only admin page (/admin/projetos) can edit
// them; editing the JSON by hand works too. Order matters: the first featured projects
// are the planets on the home page. Checked here at build time, so a typo in a status or
// an area breaks the build instead of silently showing a wrong badge.
import data from "./projects.json";

export const projects = data as Project[];
for (const p of projects) {
  if (!(p.status in STATUS_INFO)) throw new Error(`projects.json: "${p.repo}" tem status desconhecido "${p.status}"`);
  if (!AREAS.includes(p.area)) throw new Error(`projects.json: "${p.repo}" tem área desconhecida "${p.area}"`);
}

export const projectByRepo = (repo: string) => projects.find((p) => p.repo === repo);
