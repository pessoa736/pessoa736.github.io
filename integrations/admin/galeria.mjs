// Admin API for the gallery.
//   src/assets/galeria/**.webp        published pictures; a folder = an album, a folder inside it = a sub-album
//   src/content/albuns/<path>.md      album text (title, description, date, cover, draft, body)
//   src/data/galeria.json             per-picture text (title, description, kind, date, alt)
//   src/data/galeria-manifest.json    duplicate-check registry, kept in sync
// and runs scripts/galeria-add.mjs to publish what is waiting in galeria-entrada/.
// An album is addressed by its path: "viagens" or "viagens/2024".
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { trash } from "./entrada.mjs";
import { ROOT, SLUG, checkFuzzyDate, dateFromFileName, inside, readJSON, readMarkdown, sortKeys, writeJSON, writeMarkdown } from "./util.mjs";

export const PUB = path.join(ROOT, "src/assets/galeria");
export const INBOX = process.env.GALERIA_ENTRADA ?? path.join(ROOT, "galeria-entrada");
export const NOTES = path.join(ROOT, "src/content/albuns");
const META = path.join(ROOT, "src/data/galeria.json");
export const MANIFEST = path.join(ROOT, "src/data/galeria-manifest.json");
export const RAW = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

// album path of an inbox folder, same rule as scripts/galeria-add.mjs:
// "Viagens/Natal 2024" -> "viagens/natal-2024"
const slugText = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
export const slugPath = (rel) => rel.split("/").map((s) => slugText(s) || "album").join("/");

// "viagens/2024": every segment a slug, no empty ones
function checkPath(p) {
  if (typeof p !== "string" || !p.split("/").every((s) => SLUG.test(s)))
    throw new Error("nome de álbum: só letras minúsculas, números e hífens (ex.: viagem-2024)");
}
export const albumDir = (p) => (p ? inside(PUB, p) : PUB);
export const noteFile = (p) => inside(NOTES, `${p}.md`);
export const dirOf = (key) => (key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : "");

