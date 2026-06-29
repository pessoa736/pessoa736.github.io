import type { Metadata } from "next";
import Link from "next/link";
import { getAllRepos } from "mySite/lib/github";
import { siteConfig } from "mySite/config/site";
import LangChip from "mySite/components/langChip";

export const metadata: Metadata = {
  title: "no ar",
  description: "sites publicados por davi.",
};

export const dynamic = "force-static";
export const revalidate = 3600;

function liveUrl(repo: { name: string; homepage: string | null; has_pages: boolean }) {
  if (repo.homepage) return repo.homepage;
  if (repo.has_pages && repo.name !== siteConfig.self.repoName) {
    return `https://${siteConfig.owner}.github.io/${repo.name}/`;
  }
  return null;
}

export default async function SitesPage() {
  const repos = await getAllRepos();
  const live = repos
    .map((r) => ({ repo: r, url: liveUrl(r) }))
    .filter((x): x is { repo: typeof repos[number]; url: string } => !!x.url)
    .sort((a, b) => a.repo.name.localeCompare(b.repo.name));

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] opacity-50 jetbrains-mono mb-2">
          {/* deployment público */}
        </p>
        <h1 className="jetbrains-mono font-bold text-3xl md:text-4xl tracking-tight">
          no ar.
        </h1>
        <p className="opacity-70 mt-2 max-w-prose text-sm">
          só sites que estão de fato publicados. github pages, vercel, ou onde quer
          que tenham ido parar.
        </p>
      </header>

      <ul className="flex flex-col">
        {live.map(({ repo, url }) => (
          <li
            key={repo.id}
            className="flex items-center gap-4 py-4 border-b border-[color:var(--foregroundTR)]"
          >
            <div className="flex-1 min-w-0">
              <Link
                href={url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-base hover:text-[color:var(--accent)] animated inline-flex items-center gap-1.5"
              >
                {repo.name}
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </Link>
              {repo.description && (
                <p className="opacity-60 text-sm mt-0.5 line-clamp-2">
                  {repo.description}
                </p>
              )}
            </div>
            <LangChip language={repo.language} />
            <Link
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs opacity-60 hover:opacity-100 animated"
            >
              repo
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
