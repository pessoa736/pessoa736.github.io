// Content collections. "escritos" = technical notes / blog posts, one Markdown file each
// in src/content/escritos/. Files starting with "_" are ignored (drafts and templates).
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { FUZZY_DATE } from "./lib/fuzzydate";

// "2021", "2021-03" or "2021-03-05". YAML reads a bare year as a number and a full date
// as a Date, so both are turned back into the text form.
const fuzzyDate = z
  .union([z.string(), z.number(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).trim()))
  .refine((v) => FUZZY_DATE.test(v), "data: AAAA, AAAA-MM ou AAAA-MM-DD");

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
    date: fuzzyDate.optional(),         // "2021" when only the year is known
    cover: z.string().optional(),       // picture id inside the album, e.g. "20210303-200924"
    draft: z.boolean().default(false),  // true = album not published yet
  }),
});

export const collections = { escritos, albuns };
