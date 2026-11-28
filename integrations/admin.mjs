// Dev-only admin for the gallery.
//
// `npm run dev` -> http://localhost:4321/admin
// In `npm run build` this integration adds nothing: the /admin route and the /__admin/*
// API exist only inside the dev server, so the published site never has them.
//
// The API edits files in the repo (never anything outside it):
//   src/content/albuns/<slug>.md      album text (title, description, date, cover, draft, body)
//   src/data/galeria.json             per-picture text (title, description, kind, date, alt)
//   src/assets/galeria/**.webp        published pictures (delete / move between albums)
//   src/data/galeria-manifest.json    duplicate-check registry, kept in sync
// and runs scripts/galeria-add.mjs to publish what is waiting in galeria-entrada/.
// Nothing is committed: review with `git status` / `git diff` and commit yourself.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import YAML from "yaml";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUB = path.join(ROOT, "src/assets/galeria");
const INBOX = process.env.GALERIA_ENTRADA ?? path.join(ROOT, "galeria-entrada");
const NOTES = path.join(ROOT, "src/content/albuns");
const META = path.join(ROOT, "src/data/galeria.json");
const MANIFEST = path.join(ROOT, "src/data/galeria-manifest.json");
const RAW = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function admin() {
  return {
    name: "galeria-admin",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command !== "dev") return;
        injectRoute({ pattern: "/admin", entrypoint: fileURLToPath(new URL("../src/admin/admin.astro", import.meta.url)) });
      },
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/__admin/")) return next();
          try {
            if (!isLocal(req)) return send(res, 403, { error: "só a partir deste computador" });
            const url = new URL(req.url, "http://localhost");
            if (req.method === "GET" && url.pathname === "/__admin/state") return send(res, 200, await state());
            if (req.method === "GET" && url.pathname === "/__admin/thumb") return thumb(res, url.searchParams);
            if (req.method === "POST") {
              // a custom header forces a CORS preflight, so other websites open in the
              // browser can't post to this API behind your back
              if (req.headers["x-admin"] !== "1") return send(res, 403, { error: "cabeçalho ausente" });
              const body = await json(req);
              const action = ACTIONS[url.pathname.replace("/__admin/", "")];
              if (!action) return send(res, 404, { error: "ação desconhecida" });
              return send(res, 200, (await action(body)) ?? { ok: true });
            }
            send(res, 404, { error: "não encontrado" });
          } catch (e) {
            send(res, 400, { error: e.message });
          }
        });
      },
    },
  };
}

// ── helpers ──────────────────────────────────────────────────────────────────
function isLocal(req) {
  const ip = req.socket.remoteAddress ?? "";
  const host = (req.headers.host ?? "").replace(/:\d+$/, "");
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip) && ["localhost", "127.0.0.1", "[::1]"].includes(host);
}
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
async function json(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}
const readJSON = async (file, fallback) => { try { return JSON.parse(await readFile(file, "utf8")); } catch { return fallback; } };
const writeJSON = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + "\n");
// resolve a path the client sent and refuse anything that escapes the base folder
function inside(base, rel) {
  const full = path.resolve(base, rel);
  if (full !== base && !full.startsWith(base + path.sep)) throw new Error("caminho inválido");
  return full;
}
const albumDir = (slug) => (slug ? inside(PUB, slug) : PUB);
function checkSlug(slug) { if (!SLUG.test(slug)) throw new Error("nome de álbum: só letras minúsculas, números e hífens (ex.: viagem-2024)"); }

