// Refreshes src/data/github-cache.json with the current GitHub data.
// Run with `npm run cache:github` (uses GITHUB_TOKEN from the environment if present).
import { writeFileSync } from "node:fs";

const headers = { Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const response = await fetch("https://api.github.com/users/pessoa736/repos?per_page=100&type=owner", { headers });
if (!response.ok) {
  console.error(`GitHub API answered ${response.status}; cache not changed`);
  process.exit(1);
}
const repos = await response.json();
const data = {
  updatedAt: new Date().toISOString(),
  repos: Object.fromEntries(
    repos.map((r) => [r.name, { stars: r.stargazers_count, pushedAt: r.pushed_at, homepage: r.homepage || null }]),
  ),
};
writeFileSync(new URL("../src/data/github-cache.json", import.meta.url), JSON.stringify(data, null, 2) + "\n");
console.log(`cache updated: ${repos.length} repositories`);
