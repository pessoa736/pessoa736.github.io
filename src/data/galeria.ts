// Gallery: drawings and photos.
//
// To add pictures: drop them in galeria-entrada/ (a sub-folder = an album) and run
// `npm run galeria:add`. They land in src/assets/galeria/[<album>/]<id>.webp, already
// light. Duplicates are refused by content.
// Keys below: "<id>.webp" for loose pictures, "<album>/<id>.webp" inside an album.
// Title, description, type and date per picture are all optional (see below).
// Newest first: entries with a date go by date, the rest keep file-name order.

export type Kind = "desenho" | "foto";

export interface GalleryInfo {
  title?: string;
  description?: string;   // a sentence or two, shown under the picture and in the viewer
  kind?: Kind;            // default: "foto"
  date?: string;          // "2026-11-27"
  alt?: string;           // description for screen readers; defaults to the title
  draft?: boolean;        // rascunho: still shown, but after everything else. New drawings
                          // start as drafts; `false` is kept to remember "not a draft"
  pinned?: string;        // set = pinned to the top of the gallery and of its album; holds
                          // when it was pinned (the latest pin comes first)
}

// The entries live in galeria.json so the dev-only admin page (/admin) can edit them.
// You can still edit the JSON by hand. Example entry:
//   "x-2021/2-desenho-terminado.webp": {
//     "title": "Lua sobre o mar",
//     "description": "Feito no caderno de Cálculo.",
//     "kind": "desenho",
//     "date": "2021-03-05"
//   }
import data from "./galeria.json";
export const galeria = data as Record<string, GalleryInfo>;