async function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return (await readdir(dir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
}
async function listFiles(dir, exts) {
  if (!existsSync(dir)) return [];
  return (await readdir(dir, { withFileTypes: true }))
    .filter((f) => f.isFile() && exts.has(path.extname(f.name).toLowerCase()))
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

async function readNote(slug) {
  const file = path.join(NOTES, `${slug}.md`);
  if (!existsSync(file)) return { data: {}, body: "" };
  const text = await readFile(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = YAML.parse(m[1]) ?? {};
  if (data.date instanceof Date) data.date = data.date.toISOString().slice(0, 10);
  return { data, body: m[2].replace(/^\n/, "") };
}
async function writeNote(slug, data, body) {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "" && v != null && v !== false));
  const file = path.join(NOTES, `${slug}.md`);
  if (Object.keys(clean).length === 0 && !body.trim()) { await rm(file, { force: true }); return; }
  await mkdir(NOTES, { recursive: true });
  await writeFile(file, `---\n${YAML.stringify(clean).trimEnd()}\n---\n${body.trim() ? "\n" + body.trim() + "\n" : ""}`);
}

// ── read everything the page needs ───────────────────────────────────────────
async function state() {
  const meta = await readJSON(META, {});
  const published = [];
  for (const slug of [null, ...(await listDirs(PUB))]) {
    const files = await listFiles(albumDir(slug), new Set([".webp"]));
    if (slug === null && files.length === 0) continue;
    const pictures = files.map((f) => {
      const key = slug ? `${slug}/${f}` : f;
      return { key, file: f, meta: meta[key] ?? {} };
    });
    published.push({ slug, pictures, ...(slug ? await readNote(slug) : { data: {}, body: "" }) });
  }
  // what is in galeria-entrada/, and how much of it is not on the site yet
  // (exact-bytes check against the registry; the publish step also catches near-copies)
  const known = new Set((await readJSON(MANIFEST, [])).map((e) => e.sha256));
  const waiting = [];
  for (const a of [null, ...(await listDirs(INBOX))]) {
    const dir = a ? path.join(INBOX, a) : INBOX;
    const files = await listFiles(dir, RAW);
    if (!files.length) continue;
    let fresh = 0;
    for (const f of files) if (!known.has(await sha(path.join(dir, f)))) fresh++;
    waiting.push({ album: a, files, fresh });
  }
  return { published, waiting };
}

// sha256 of a file, remembered by path + size + mtime (the inbox can hold hundreds of MB)
const shaCache = new Map();
async function sha(file) {
  const st = statSync(file);
  const k = `${file}:${st.size}:${st.mtimeMs}`;
  if (!shaCache.has(k)) shaCache.set(k, createHash("sha256").update(await readFile(file)).digest("hex"));
  return shaCache.get(k);
}

// small previews, generated on demand and kept in memory while the dev server runs
const cache = new Map();
async function thumb(res, params) {
  const base = params.get("from") === "entrada" ? INBOX : PUB;
  const file = inside(base, params.get("path") ?? "");
  const key = `${file}:${statSync(file).mtimeMs}`;
  let data = cache.get(key);
  if (!data) {
    data = await sharp(file).rotate().resize(360, 360, { fit: "inside" }).webp({ quality: 70 }).toBuffer();
    cache.set(key, data);
  }
  res.setHeader("content-type", "image/webp");
  res.setHeader("cache-control", "no-cache");
  res.end(data);
}

// ── actions ──────────────────────────────────────────────────────────────────
const ACTIONS = {
  // album text: title, description, date, cover, draft and the Markdown body
  async "album/save"({ slug, title, description, date, cover, draft, body }) {
    checkSlug(slug);
    if (!existsSync(albumDir(slug))) throw new Error("álbum não existe");
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("data no formato AAAA-MM-DD");
    await writeNote(slug, { title, description, date, cover, draft: !!draft }, body ?? "");
  },

  // rename an album: folder, text file, per-picture text and registry move together
  async "album/rename"({ from, to }) {
    checkSlug(from); checkSlug(to);
    if (from === to) return;
    if (existsSync(albumDir(to))) throw new Error(`já existe um álbum "${to}"`);
    await rename(albumDir(from), albumDir(to));
    const note = path.join(NOTES, `${from}.md`);
    if (existsSync(note)) await rename(note, path.join(NOTES, `${to}.md`));
    await rekey((k) => (k.startsWith(from + "/") ? to + k.slice(from.length) : k));
  },

  // picture text; an entry with every field empty is removed from the JSON
  async "picture/save"({ key, title, description, kind, date, alt }) {
    inside(PUB, key);
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("data no formato AAAA-MM-DD");
    const meta = await readJSON(META, {});
    const entry = Object.fromEntries(Object.entries({ title, description, kind, date, alt }).filter(([, v]) => v));
    if (entry.kind === "foto") delete entry.kind;   // the default
    if (Object.keys(entry).length) meta[key] = entry; else delete meta[key];
    await writeJSON(META, sortKeys(meta));
  },

  // move a picture to another album ("" = loose)
  async "picture/move"({ key, to }) {
    if (to) checkSlug(to);
    const src = inside(PUB, key);
    const name = path.basename(key);
    const newKey = to ? `${to}/${name}` : name;
    if (newKey === key) return;
    const dest = inside(PUB, newKey);
    if (existsSync(dest)) throw new Error(`já existe ${newKey}`);
    await mkdir(path.dirname(dest), { recursive: true });
    await rename(src, dest);
    await rekey((k) => (k === key ? newKey : k));
    await dropEmptyAlbum(path.dirname(key));
  },

  // remove a picture from the site (the original in galeria-entrada/ is untouched)
  async "picture/delete"({ key }) {
    await rm(inside(PUB, key));
    const meta = await readJSON(META, {});
    delete meta[key];
    await writeJSON(META, meta);
    const manifest = await readJSON(MANIFEST, []);
    await writeJSON(MANIFEST, manifest.filter((e) => e.file !== key));
    await dropEmptyAlbum(path.dirname(key));
  },

  // publish what is waiting: runs the same script as `npm run galeria:add -- <album>`
  async "publish"({ album }) {
    const arg = album ? album : "--avulsas";
    if (album && !existsSync(inside(INBOX, album))) throw new Error("pasta não encontrada em galeria-entrada/");
    const out = await new Promise((resolve, reject) => {
      const p = spawn(process.execPath, [path.join(ROOT, "scripts/galeria-add.mjs"), arg], { cwd: ROOT });
      let text = "";
      p.stdout.on("data", (d) => (text += d));
      p.stderr.on("data", (d) => (text += d));
      p.on("close", (code) => (code === 0 ? resolve(text) : reject(new Error(text || `saiu com ${code}`))));
    });
    return { ok: true, log: out };
  },
};

// apply a key change to the per-picture text and to the duplicate registry
async function rekey(map) {
  const meta = await readJSON(META, {});
  await writeJSON(META, sortKeys(Object.fromEntries(Object.entries(meta).map(([k, v]) => [map(k), v]))));
  const manifest = await readJSON(MANIFEST, []);
  await writeJSON(MANIFEST, manifest.map((e) => {
    const file = map(e.file);
    return { ...e, file, album: file.includes("/") ? file.split("/")[0] : null };
  }));
}
async function dropEmptyAlbum(dir) {
  if (dir === "." || dir === "") return;
  const full = albumDir(dir);
  if ((await readdir(full)).length === 0) await rm(full, { recursive: true });
}
const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
