// Add pictures to the gallery.
//
//   1. drop images into galeria-entrada/          (that folder is NOT committed)
//      a sub-folder is an album: galeria-entrada/viagem-2024/*.jpg -> /galeria/viagem-2024
//      a folder inside it is a sub-album: galeria-entrada/viagens/2024/ -> /galeria/viagens/2024
//   2. npm run galeria:add                        lists what is waiting, publishes nothing
//      npm run galeria:add -- viagem-2024         publishes that album and its sub-albums (several allowed)
//      npm run galeria:add -- viagens/2024        publishes only that sub-album
//      npm run galeria:add -- viagens/2024/a.jpg  publishes only that file (several allowed)
//      npm run galeria:add -- --avulsas           publishes the loose files at the top level
//      npm run galeria:add -- --tudo              publishes everything waiting
//
// Each new picture is resized (max 1800px on the long side), converted to WebP and
// written to src/assets/galeria/[<album path>/]<id>.webp, where <id> comes from the file name.
// Duplicates never enter twice: we compare the exact bytes (sha256) AND a perceptual
// hash (dHash), so the same photo with another name, format or size is recognised.
// Titles/descriptions stay in src/data/galeria.json (editable at /admin), keyed by "<id>.webp".
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const INBOX = process.env.GALERIA_ENTRADA ?? path.join(ROOT, "galeria-entrada");
const OUT = path.join(ROOT, "src/assets/galeria");
const MANIFEST = path.join(ROOT, "src/data/galeria-manifest.json");
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const MAX_SIDE = 1800;
const QUALITY = 78;
const HAMMING_LIMIT = 8; // of 256 bits: near-identical images, not just similar ones

const slugText = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 60);
const slug = (name) => slugText(path.parse(name).name) || "imagem";
// an album path, one slug per folder: "Viagens/Natal 2024" -> "viagens/natal-2024"
// (same rule in integrations/admin/galeria.mjs; a folder name keeps its dots: "v1.0" -> "v1-0")
const slugPath = (rel) => rel.split("/").map((seg) => slugText(seg) || "album").join("/");

// 16x16 difference hash: 256 bits that survive resizing, recompression and format changes
async function dhash(buffer) {
  const { data } = await sharp(buffer)
    .rotate().greyscale().resize(17, 16, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let bits = "";
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) bits += data[y * 17 + x] < data[y * 17 + x + 1] ? "1" : "0";
  return BigInt("0b" + bits).toString(16).padStart(64, "0");
}
const hamming = (a, b) => {
  let x = BigInt("0x" + a) ^ BigInt("0x" + b), n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
};

await mkdir(INBOX, { recursive: true });
await mkdir(OUT, { recursive: true });
let manifest = [];
try { manifest = JSON.parse(await readFile(MANIFEST, "utf8")); } catch { /* first run */ }

// forget pictures whose file was deleted from the gallery, so they can be added again
const before = manifest.length;
manifest = manifest.filter((e) => existsSync(path.join(OUT, e.file)));
if (manifest.length < before) console.log(`(${before - manifest.length} imagem(ns) apagada(s) da galeria saíram do registro)`);

const images = async (dir) =>
  (await readdir(dir, { withFileTypes: true }))
    .filter((f) => f.isFile() && EXT.has(path.extname(f.name).toLowerCase()))
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));

