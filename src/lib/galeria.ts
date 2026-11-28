// Gallery data, shared by /galeria and /galeria/<album>.
//
// Source of truth = the files themselves:
//   src/assets/galeria/<id>.webp            loose picture (no album)
//   src/assets/galeria/<album>/<id>.webp    picture inside an album; the folder name is the slug
// Only .webp is read: `npm run galeria:add` produces them. A raw photo dropped here by
// mistake (jpg/png) is never published.
//
// Optional text:
//   per picture  -> src/data/galeria.ts, key "<id>.webp" or "<album>/<id>.webp"
//   per album    -> src/content/albuns/<album>.md (title, description, date, cover, draft + free text)
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import { galeria, type Kind } from "../data/galeria";

export interface Picture {
  key: string;               // "x-2021/desenho.webp" or "foto.webp"
  album?: string;
  title?: string;
  description?: string;
  kind: Kind;
  date?: Date;
  alt: string;
  thumb: { src: string; width: number; height: number };
  full: string;
}

export interface Album {
  slug: string;
  title: string;
  description?: string;
  date?: Date;               // only when written in the album's .md
  year?: number;             // for ordering: the .md date, or a 4-digit year in the slug
  cover: Picture;
  pictures: Picture[];
}

const files = import.meta.glob<{ default: ImageMetadata }>("../assets/galeria/**/*.webp", { eager: true });

// Album slugs only, for getStaticPaths. No getImage() here: images processed in that phase
// get dev-server URLs (/_image?href=/@fs/...) that don't exist on GitHub Pages.
export async function albumSlugs(): Promise<string[]> {
  const notes = new Map((await getCollection("albuns")).map((e) => [e.id, e.data]));
  const slugs = new Set(Object.keys(files).map((p) => p.replace("../assets/galeria/", "").split("/")).filter((x) => x.length > 1).map((x) => x[0]));
  return [...slugs].filter((s) => !notes.get(s)?.draft);
}

// Full data with thumbnails. Call it while rendering a page (not in getStaticPaths).
export async function loadGallery(): Promise<{ albums: Album[]; loose: Picture[] }> {
  const pictures = await Promise.all(
    Object.entries(files).map(async ([path, mod]): Promise<Picture> => {
      const key = path.replace("../assets/galeria/", "");
      const parts = key.split("/");
      const album = parts.length > 1 ? parts[0] : undefined;
      const info = galeria[key] ?? {};
      const thumb = await getImage({ src: mod.default, width: 720, format: "webp" });
      return {
        key, album,
        title: info.title,
        description: info.description,
        kind: info.kind ?? "foto",
        date: info.date ? new Date(info.date + "T12:00:00") : undefined,
        alt: info.alt ?? info.title ?? "",
        thumb: { src: thumb.src, width: Number(thumb.attributes.width), height: Number(thumb.attributes.height) },
        full: mod.default.src,   // already light (max 1800px WebP); no second resize needed
      };
    }),
  );
  // file names from cameras start with the date (20210303_...), so name order ≈ time order
  pictures.sort((a, b) =>
    (b.date?.valueOf() ?? 0) - (a.date?.valueOf() ?? 0) || a.key.localeCompare(b.key, "pt-BR", { numeric: true }),
  );

  const notes = new Map((await getCollection("albuns")).map((e) => [e.id, e]));
  const bySlug = new Map<string, Picture[]>();
  for (const p of pictures) if (p.album) bySlug.set(p.album, [...(bySlug.get(p.album) ?? []), p]);

  const albums: Album[] = [];
  for (const [slug, list] of bySlug) {
    const note = notes.get(slug)?.data;
    if (note?.draft) continue;                         // album hidden until draft: false
    const cover = list.find((p) => p.key === `${slug}/${note?.cover}` || p.key === `${slug}/${note?.cover}.webp`) ?? list[0];
    const yearInSlug = slug.match(/(?:^|\D)(\d{4})(?:\D|$)/)?.[1];
    albums.push({
      slug,
      title: note?.title ?? slug,
      description: note?.description,
      date: note?.date,
      year: note?.date?.getFullYear() ?? (yearInSlug ? Number(yearInSlug) : undefined),
      cover,
      pictures: list,
    });
  }
  // newest first: the .md date, else 1 January of the year in the slug, else last
  const when = (a: Album) => a.date?.valueOf() ?? (a.year ? Date.UTC(a.year, 0, 1) : 0);
  albums.sort((a, b) => when(b) - when(a) || a.slug.localeCompare(b.slug));

  return { albums, loose: pictures.filter((p) => !p.album) };
}
