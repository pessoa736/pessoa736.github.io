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

export const collections = { escritos };
