// Content collections. "escritos" = technical notes / blog posts, one Markdown file each
// in src/content/escritos/. Files starting with "_" are ignored (drafts and templates).
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const escritos = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/escritos" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),          // one sentence, shown in lists and in the page <meta>
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false), // drafts are built in `npm run dev` only
  }),
});

// "albuns" = optional text for a gallery album: src/content/albuns/<album-slug>.md,
// same name as the folder in src/assets/galeria/. Everything is optional.
const albuns = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/albuns" }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    cover: z.string().optional(),       // picture id inside the album, e.g. "20210303-200924"
    draft: z.boolean().default(false),  // true = album not published yet
  }),
});

export const collections = { escritos, albuns };
