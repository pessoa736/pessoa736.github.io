// Gallery: drawings and photos.
//
// To add pictures: drop them in galeria-entrada/ (a sub-folder = an album) and run
// `npm run galeria:add`. They land in src/assets/galeria/[<album>/]<id>.webp, already
// light. Duplicates are refused by content.
// Keys below: "<id>.webp" for loose pictures, "<album>/<id>.webp" inside an album.
// To give it a title, a description, a type or a date (all optional), add an entry
// below with the same file name.
// Newest first: entries with a date go by date, the rest keep file-name order.

export type Kind = "desenho" | "foto";

export interface GalleryInfo {
  title?: string;
  description?: string;   // a sentence or two, shown under the picture and in the viewer
  kind?: Kind;            // default: "foto"
  date?: string;          // "2026-11-27"
  alt?: string;           // description for screen readers; defaults to the title
}

export const galeria: Record<string, GalleryInfo> = {
  // "meu-desenho.png": {
  //   title: "Lua sobre o mar",
  //   description: "Feito no caderno de Cálculo, numa aula sobre integrais.",
  //   kind: "desenho",
  //   date: "2026-11-20",
  // },
};
