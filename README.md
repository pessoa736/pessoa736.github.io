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
| Technical notes | one Markdown file per post in `src/content/escritos/` (see `_modelo.md`) |
| Colours, fonts, spacing | `src/styles/tokens.css` |
| Privacy policy | `src/pages/privacidade.astro` (linked from the Google OAuth screen: keep the URL) |

`GITHUB_TOKEN` in `.env.local` is optional; it only raises the API rate limit.

## Status words

`ativo`, `em desenvolvimento`, `estudo`, `pausado`, `arquivo`, `descontinuado`, defined in
`src/data/projects.ts` and explained on the projects page.
