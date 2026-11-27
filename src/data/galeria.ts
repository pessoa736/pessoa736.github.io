// Gallery: drawings and photos.
//
// To add a picture: put the file in src/assets/galeria/ (jpg, png or webp, any size;
// the build makes light versions). That's enough for it to show up.
// To give it a title, a type or a date, add an entry below with the same file name.
// Newest first: entries with a date go by date, the rest keep file-name order.

export type Kind = "desenho" | "foto";

export interface GalleryInfo {
  title?: string;
  kind?: Kind;            // default: "foto"
  date?: string;          // "2026-11-27"
  alt?: string;           // description for screen readers; defaults to the title
}

export const galeria: Record<string, GalleryInfo> = {
  // "meu-desenho.png": { title: "Lua sobre o mar", kind: "desenho", date: "2026-11-20" },
};
