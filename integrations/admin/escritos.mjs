// Admin API for the posts: one Markdown file per post in src/content/escritos/<slug>.md.
// The file name is the address (/escritos/<slug>). Files starting with "_" (the model)
// are not posts and are never listed or touched.
import { existsSync } from "node:fs";
import { readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { ROOT, SLUG, checkDate, inside, readMarkdown, writeMarkdown } from "./util.mjs";

const DIR = path.join(ROOT, "src/content/escritos");
const file = (slug) => inside(DIR, `${slug}.md`);
function checkSlug(slug) {
  if (!SLUG.test(slug ?? "")) throw new Error("endereço: só letras minúsculas, números e hífens (ex.: como-o-boot-funciona)");
}

export const get = {
  async "escritos/state"() {
    const names = existsSync(DIR) ? (await readdir(DIR)).filter((n) => n.endsWith(".md") && !n.startsWith("_")) : [];
    const posts = [];
    for (const n of names) posts.push({ slug: n.slice(0, -3), ...(await readMarkdown(path.join(DIR, n))) });
    // newest first, like /escritos
    posts.sort((a, b) => String(b.data.date ?? "").localeCompare(String(a.data.date ?? "")) || a.slug.localeCompare(b.slug));
    return { posts };
  },
};

export const post = {
  // create (original = null) or update; a new slug renames the file (the address changes)
  async "escritos/save"({ original, slug, title, description, date, tags, draft, body }) {
    checkSlug(slug);
    if (original) checkSlug(original);
    if (!title?.trim()) throw new Error("falta o título");
    if (!description?.trim()) throw new Error("falta a descrição (uma frase: aparece na lista e nos buscadores)");
    if (!date) throw new Error("falta a data");
    checkDate(date);
    if (original && !existsSync(file(original))) throw new Error(`não achei "${original}"`);
    if (slug !== original && existsSync(file(slug))) throw new Error(`já existe um escrito "${slug}"`);
    // keep any header field the admin doesn't know about
    const old = original ? await readMarkdown(file(original)) : { data: {} };
    const data = {
      ...old.data,
      title: title.trim(),
      description: description.trim(),
      date,
      tags: (Array.isArray(tags) ? tags : []).map((t) => String(t).trim()).filter(Boolean),
      draft: !!draft,
    };
    if (original && slug !== original) await rename(file(original), file(slug));
    await writeMarkdown(file(slug), data, body ?? "", { keep: ["tags", "draft"] });
    return { ok: true, slug };
  },

  async "escritos/delete"({ slug }) {
    checkSlug(slug);
    if (!existsSync(file(slug))) throw new Error(`não achei "${slug}"`);
    await rm(file(slug));
  },
};
