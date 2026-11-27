// Build-time data from the GitHub API: stars, last push and homepage of each repository.
// Everything else about a project comes from src/data/projects.ts.
//
// The site is built in GitHub Actions, where the API can hit its rate limit or be down.
// So the last good answer is kept in src/data/github-cache.json (committed), and the build
// falls back to it instead of failing. Refresh it with `npm run cache:github`.

import cache from "../data/github-cache.json";

export interface RepoStats {
  stars: number;
  pushedAt: string;          // ISO date of the last push
  homepage: string | null;
}

type StatsMap = Record<string, RepoStats>;

const OWNER = "pessoa736";

async function fetchFromApi(): Promise<StatsMap> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  // A token only raises the rate limit; public data works without it.
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&type=owner`, { headers });
  if (!response.ok) throw new Error(`GitHub API answered ${response.status}`);

  const repos = (await response.json()) as {
    name: string; stargazers_count: number; pushed_at: string; homepage: string | null;
  }[];
  return Object.fromEntries(
    repos.map((r) => [r.name, { stars: r.stargazers_count, pushedAt: r.pushed_at, homepage: r.homepage || null }]),
  );
}

// One request per build, shared by every page.
let stats: Promise<StatsMap> | undefined;

export function getRepoStats(): Promise<StatsMap> {
  stats ??= fetchFromApi().catch((error) => {
    console.warn(`[github] using cached data from ${cache.updatedAt}: ${error.message}`);
    return cache.repos as StatsMap;
  });
  return stats;
}

export { fetchFromApi };
