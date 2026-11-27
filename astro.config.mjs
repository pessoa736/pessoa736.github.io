// Astro config. The site is fully static: every page is generated at build time
// and published to GitHub Pages by .github/workflows/deploy.yml.
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pessoa736.github.io",
  trailingSlash: "ignore",
  // Old URLs from the Next.js version that no longer exist.
  redirects: {
    "/sites": "/projetos",
  },
});
