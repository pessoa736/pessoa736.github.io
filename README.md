# pessoa736.github.io

My personal site: who I am, my projects with their real status, technical notes, and the
privacy policy of my assistant's Google app. Live at **https://pessoa736.github.io**.

Static site built with [Astro](https://astro.build) and published to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `main` (and once a day, to refresh GitHub data).

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
```

## Where things live

| What | Where |
|---|---|
| Projects (name, status, summary, notes, links) | `src/data/projects.json` (the source of truth; edit at `/admin/projetos` or by hand). Status/area words and the build-time check live in `src/data/projects.ts` |
| Stars and last push date | GitHub API at build time (`src/lib/github.ts`) |
| Fallback when the API fails | `src/data/github-cache.json`; refresh with `npm run cache:github` |
| Gallery | drop images in `galeria-entrada/` (not committed), run `npm run galeria:add`; light WebP copies land in `src/assets/galeria/`, duplicates are detected by content. A folder is an album, a folder inside it a sub-album (`viagens/2024` → `/galeria/viagens/2024`). `/galeria` shows every picture, last posted first (order of `galeria-manifest.json`), with a switch to the albums view (`?ver=albuns`). Optional text per picture in `src/data/galeria.json`, per album in `src/content/albuns/<path>.md` |
| Admin | `npm run dev`, then http://localhost:4321/admin. **Galeria**: albums and sub-albums (create, rename, move, delete, text, cover, draft), select several pictures (click, shift-click) to move or remove them, or drag them onto an album; add pictures from the computer straight into an album. **Galeria / entrada**: organise `galeria-entrada/` before publishing (folders, sub-folders, move, album text in advance, upload) and publish a folder or just a selection; "apagar" sends originals to the system trash (`gio trash`), never deletes them. **Projetos**: create, edit, reorder, remove. **Escritos**: write, edit, rename, delete posts. Exists only in the dev server (`integrations/admin.mjs` + `integrations/admin/`, pages in `src/admin/`); nothing is committed for you |
| Technical notes | one Markdown file per post in `src/content/escritos/` (see `_modelo.md`), or `/admin/escritos` |
| Colours, fonts, spacing | `src/styles/tokens.css` |
| Privacy policy | `src/pages/privacidade.astro` (linked from the Google OAuth screen: keep the URL) |

`GITHUB_TOKEN` in `.env.local` is optional; it only raises the API rate limit.

## Status words

`ativo`, `em desenvolvimento`, `estudo`, `pausado`, `arquivo`, `descontinuado`, defined in
`src/data/projects.ts` and explained on the projects page.
