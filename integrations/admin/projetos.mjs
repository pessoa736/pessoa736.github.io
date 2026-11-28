// Admin API for the projects: src/data/projects.json (the list the site shows, in order).
// The status/area vocabulary lives in src/data/projects.ts, which also checks the JSON at
// build time; the admin page offers only those words, read from the same file.
import path from "node:path";
import { ROOT, readJSON, writeJSON } from "./util.mjs";

const FILE = path.join(ROOT, "src/data/projects.json");
const CACHE = path.join(ROOT, "src/data/github-cache.json");
const REPO = /^[A-Za-z0-9._-]+$/;

// keep the JSON tidy: always the same key order, optional fields only when filled
function normalise(p) {
  const text = (v) => (typeof v === "string" ? v.trim() : "");
  const list = (v) => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);
  const out = {
    repo: text(p.repo), title: text(p.title), summary: text(p.summary),
    status: text(p.status), area: text(p.area), stack: list(p.stack),
  };
  if (!REPO.test(out.repo)) throw new Error("repositório: o nome exato no GitHub (letras, números, . _ -)");
  for (const k of ["title", "summary", "status", "area"]) if (!out[k]) throw new Error(`falta preencher: ${k}`);
  if (p.featured) out.featured = true;
  const notes = list(p.notes);
  if (notes.length) out.notes = notes;
  const links = (Array.isArray(p.links) ? p.links : [])
    .map((l) => ({ label: text(l?.label), href: text(l?.href) }))
    .filter((l) => l.label || l.href);
  for (const l of links) {
    if (!l.label || !/^https?:\/\//.test(l.href)) throw new Error(`link incompleto: "${l.label || l.href}" (precisa de nome e endereço http/https)`);
  }
  if (links.length) out.links = links;
  return out;
}

export const get = {
  // the list + repos on GitHub that are not on the site yet (from the committed cache)
  async "projetos/state"() {
    const projects = await readJSON(FILE, []);
    const cache = await readJSON(CACHE, { repos: {} });
    const listed = new Set(projects.map((p) => p.repo));
    const missing = Object.entries(cache.repos)
      .filter(([name]) => !listed.has(name))
      .sort(([, a], [, b]) => b.pushedAt.localeCompare(a.pushedAt))
      .map(([name, r]) => ({ repo: name, pushedAt: r.pushedAt, homepage: r.homepage }));
    return { projects, missing, cacheDate: cache.updatedAt ?? null };
  },
};

export const post = {
  // create (original = null) or update a project; renaming the repo changes its URL
  async "projetos/save"({ original, project }) {
    const projects = await readJSON(FILE, []);
    const p = normalise(project ?? {});
    const at = original ? projects.findIndex((x) => x.repo === original) : -1;
    if (original && at < 0) throw new Error(`não achei "${original}"`);
    if (projects.some((x, i) => x.repo === p.repo && i !== at)) throw new Error(`"${p.repo}" já está na lista`);
    if (at >= 0) projects[at] = p; else projects.push(p);
    await writeJSON(FILE, projects);
    return { ok: true, repo: p.repo };
  },

  async "projetos/delete"({ repo }) {
    const projects = await readJSON(FILE, []);
    const next = projects.filter((x) => x.repo !== repo);
    if (next.length === projects.length) throw new Error(`não achei "${repo}"`);
    await writeJSON(FILE, next);
  },

  // order matters only for the home page: the first featured projects become planets
  async "projetos/move"({ repo, by }) {
    const projects = await readJSON(FILE, []);
    const at = projects.findIndex((x) => x.repo === repo);
    if (at < 0) throw new Error(`não achei "${repo}"`);
    const to = Math.max(0, Math.min(projects.length - 1, at + Math.sign(by)));
    projects.splice(to, 0, ...projects.splice(at, 1));
    await writeJSON(FILE, projects);
  },
};