// every folder under `dir`, as relative paths, parents before children (hidden ones skipped)
export async function walkDirs(dir, rel = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  const names = (await readdir(dir, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && !d.name.startsWith(".")).map((d) => d.name).sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  for (const n of names) {
    const sub = rel ? `${rel}/${n}` : n;
    out.push(sub, ...(await walkDirs(path.join(dir, n), sub)));
  }
  return out;
}
export async function listFiles(dir, exts) {
  if (!existsSync(dir)) return [];
  return (await readdir(dir, { withFileTypes: true }))
    .filter((f) => f.isFile() && exts.has(path.extname(f.name).toLowerCase()))
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

// ── read everything the page needs ───────────────────────────────────────────
async function state() {
  const meta = await readJSON(META, {});
  // original file name of each picture: the editor shows the date guessed from it
  const original = new Map((await readJSON(MANIFEST, [])).map((e) => [e.file, e.original]));
  // every album folder, empty ones included (a sub-album just created has no pictures yet)
  const albums = [];
  for (const slug of ["", ...(await walkDirs(PUB))]) {
    const files = await listFiles(albumDir(slug), new Set([".webp"]));
    const pictures = files.map((f) => {
      const key = slug ? `${slug}/${f}` : f;
      return { key, file: f, meta: meta[key] ?? {}, original: original.get(key) ?? "", taken: dateFromFileName(original.get(key) ?? key) };
    });
    albums.push({ slug: slug || null, pictures, ...(slug ? await readMarkdown(noteFile(slug)) : { data: {}, body: "" }) });
  }
  // what is in galeria-entrada/, and how much of it is not on the site yet
  // (exact-bytes check against the registry; the publish step also catches near-copies)
  const known = new Set((await readJSON(MANIFEST, [])).map((e) => e.sha256));
  const waiting = [];
  for (const a of ["", ...(await walkDirs(INBOX))]) {
    const dir = a ? path.join(INBOX, a) : INBOX;
    const files = await listFiles(dir, RAW);
    if (!files.length) continue;
    let fresh = 0;
    for (const f of files) if (!known.has(await sha(path.join(dir, f)))) fresh++;
    waiting.push({ album: a || null, files, fresh });
  }
  return { albums, waiting };
}

// sha256 of a file, remembered by path + size + mtime (the inbox can hold hundreds of MB)
const shaCache = new Map();
export async function sha(file) {
  const st = statSync(file);
  const k = `${file}:${st.size}:${st.mtimeMs}`;
  if (!shaCache.has(k)) shaCache.set(k, createHash("sha256").update(await readFile(file)).digest("hex"));
  return shaCache.get(k);
}

// small previews, generated on demand and kept in memory while the dev server runs
const thumbs = new Map();
async function thumb(url, res) {
  const base = url.searchParams.get("from") === "entrada" ? INBOX : PUB;
  const file = inside(base, url.searchParams.get("path") ?? "");
  const key = `${file}:${statSync(file).mtimeMs}`;
  let data = thumbs.get(key);
  if (!data) {
    data = await sharp(file).rotate().resize(360, 360, { fit: "inside" }).webp({ quality: 70 }).toBuffer();
    thumbs.set(key, data);
  }
  res.setHeader("content-type", "image/webp");
  res.setHeader("cache-control", "no-cache");
  res.end(data);
}

// ── crop ─────────────────────────────────────────────────────────────────────
// What gets cropped: the original from the inbox when it is still there (no second lossy
// pass; screenshots stay sharp), otherwise the published WebP.
async function cropSource(key) {
  const pub = inside(PUB, key);
  if (!existsSync(pub)) throw new Error(`não achei ${key}`);
  const entry = (await readJSON(MANIFEST, [])).find((e) => e.file === key);
  const orig = entry?.original && RAW.has(path.extname(entry.original).toLowerCase()) ? inside(INBOX, entry.original) : null;
  return orig && existsSync(orig) ? { file: orig, original: true } : { file: pub, original: false };
}
// the picture as the editor shows it (EXIF turn applied, at most 1600 px)
async function cropPreview(url, res) {
  const { file, original } = await cropSource(url.searchParams.get("path") ?? "");
  const upright = sharp(file).rotate();
  const real = await sharp(await upright.clone().png({ compressionLevel: 0 }).toBuffer()).metadata();   // size after the EXIF turn
  const data = await upright.resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  res.setHeader("content-type", "image/webp");
  res.setHeader("x-real-size", `${real.width}x${real.height}`);
  res.setHeader("cache-control", "no-cache");
  res.setHeader("x-source", original ? "original" : "site");
  res.end(data);
}

// ── registry helpers ─────────────────────────────────────────────────────────
// apply a key change to the per-picture text and to the duplicate registry
async function rekey(map) {
  const meta = await readJSON(META, {});
  await writeJSON(META, sortKeys(Object.fromEntries(Object.entries(meta).map(([k, v]) => [map(k), v]))));
  const manifest = await readJSON(MANIFEST, []);
  await writeJSON(MANIFEST, manifest.map((e) => {
    const file = map(e.file);
    return { ...e, file, album: dirOf(file) || null };
  }));
}
// forget pictures (text + registry) whose key matches
async function forget(match) {
  const meta = await readJSON(META, {});
  await writeJSON(META, Object.fromEntries(Object.entries(meta).filter(([k]) => !match(k))));
  const manifest = await readJSON(MANIFEST, []);
  await writeJSON(MANIFEST, manifest.filter((e) => !match(e.file)));
}
// a free name in `dir`: foto.webp, foto-2.webp, foto-3.webp...
function freeName(dir, name) {
  const { name: stem, ext } = path.parse(name);
  let n = 2, candidate = name;
  while (existsSync(path.join(albumDir(dir), candidate))) candidate = `${stem}-${n++}${ext}`;
  return candidate;
}

// ── actions ──────────────────────────────────────────────────────────────────
export const post = {
  // new (sub-)album: an empty folder. It shows on the site once a picture is moved into it.
  async "galeria/album/create"({ parent, name }) {
    if (parent) checkPath(parent);
    checkPath(name);
    if (name.includes("/")) throw new Error("um nome por vez (sem barra)");
    const slug = parent ? `${parent}/${name}` : name;
    if (existsSync(albumDir(slug))) throw new Error(`já existe um álbum "${slug}"`);
    await mkdir(albumDir(slug), { recursive: true });
    return { ok: true, slug };
  },

  // album text: title, description, date, cover, draft and the Markdown body
  async "galeria/album/save"({ slug, title, description, date, cover, draft, body }) {
    checkPath(slug);
    if (!existsSync(albumDir(slug))) throw new Error("álbum não existe");
    checkFuzzyDate(date);
    await writeMarkdown(noteFile(slug), { title, description, date, cover, draft: !!draft }, body ?? "", { removeIfEmpty: true });
  },

  // rename and/or move an album to another parent: `to` is the new full path.
  // Folder, sub-albums, album texts, per-picture text and registry move together.
  async "galeria/album/move"({ from, to }) {
    checkPath(from); checkPath(to);
    if (from === to) return;
    if (to.startsWith(from + "/")) throw new Error("um álbum não pode ir para dentro dele mesmo");
    if (existsSync(albumDir(to))) throw new Error(`já existe um álbum "${to}"`);
    await mkdir(path.dirname(albumDir(to)), { recursive: true });
    await rename(albumDir(from), albumDir(to));
    // texts: <from>.md and the folder <from>/ that holds the sub-albums' texts
    for (const [a, b] of [[noteFile(from), noteFile(to)], [inside(NOTES, from), inside(NOTES, to)]]) {
      if (!existsSync(a)) continue;
      await mkdir(path.dirname(b), { recursive: true });
      await rename(a, b);
    }
    await rekey((k) => (k.startsWith(from + "/") ? to + k.slice(from.length) : k));
    await dropEmptyNotes(dirOf(from));
    return { ok: true, slug: to };
  },

  // remove an album from the site: its pictures, its sub-albums and their texts
  // (the originals in galeria-entrada/ are untouched)
  async "galeria/album/delete"({ slug }) {
    checkPath(slug);
    await rm(albumDir(slug), { recursive: true, force: true });
    await rm(noteFile(slug), { force: true });
    await rm(inside(NOTES, slug), { recursive: true, force: true });
    await forget((k) => k.startsWith(slug + "/"));
    await dropEmptyNotes(dirOf(slug));
  },

  // picture text; an entry with every field empty is removed from the JSON
  async "galeria/picture/save"({ key, title, description, kind, date, alt, draft }) {
    inside(PUB, key);
    checkFuzzyDate(date);
    const meta = await readJSON(META, {});
    setEntry(meta, key, { title, description, kind, date, alt, draft: draft ?? meta[key]?.draft, pinned: meta[key]?.pinned });
    await writeJSON(META, sortKeys(meta));
  },

  // the same fields on many pictures at once; only the fields sent are changed
  // ("" clears a field), e.g. { keys, patch: { date: "2021", kind: "desenho" } }
  async "galeria/pictures/save"({ keys, patch }) {
    if (!Array.isArray(keys) || !keys.length) throw new Error("nenhuma imagem escolhida");
    const allowed = ["title", "description", "kind", "date", "alt", "draft"];
    const fields = Object.fromEntries(Object.entries(patch ?? {}).filter(([k]) => allowed.includes(k)));
    if (!Object.keys(fields).length) throw new Error("nada para mudar");
    checkFuzzyDate(fields.date);
    const meta = await readJSON(META, {});
    for (const key of keys) {
      inside(PUB, key);
      const entry = { ...(meta[key] ?? {}), ...fields };
      // turning into a drawing: starts as a draft, unless "draft" was already decided
      if (fields.kind === "desenho" && !("draft" in fields) && typeof meta[key]?.draft !== "boolean") entry.draft = true;
      setEntry(meta, key, entry);
    }
    await writeJSON(META, sortKeys(meta));
    return { ok: true, changed: keys.length };
  },

  // pin (or unpin) pictures to the top of the gallery and of their album; the value kept is
  // when they were pinned, so the latest pin comes first
  async "galeria/pictures/pin"({ keys, pinned }) {
    if (!Array.isArray(keys) || !keys.length) throw new Error("nenhuma imagem escolhida");
    const meta = await readJSON(META, {});
    const now = new Date().toISOString().slice(0, 19);
    for (const key of keys) {
      if (!existsSync(inside(PUB, key))) throw new Error(`não achei ${key}`);
      setEntry(meta, key, { ...(meta[key] ?? {}), pinned: pinned ? meta[key]?.pinned || now : "" });
    }
    await writeJSON(META, sortKeys(meta));
    return { ok: true, changed: keys.length };
  },

  // crop (and turn) a picture. x, y, w, h are fractions (0..1) of the picture as shown after
  // turning `rot` degrees. mode "replace" keeps the id and saves the old file in
  // galeria-entrada/.versoes/ (undo); "copy" publishes the crop as a new picture next to it.
  async "galeria/picture/crop"({ key, rot = 0, x, y, w, h, mode = "replace" }) {
    if (![0, 90, 180, 270].includes(rot)) throw new Error("giro inválido");
    if (![x, y, w, h].every((n) => Number.isFinite(n)) || x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1.0001 || y + h > 1.0001)
      throw new Error("área de recorte inválida");
    const { file } = await cropSource(key);
    const upright = await sharp(file).rotate().png({ compressionLevel: 1 }).toBuffer();   // EXIF first, then our turn
    const turned = rot ? await sharp(upright).rotate(rot).png({ compressionLevel: 1 }).toBuffer() : upright;
    const { width: W, height: H } = await sharp(turned).metadata();
    const left = Math.min(W - 1, Math.round(x * W)), top = Math.min(H - 1, Math.round(y * H));
    const area = { left, top, width: Math.max(1, Math.min(W - left, Math.round(w * W))), height: Math.max(1, Math.min(H - top, Math.round(h * H))) };
    const out = await sharp(turned).extract(area)
      .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 }).toBuffer({ resolveWithObject: true });

    const dir = dirOf(key), id = path.basename(key, ".webp");
    let target = key;
    if (mode === "copy") {
      let n = 1, name;
      do { name = `${id}-recorte${n > 1 ? `-${n}` : ""}`; n++; } while (existsSync(inside(PUB, dir ? `${dir}/${name}.webp` : `${name}.webp`)));
      target = dir ? `${dir}/${name}.webp` : `${name}.webp`;
    } else {
      const old = inside(INBOX, `.versoes/${key.replaceAll("/", "__")}.${new Date().toISOString().replace(/[:.]/g, "-")}.webp`);
      await mkdir(path.dirname(old), { recursive: true });
      await writeFile(old, await readFile(inside(PUB, key)));
    }
    await writeFile(inside(PUB, target), out.data);

    const manifest = await readJSON(MANIFEST, []);
    const base = manifest.find((e) => e.file === key);
    const info = { width: out.info.width, height: out.info.height, bytes: out.info.size };
    if (mode === "copy") {
      // the copy has its own content; the original stays tied to the first picture
      manifest.push({ id: path.basename(target, ".webp"), album: dir, file: target,
        sha256: createHash("sha256").update(out.data).digest("hex"), ...info, added: new Date().toISOString().slice(0, 10) });
      const meta = await readJSON(META, {});
      if (meta[key]) { meta[target] = { ...meta[key], pinned: "" }; for (const k of Object.keys(meta[target])) if (!meta[target][k]) delete meta[target][k]; await writeJSON(META, sortKeys(meta)); }
    } else if (base) {
      // hashes of the cropped file replace the old ones; the original keeps being refused as a duplicate by its own entry
      Object.assign(base, info);
    }
    await writeJSON(MANIFEST, manifest);
    return { ok: true, key: target, ...info };
  },

  // new file name (the id in the address of the picture file and in the album cover)
  async "galeria/picture/rename"({ key, name }) {
    if (!SLUG.test(name ?? "")) throw new Error("nome: só letras minúsculas, números e hífens (ex.: lua-sobre-o-mar)");
    const src = inside(PUB, key);
    if (!existsSync(src)) throw new Error(`não achei ${key}`);
    const dir = dirOf(key), oldId = path.basename(key, ".webp");
    if (name === oldId) return { ok: true, key };
    const newKey = dir ? `${dir}/${name}.webp` : `${name}.webp`;
    if (existsSync(inside(PUB, newKey))) throw new Error(`já existe uma imagem "${name}" neste álbum`);
    await rename(src, inside(PUB, newKey));
    await rekey((k) => (k === key ? newKey : k));
    const manifest = await readJSON(MANIFEST, []);
    await writeJSON(MANIFEST, manifest.map((e) => (e.file === newKey ? { ...e, id: name } : e)));
    // it was the album cover: follow the new name
    if (dir) {
      const note = await readMarkdown(noteFile(dir));
      if (note.data.cover === oldId || note.data.cover === `${oldId}.webp`)
        await writeMarkdown(noteFile(dir), { ...note.data, cover: name }, note.body, { removeIfEmpty: true });
    }
    return { ok: true, key: newKey };
  },

  // move pictures to another album ("" = loose). A name already taken there gets a
  // suffix (-2, -3...) instead of failing, so a whole selection always moves.
  // An album left empty stays (hidden on the site) until it is deleted on purpose.
  async "galeria/pictures/move"({ keys, to }) {
    if (!Array.isArray(keys) || !keys.length) throw new Error("nenhuma imagem escolhida");
    if (to) { checkPath(to); if (!existsSync(albumDir(to))) throw new Error("álbum não existe"); }
    const moves = new Map();
    for (const key of keys) {
      const src = inside(PUB, key);
      if (!existsSync(src)) throw new Error(`não achei ${key}`);
      if (dirOf(key) === (to ?? "")) continue;
      const name = freeName(to, path.basename(key));
      const newKey = to ? `${to}/${name}` : name;
      await rename(src, inside(PUB, newKey));
      moves.set(key, newKey);
    }
    await rekey((k) => moves.get(k) ?? k);
    return { ok: true, moved: moves.size };
  },

  // remove pictures from the site. With `original: true`, the original each one came
  // from (galeria-entrada/<path> in the registry) also goes to the system trash;
  // otherwise the originals are untouched.
  async "galeria/pictures/delete"({ keys, original = false }) {
    if (!Array.isArray(keys) || !keys.length) throw new Error("nenhuma imagem escolhida");
    for (const key of keys) inside(PUB, key);
    const origins = new Map((await readJSON(MANIFEST, [])).map((e) => [e.file, e.original]));
    for (const key of keys) await rm(inside(PUB, key), { force: true });
    const gone = new Set(keys);
    await forget((k) => gone.has(k));
    let trashed = 0, missing = 0;
    if (original) {
      for (const key of keys) {
        const rel = origins.get(key);
        const file = rel ? inside(INBOX, rel) : null;
        if (file && existsSync(file)) { await trash(file); trashed++; } else missing++;
      }
    }
    return { ok: true, removed: keys.length, trashed, missing };
  },

  // publish what is waiting: runs the same script as `npm run galeria:add -- <album>`
  async "galeria/publish"({ album }) {
    if (album && !existsSync(inside(INBOX, album))) throw new Error("pasta não encontrada em galeria-entrada/");
    return { ok: true, log: await runPublish([album ? album : "--avulsas"]) };
  },
};

