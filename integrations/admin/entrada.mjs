// Admin API for galeria-entrada/: the originals waiting to be published.
// Organise them before publishing (folders = future albums, sub-folders = sub-albums),
// write the album text in advance, upload new pictures, publish a folder or a selection.
//
// These are ORIGINALS, probably the only copy: nothing here deletes a file. "Apagar" sends it
// to the system trash (gio trash, recoverable from the file manager); without gio, to
// galeria-entrada/.lixeira/. Names may be anything the file system takes; the published
// address is the slug of each folder name (shown next to it).
import { spawn } from "node:child_process";
import { createWriteStream, existsSync, statSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { checkFuzzyDate, inside, readJSON, readMarkdown, writeMarkdown } from "./util.mjs";
import { INBOX, MANIFEST, RAW, albumDir, dirOf, listFiles, noteFile, runPublish, sha, slugPath, walkDirs } from "./galeria.mjs";

const MAX_UPLOAD = 300 * 1024 * 1024;   // 300 MB per file
const folder = (rel) => (rel ? inside(INBOX, rel) : INBOX);
const within = (p, root) => p === root || p.startsWith(root + "/");

// a folder or file name typed in the admin: one segment, nothing hidden or odd
function checkName(name) {
  if (typeof name !== "string" || !name.trim() || /[\/\\]/.test(name) || name.startsWith(".") || name.length > 80)
    throw new Error("nome inválido (sem barras, sem começar com ponto, até 80 caracteres)");
  return name.trim();
}
function checkRel(rel) {
  if (typeof rel !== "string" || rel.split("/").some((s) => !s || s.startsWith("."))) throw new Error("caminho inválido");
  inside(INBOX, rel);
  return rel;
}
// a free name in `dir`: foto.jpg, foto-2.jpg, foto-3.jpg...
function freeName(dir, name) {
  const { name: stem, ext } = path.parse(name);
  let n = 2, candidate = name;
  while (existsSync(path.join(dir, candidate))) candidate = `${stem}-${n++}${ext}`;
  return candidate;
}

// to the system trash; to galeria-entrada/.lixeira/ when gio isn't there
export async function trash(full) {
  try {
    await new Promise((resolve, reject) => {
      const p = spawn("gio", ["trash", full]);
      let err = "";
      p.stderr.on("data", (d) => (err += d));
      p.on("error", reject);
      p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(err.trim() || `gio trash saiu com ${code}`))));
    });
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    const dest = path.join(INBOX, ".lixeira", new Date().toISOString().slice(0, 10), path.relative(INBOX, full));
    const dir = path.dirname(dest);
    await mkdir(dir, { recursive: true });
    await rename(full, path.join(dir, freeName(dir, path.basename(dest))));
  }
}

// ── state ────────────────────────────────────────────────────────────────────
async function state() {
  const known = new Set((await readJSON(MANIFEST, [])).map((e) => e.sha256));
  const folders = [];
  for (const rel of ["", ...(await walkDirs(INBOX))]) {
    const files = [];
    for (const name of await listFiles(folder(rel), RAW)) {
      const full = path.join(folder(rel), name);
      files.push({ name, path: rel ? `${rel}/${name}` : name, size: statSync(full).size, published: known.has(await sha(full)) });
    }
    const slug = rel ? slugPath(rel) : null;
    folders.push({
      path: rel || null, slug, files,
      onSite: slug ? existsSync(albumDir(slug)) : false,
      ...(slug ? await readMarkdown(noteFile(slug)) : { data: {}, body: "" }),
    });
  }
  return { folders };
}

