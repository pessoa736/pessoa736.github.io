// Add pictures to the gallery.
//
//   1. drop images into galeria-entrada/   (that folder is NOT committed)
//   2. npm run galeria:add
//
// Each new picture is resized (max 1800px on the long side), converted to WebP and
// written to src/assets/galeria/<id>.webp, where <id> comes from the file name.
// Duplicates never enter twice: we compare the exact bytes (sha256) AND a perceptual
// hash (dHash), so the same photo with another name, format or size is recognised.
// Titles/descriptions stay in src/data/galeria.ts, keyed by "<id>.webp".
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const INBOX = path.join(ROOT, "galeria-entrada");
const OUT = path.join(ROOT, "src/assets/galeria");
const MANIFEST = path.join(ROOT, "src/data/galeria-manifest.json");
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);
const MAX_SIDE = 1800;
const QUALITY = 78;
const HAMMING_LIMIT = 8; // of 256 bits: near-identical images, not just similar ones

const slug = (name) =>
  path.parse(name).name
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 60) || "imagem";

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

const files = (await readdir(INBOX, { withFileTypes: true }))
  .filter((f) => f.isFile() && EXT.has(path.extname(f.name).toLowerCase()))
  .map((f) => f.name)
  .sort();

if (files.length === 0) {
  console.log(`Nenhuma imagem em galeria-entrada/ (aceito: ${[...EXT].join(", ")}).`);
  console.log(`A galeria tem ${manifest.length} imagem(ns).`);
  process.exit(0);
}

let added = 0, dupes = 0;
for (const name of files) {
  const buffer = await readFile(path.join(INBOX, name));
  const sha = createHash("sha256").update(buffer).digest("hex");

  const exact = manifest.find((e) => e.sha256 === sha);
  if (exact) { console.log(`= ${name}: já está na galeria como ${exact.id} (mesmos bytes)`); dupes++; continue; }

  let hash;
  try { hash = await dhash(buffer); }
  catch (e) { console.log(`! ${name}: não consegui ler a imagem (${e.message})`); continue; }

  const near = manifest
    .map((e) => ({ e, d: hamming(hash, e.dhash) }))
    .filter((x) => x.d <= HAMMING_LIMIT)
    .sort((a, b) => a.d - b.d)[0];
  if (near) {
    console.log(`= ${name}: parece ser a mesma imagem que ${near.e.id} (diferença ${near.d}/256) — ignorada`);
    dupes++; continue;
  }

  let id = slug(name), n = 2;
  while (manifest.some((e) => e.id === id)) id = `${slug(name)}-${n++}`;

  const img = sharp(buffer).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
  const webp = await img.webp({ quality: QUALITY }).toBuffer({ resolveWithObject: true });
  await writeFile(path.join(OUT, `${id}.webp`), webp.data);

  manifest.push({
    id, file: `${id}.webp`, sha256: sha, dhash: hash,
    width: webp.info.width, height: webp.info.height, bytes: webp.data.length,
    added: new Date().toISOString().slice(0, 10), original: name,
  });
  console.log(`+ ${name} → ${id}.webp (${webp.info.width}×${webp.info.height}, ${(webp.data.length / 1024).toFixed(0)} KB)`);
  added++;
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${added} adicionada(s), ${dupes} ignorada(s) por já existir. Total: ${manifest.length}.`);
if (added) console.log("Os arquivos em galeria-entrada/ ficam onde estão; apague-os quando quiser (não vão pro git).");
