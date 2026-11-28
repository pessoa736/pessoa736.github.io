// Gallery data, shared by /galeria and /galeria/<album>[/<sub-album>...].
//
// Source of truth = the files themselves:
//   src/assets/galeria/<id>.webp                   loose picture (no album)
//   src/assets/galeria/<album>/<id>.webp           picture inside an album; the folder name is the slug
//   src/assets/galeria/<album>/<sub>/<id>.webp     sub-album: a folder inside an album, any depth
// An album's path ("viagens/2024") is also its address: /galeria/viagens/2024.
// Only .webp is read: `npm run galeria:add` produces them. A raw photo dropped here by
// mistake (jpg/png) is never published.
//
// Optional text:
//   per picture  -> src/data/galeria.json, key "<id>.webp" or "<album path>/<id>.webp"
//   per album    -> src/content/albuns/<album path>.md (title, description, date, cover, draft + free text)
//                   e.g. src/content/albuns/viagens/2024.md
// A draft album hides its sub-albums too.
//
// Pinned pictures come before everything else (latest pin first), in the feed and in their album;
// drafts ("rascunho") come after everything else, still in the order below among themselves.
// Then, everywhere (feed, albums, sub-albums): most recent first, by YEAR; inside the same
// year, the ones with more information on the site (title, description, alt text, a date
// written by hand) come first; then the exact date; then the name.
// A picture's date = the one written in galeria.json, else the one in its original file
// name (20210303_200924.jpg). Pictures with neither go last.
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import { galeria, type Kind } from "../data/galeria";
import manifestData from "../data/galeria-manifest.json";
import { dateFromFileName, parseFuzzyDate, type FuzzyDate } from "./fuzzydate";

const manifest = manifestData as { file: string; added?: string; original?: string }[];
// position in the registry = publication order (higher = posted later): last tie-breaker
const postedOrder = new Map(manifest.map((e, i) => [e.file, i]));
const postedDate = new Map(manifest.filter((e) => e.added).map((e) => [e.file, e.added!]));
const originalName = new Map(manifest.filter((e) => e.original).map((e) => [e.file, e.original!]));

export interface Picture {
  key: string;               // "viagens/2024/foto.webp" or "foto.webp"
  album?: string;            // "viagens/2024"
  albumTitle?: string;       // title of that album (set when the album is visible)
  posted?: Date;             // day it entered the gallery (from the registry)
  title?: string;
  description?: string;
  kind: Kind;
  date?: FuzzyDate;          // written by hand (galeria.json); may be only a year
  taken?: FuzzyDate;         // guessed from the original file name
  info: number;              // how much was written about it: title, description, alt, date
  pinned?: string;           // when it was pinned to the top (ISO date-time)
  draft: boolean;            // rascunho: lowest priority
  alt: string;
  thumb: { src: string; width: number; height: number };
  full: string;
}

export interface Album {
  slug: string;              // full path: "viagens/2024"
  name: string;              // last segment: "2024"
  parent?: string;           // "viagens"; undefined for a top-level album
  title: string;
  description?: string;
  date?: FuzzyDate;          // only when written in the album's .md; may be only a year
  year?: number;             // for ordering: the .md date, a 4-digit year in the name, or its newest picture
  info: number;              // title, description, date written for the album
  cover: Picture;
  pictures: Picture[];       // the album's own pictures (not the sub-albums')
  children: Album[];         // sub-albums, same order as top-level albums
  total: number;             // pictures here + in every sub-album
}

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/galeria/**/*.webp", { eager: true });
const keyOf = (path: string) => path.replace("../assets/galeria/", "");
const dirOf = (key: string) => (key.includes("/") ? key.slice(0, key.lastIndexOf("/")) : undefined);
const parentOf = (slug: string) => dirOf(slug);

// every album path that has pictures, plus its ancestors ("a/b/c" -> a, a/b, a/b/c),
// so an album that only holds sub-albums still exists
function allAlbumPaths(): Set<string> {
  const out = new Set<string>();
  for (const p of Object.keys(files)) {
    const dir = dirOf(keyOf(p));
    if (!dir) continue;
    const parts = dir.split("/");
    for (let i = 1; i <= parts.length; i++) out.add(parts.slice(0, i).join("/"));
  }
  return out;
}

// true when the album or any album above it is a draft
function hiddenBy(drafts: Set<string>) {
  return (slug: string) => {
    for (let s: string | undefined = slug; s; s = parentOf(s)) if (drafts.has(s)) return true;
    return false;
  };
}
async function draftSet(): Promise<Set<string>> {
  return new Set((await getCollection("albuns")).filter((e) => e.data.draft).map((e) => e.id));
}

// Album paths only, for getStaticPaths. No getImage() here: images processed in that phase
// get dev-server URLs (/_image?href=/@fs/...) that don't exist on GitHub Pages.
export async function albumSlugs(): Promise<string[]> {
  const hidden = hiddenBy(await draftSet());
  return [...allAlbumPaths()].filter((s) => !hidden(s));
}

