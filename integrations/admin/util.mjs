// Helpers shared by the admin API modules (galeria, projetos, escritos).
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

export const ROOT = fileURLToPath(new URL("../..", import.meta.url));
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const readJSON = async (file, fallback) => { try { return JSON.parse(await readFile(file, "utf8")); } catch { return fallback; } };
export const writeJSON = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + "\n");
export const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

// resolve a path the client sent and refuse anything that escapes the base folder
export function inside(base, rel) {
  const full = path.resolve(base, rel);
  if (full !== base && !full.startsWith(base + path.sep)) throw new Error("caminho inválido");
  return full;
}

export function checkDate(date) {
  if (date && !DATE.test(date)) throw new Error("data no formato AAAA-MM-DD");
}

// gallery dates may be partial: "2021", "2021-03" or "2021-03-05" (src/lib/fuzzydate.ts)
export const FUZZY_DATE = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;
export function checkFuzzyDate(date) {
  if (date && !FUZZY_DATE.test(String(date))) throw new Error("data: só o ano (2021), mês e ano (2021-03) ou completa (2021-03-05)");
}

// date guessed from an original file name; same rules as dateFromFileName() in
// src/lib/fuzzydate.ts (keep both in sync). Returns "AAAA-MM-DD" or "".
export function dateFromFileName(name) {
  const base = String(name ?? "").split("/").pop();
  const now = new Date().getUTCFullYear();
  for (const m of base.matchAll(/(?<!\d)((?:19|20)\d{2})[-_.]?(\d{2})[-_.]?(\d{2})(?!\d)/g)) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (y >= 1990 && y <= now && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  const ms = base.match(/(?<!\d)(1[2-9]\d{11})(?!\d)/);
  if (ms) {
    const d = new Date(Number(ms[1]));
    if (d.getUTCFullYear() >= 2008 && d.getUTCFullYear() <= now) return d.toISOString().slice(0, 10);
  }
  return "";
}

// Markdown file with a YAML header: { data, body }. A missing file reads as empty.
export async function readMarkdown(file) {
  if (!existsSync(file)) return { data: {}, body: "" };
  const text = await readFile(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = YAML.parse(m[1]) ?? {};
  for (const [k, v] of Object.entries(data)) if (v instanceof Date) data[k] = v.toISOString().slice(0, 10);
  if (typeof data.date === "number") data.date = String(data.date);
  return { data, body: m[2].replace(/^\r?\n/, "") };
}

// Write it back. Empty values ("" / null / false) are left out of the header, unless the
// key is in `keep` (e.g. `draft: false` on a post, which the reader expects to see).
// With `removeIfEmpty`, a file with no header and no body is deleted instead.
export async function writeMarkdown(file, data, body, { keep = [], removeIfEmpty = false } = {}) {
  const clean = Object.fromEntries(Object.entries(data).filter(([k, v]) => keep.includes(k) || (v !== "" && v != null && v !== false)));
  if (removeIfEmpty && Object.keys(clean).length === 0 && !body.trim()) { await rm(file, { force: true }); return; }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `---\n${YAML.stringify(clean).trimEnd()}\n---\n${body.trim() ? "\n" + body.trim() + "\n" : ""}`);
}