// what is waiting in the inbox: loose files + one entry per folder, at any depth
// (album = the folder's path relative to the inbox, e.g. "viagens/2024")
const waiting = [{ album: null, label: "(avulsas)", files: await images(INBOX) }];
async function walk(rel) {
  const dirs = (await readdir(path.join(INBOX, rel), { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name).sort((a, b) => a.localeCompare(b));
  for (const name of dirs) {
    const sub = rel ? `${rel}/${name}` : name;
    waiting.push({ album: sub, label: sub, files: await images(path.join(INBOX, sub)) });
    await walk(sub);
  }
}
await walk("");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Na entrada (nada foi publicado):");
  for (const w of waiting) if (w.files.length) console.log(`  ${w.label.padEnd(24)} ${w.files.length} imagem(ns)  →  /galeria${w.album ? "/" + slugPath(w.album) : ""}`);
  console.log(`\nNa galeria: ${manifest.length} imagem(ns).`);
  console.log("Para publicar: npm run galeria:add -- <álbum>   |   -- --avulsas   |   -- --tudo");
  process.exit(0);
}
// an argument names a folder (by its real name or its slug; its sub-folders come along)
// or a single file inside the inbox ("2022/foto.jpg")
const names = args.filter((a) => !a.startsWith("--")).map((a) => a.replace(/^\/+|\/+$/g, ""));
const isFile = (a) => EXT.has(path.extname(a).toLowerCase()) && existsSync(path.join(INBOX, a));
const fileArgs = new Set(names.filter(isFile));
const folderArgs = names.filter((a) => !fileArgs.has(a));
const under = (w, a) => w.album !== null && [w.album, slugPath(w.album)].some((p) => p === a || p.startsWith(a + "/"));
const pick = args.includes("--tudo")
  ? waiting
  : waiting.map((w) => {
      if (w.album === null ? args.includes("--avulsas") : folderArgs.some((a) => under(w, a))) return w;
      const files = w.files.filter((f) => fileArgs.has(w.album ? `${w.album}/${f}` : f));
      return files.length ? { ...w, files } : null;
    }).filter(Boolean);
const unknown = folderArgs.filter((a) => !waiting.some((w) => under(w, a)));
if (unknown.length) { console.log(`Não achei em galeria-entrada/: ${unknown.join(", ")}`); process.exit(1); }

let added = 0, dupes = 0;
for (const w of pick) {
  const albumSlug = w.album ? slugPath(w.album) : null;
  const outDir = albumSlug ? path.join(OUT, albumSlug) : OUT;
  await mkdir(outDir, { recursive: true });
  if (w.files.length) console.log(`\n[${w.label}]`);

  for (const name of w.files) {
    const buffer = await readFile(path.join(INBOX, w.album ?? "", name));
    const sha = createHash("sha256").update(buffer).digest("hex");

    const exact = manifest.find((e) => e.sha256 === sha);
    if (exact) { console.log(`= ${name}: já está na galeria como ${exact.file} (mesmos bytes)`); dupes++; continue; }

    let hash;
    try { hash = await dhash(buffer); }
    catch (e) { console.log(`! ${name}: não consegui ler a imagem (${e.message})`); continue; }

    const near = manifest
      .map((e) => ({ e, d: hamming(hash, e.dhash) }))
      .filter((x) => x.d <= HAMMING_LIMIT)
      .sort((a, b) => a.d - b.d)[0];
    if (near) {
      console.log(`= ${name}: parece ser a mesma imagem que ${near.e.file} (diferença ${near.d}/256), ignorada`);
      dupes++; continue;
    }

    const prefix = albumSlug ? `${albumSlug}/` : "";
    let id = slug(name), n = 2;
    while (manifest.some((e) => e.file === `${prefix}${id}.webp`)) id = `${slug(name)}-${n++}`;

    const img = sharp(buffer).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
    const webp = await img.webp({ quality: QUALITY }).toBuffer({ resolveWithObject: true });
    await writeFile(path.join(outDir, `${id}.webp`), webp.data);

    manifest.push({
      id, album: albumSlug, file: `${prefix}${id}.webp`, sha256: sha, dhash: hash,
      width: webp.info.width, height: webp.info.height, bytes: webp.data.length,
      added: new Date().toISOString().slice(0, 10), original: w.album ? `${w.album}/${name}` : name,
    });
    console.log(`+ ${name} → ${prefix}${id}.webp (${webp.info.width}×${webp.info.height}, ${(webp.data.length / 1024).toFixed(0)} KB)`);
    added++;
    await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");   // save as we go: safe to stop midway
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${added} adicionada(s), ${dupes} ignorada(s) por já existir. Total na galeria: ${manifest.length}.`);
if (added) console.log("Os originais em galeria-entrada/ ficam onde estão; apague-os quando quiser (não vão pro git).");