// run scripts/galeria-add.mjs with these arguments (folders or single files of the inbox)
export function runPublish(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [path.join(ROOT, "scripts/galeria-add.mjs"), ...args], { cwd: ROOT, env: { ...process.env, GALERIA_ENTRADA: INBOX } });
    let text = "";
    p.stdout.on("data", (d) => (text += d));
    p.stderr.on("data", (d) => (text += d));
    p.on("close", (code) => (code === 0 ? resolve(text) : reject(new Error(text || `saiu com ${code}`))));
  });
}

// the texts folder mirrors the albums: drop note folders left empty by a move/delete
// (only folders of .md files; albums themselves are never removed implicitly)
async function dropEmptyNotes(dir) {
  while (dir) {
    const full = inside(NOTES, dir);
    if (!existsSync(full) || (await readdir(full)).length > 0) return;
    await rm(full, { recursive: true });
    dir = dirOf(dir);
  }
}

export const get = {
  "galeria/state": () => state(),
  "galeria/thumb": thumb,
  "galeria/crop/preview": cropPreview,
};

// write one picture's text; empty fields are dropped, "foto" is the default kind,
// and an entry left with nothing is removed from the JSON
function setEntry(meta, key, fields) {
  const entry = Object.fromEntries(Object.entries(fields).filter(([, v]) => v));
  if (entry.kind === "foto") delete entry.kind;
  // draft: true is kept; false only on drawings (they default to draft, so "no" must be remembered)
  if (fields.draft === false && fields.kind === "desenho") entry.draft = false;
  if (entry.date) entry.date = String(entry.date);
  if (Object.keys(entry).length) meta[key] = sortKeys(entry); else delete meta[key];
}