// Full data with thumbnails. Call it while rendering a page (not in getStaticPaths).
// `albums` = top-level albums (each with its sub-albums in `children`); `all` = every
// visible album by path, for album pages; `feed` = every visible picture, last posted first.
export async function loadGallery(): Promise<{ albums: Album[]; all: Map<string, Album>; loose: Picture[]; feed: Picture[] }> {
  const pictures = await Promise.all(
    Object.entries(files).map(async ([path, mod]): Promise<Picture> => {
      const key = keyOf(path);
      const info = galeria[key] ?? {};
      const thumb = await getImage({ src: mod.default, width: 720, format: "webp" });
      const date = parseFuzzyDate(info.date);
      return {
        key, album: dirOf(key),
        posted: postedDate.has(key) ? new Date(postedDate.get(key)! + "T12:00:00") : undefined,
        title: info.title,
        description: info.description,
        kind: info.kind ?? "foto",
        date,
        taken: date ? undefined : dateFromFileName(originalName.get(key) ?? key),
        info: [info.title, info.description, info.alt, date].filter(Boolean).length,
        pinned: info.pinned || undefined,
        draft: info.draft === true,
        alt: info.alt ?? info.title ?? "",
        thumb: { src: thumb.src, width: Number(thumb.attributes.width), height: Number(thumb.attributes.height) },
        full: mod.default.src,   // already light (max 1800px WebP); no second resize needed
      };
    }),
  );
  pictures.sort(byRecentThenInfo);

  const notes = new Map((await getCollection("albuns")).map((e) => [e.id, e.data]));
  const hidden = hiddenBy(new Set([...notes].filter(([, d]) => d.draft).map(([id]) => id)));
  const own = new Map<string, Picture[]>();
  for (const p of pictures) if (p.album) own.set(p.album, [...(own.get(p.album) ?? []), p]);

  // build deepest first, so a parent can take its cover from a sub-album
  const paths = [...allAlbumPaths()].filter((s) => !hidden(s)).sort((a, b) => b.split("/").length - a.split("/").length);
  const all = new Map<string, Album>();
  for (const slug of paths) {
    const note = notes.get(slug);
    const list = own.get(slug) ?? [];
    const children = paths.filter((s) => parentOf(s) === slug).map((s) => all.get(s)!).filter(Boolean);
    const name = slug.split("/").at(-1)!;
    const cover =
      list.find((p) => p.key === `${slug}/${note?.cover}` || p.key === `${slug}/${note?.cover}.webp`) ??
      list.find((p) => !p.draft) ?? list[0] ?? children[0]?.cover;   // a draft is never the default cover
    if (!cover) continue;                                  // nothing visible inside
    const yearInName = name.match(/(?:^|\D)((?:19|20)\d{2})(?:\D|$)/)?.[1];
    const date = parseFuzzyDate(note?.date);
    const newest = Math.max(...[...list, ...children.map((c) => c.cover)].map((p) => whenOf(p)?.year ?? -Infinity));
    all.set(slug, {
      slug, name, parent: parentOf(slug),
      title: note?.title ?? name,
      description: note?.description,
      date,
      year: date?.year ?? (yearInName ? Number(yearInName) : Number.isFinite(newest) ? newest : undefined),
      info: [note?.title, note?.description, date].filter(Boolean).length,
      cover,
      pictures: list,
      children,
      total: list.length + children.reduce((n, c) => n + c.total, 0),
    });
  }
  // newest year first; same year: more text first; then the exact date; then the name
  const order = (a: Album, b: Album) =>
    (b.year ?? -Infinity) - (a.year ?? -Infinity) || b.info - a.info ||
    (b.date?.sortValue ?? 0) - (a.date?.sortValue ?? 0) || a.slug.localeCompare(b.slug);
  for (const a of all.values()) a.children.sort(order);
  const albums = [...all.values()].filter((a) => !a.parent).sort(order);

  // the feed: loose pictures + those of visible albums (a draft album's pictures stay out),
  // in the same order as everywhere else (pictures is already sorted)
  for (const p of pictures) if (p.album) p.albumTitle = all.get(p.album)?.title;
  const feed = pictures.filter((p) => !p.album || all.has(p.album));

  return { albums, all, loose: pictures.filter((p) => !p.album), feed };
}

// ── order ────────────────────────────────────────────────────────────────────
export const whenOf = (p: Picture) => p.date ?? p.taken;
// most recent year first; same year: more information first; then the exact date;
// then the later posted; then the name. Undated pictures go last.
function byRecentThenInfo(a: Picture, b: Picture) {
  if (a.pinned || b.pinned) {
    if (!a.pinned) return 1;
    if (!b.pinned) return -1;
    if (a.pinned !== b.pinned) return b.pinned.localeCompare(a.pinned);   // latest pin first
  }
  if (a.draft !== b.draft) return a.draft ? 1 : -1;                       // drafts last
  const wa = whenOf(a), wb = whenOf(b);
  return (wb?.year ?? -Infinity) - (wa?.year ?? -Infinity)
    || b.info - a.info
    || (wb?.sortValue ?? 0) - (wa?.sortValue ?? 0)
    || (postedOrder.get(b.key) ?? -1) - (postedOrder.get(a.key) ?? -1)
    || a.key.localeCompare(b.key, "pt-BR", { numeric: true });
}
