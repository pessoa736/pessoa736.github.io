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
| Projects (name, status, summary, notes, links) | `src/data/projects.ts`: edited by hand, the source of truth |
| Stars and last push date | GitHub API at build time (`src/lib/github.ts`) |
| Fallback when the API fails | `src/data/github-cache.json`; refresh with `npm run cache:github` |
| Gallery | drop images in `galeria-entrada/` (not committed), run `npm run galeria:add`; light WebP copies land in `src/assets/galeria/`, duplicates are detected by content. Optional title/description in `src/data/galeria.ts` |
| Gallery admin | `npm run dev`, then http://localhost:4321/admin: edit albums (text, cover, draft, rename), picture text, move or remove pictures, publish what is waiting. Exists only in the dev server (`integrations/admin.mjs`); nothing is committed for you |
| Technical notes | one Markdown file per post in `src/content/escritos/` (see `_modelo.md`) |
| Colours, fonts, spacing | `src/styles/tokens.css` |
| Privacy policy | `src/pages/privacidade.astro` (linked from the Google OAuth screen: keep the URL) |

`GITHUB_TOKEN` in `.env.local` is optional; it only raises the API rate limit.

## Status words

`ativo`, `em desenvolvimento`, `estudo`, `pausado`, `arquivo`, `descontinuado`, defined in
`src/data/projects.ts` and explained on the projects page.
