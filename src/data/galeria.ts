// Gallery: drawings and photos.
//
// To add a picture: drop it in galeria-entrada/ and run `npm run galeria:add`.
// It lands here as <id>.webp, already light. Duplicates are refused by content.
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