// ── upload: the raw file is the request body (no JSON), see integrations/admin.mjs ──
// ?dir=<inbox folder>  or  ?album=<published album path> (uses the inbox folder that
// publishes to it, or creates one named after it), and ?name=<file name>.
// The same file uploaded twice (same name and bytes) is not stored twice.
async function upload(url, req) {
  const name = checkName(path.basename(url.searchParams.get("name") ?? ""));
  if (!RAW.has(path.extname(name).toLowerCase())) throw new Error(`${name}: formato não aceito (jpg, png, webp, avif, tif)`);
  let rel = url.searchParams.get("dir") ?? "";
  const album = url.searchParams.get("album");
  if (album !== null) {
    if (album) {
      rel = (await walkDirs(INBOX)).find((d) => slugPath(d) === album) ?? album;
      if (!existsSync(albumDir(album))) throw new Error("álbum não existe");
    } else rel = "";
  }
  if (rel) checkRel(rel);
  const dir = folder(rel);
  await mkdir(dir, { recursive: true });

  // write to a hidden temporary file first, so a broken upload never looks like a picture
  const tmp = path.join(dir, `.envio-${process.pid}-${Date.now()}`);
  let bytes = 0;
  const limit = new Transform({
    transform(chunk, _enc, cb) {
      bytes += chunk.length;
      cb(bytes > MAX_UPLOAD ? new Error("arquivo grande demais (máx. 300 MB)") : null, chunk);
    },
  });
  try {
    await pipeline(req, limit, createWriteStream(tmp));
    const target = path.join(dir, name);
    if (existsSync(target) && (await sha(target)) === (await sha(tmp))) {
      await rm(tmp);
      return { ok: true, path: rel ? `${rel}/${name}` : name, existed: true };
    }
    const final = freeName(dir, name);
    await rename(tmp, path.join(dir, final));
    return { ok: true, path: rel ? `${rel}/${final}` : final, existed: false };
  } catch (e) {
    await rm(tmp, { force: true });
    throw e;
  }
}

// ── actions ──────────────────────────────────────────────────────────────────
export const post = {
  async "galeria/entrada/folder/create"({ parent, name }) {
    const rel = parent ? `${checkRel(parent)}/${checkName(name)}` : checkName(name);
    if (existsSync(folder(rel))) throw new Error(`já existe "${rel}"`);
    await mkdir(folder(rel), { recursive: true });
    return { ok: true, path: rel };
  },

  // rename and/or move a folder (`to` = new path). Its album text follows it while the
  // album isn't on the site yet (a published album keeps its text where it is).
  async "galeria/entrada/folder/move"({ from, to }) {
    checkRel(from); checkRel(to);
    if (from === to) return;
    if (within(to, from)) throw new Error("uma pasta não pode ir para dentro dela mesma");
    if (existsSync(folder(to))) throw new Error(`já existe "${to}"`);
    await mkdir(path.dirname(folder(to)), { recursive: true });
    await rename(folder(from), folder(to));
    const [a, b] = [slugPath(from), slugPath(to)];
    if (a !== b && !existsSync(albumDir(a)) && existsSync(noteFile(a)) && !existsSync(noteFile(b))) {
      await mkdir(path.dirname(noteFile(b)), { recursive: true });
      await rename(noteFile(a), noteFile(b));
    }
    return { ok: true, path: to };
  },

  async "galeria/entrada/folder/delete"({ path: rel }) {
    checkRel(rel);
    if (!existsSync(folder(rel))) throw new Error("pasta não existe");
    await trash(folder(rel));
  },

  // move originals between folders ("" = the inbox root); a taken name gets -2, -3...
  async "galeria/entrada/files/move"({ paths, to }) {
    if (!Array.isArray(paths) || !paths.length) throw new Error("nenhuma imagem escolhida");
    if (to) checkRel(to);
    const dest = folder(to);
    if (!existsSync(dest)) throw new Error("pasta não existe");
    let moved = 0;
    for (const p of paths) {
      checkRel(p);
      if (dirOf(p) === (to ?? "")) continue;
      await rename(folder(p), path.join(dest, freeName(dest, path.basename(p))));
      moved++;
    }
    return { ok: true, moved };
  },

  async "galeria/entrada/files/delete"({ paths }) {
    if (!Array.isArray(paths) || !paths.length) throw new Error("nenhuma imagem escolhida");
    for (const p of paths) { checkRel(p); if (existsSync(folder(p))) await trash(folder(p)); }
    return { ok: true, removed: paths.length };
  },

  // text of the album this folder will become (src/content/albuns/<slug>.md);
  // cover and draft already set on the published album are kept
  async "galeria/entrada/album/save"({ path: rel, title, description, date, body }) {
    checkRel(rel);
    checkFuzzyDate(date);
    const file = noteFile(slugPath(rel));
    const old = (await readMarkdown(file)).data;
    await writeMarkdown(file, { ...old, title, description, date }, body ?? "", { removeIfEmpty: true });
  },

  // publish single files (a selection, or what was just uploaded)
  async "galeria/entrada/publish"({ paths }) {
    if (!Array.isArray(paths) || !paths.length) throw new Error("nenhuma imagem escolhida");
    for (const p of paths) {
      checkRel(p);
      if (!RAW.has(path.extname(p).toLowerCase())) throw new Error(`${p}: formato não aceito`);
    }
    return { ok: true, log: await runPublish(paths) };
  },
};

export const get = {
  "galeria/entrada/state": () => state(),
};

export const raw = {
  "galeria/entrada/upload": upload,
};
