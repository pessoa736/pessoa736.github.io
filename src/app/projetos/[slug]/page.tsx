import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import {
  getAllRepos,
  getRepoReadme,
  decodeBase64Utf8,
  renderMarkdown,
  ghPagesThumb,
  projectSlug,
} from "mySite/lib/github";
import { siteConfig } from "mySite/config/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  const repos = await getAllRepos();
  return repos.map((r) => ({ slug: projectSlug(r.name) }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const repos = await getAllRepos();
  const repo = repos.find((r) => projectSlug(r.name) === slug);
  if (!repo) return { title: "projeto" };
  return {
    title: repo.name,
    description: repo.description ?? `projeto ${repo.name} de davi.`,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const repos = await getAllRepos();
  const repo = repos.find((r) => projectSlug(r.name) === slug);
  if (!repo) notFound();

  const thumb = ghPagesThumb(repo);
  const live =
    repo.homepage || (repo.has_pages ? `https://${siteConfig.owner}.github.io/${repo.name}/` : null);

  let readmeHtml = "";
  try {
    const readme = await getRepoReadme(repo.name);
    if (readme) {
      const raw = decodeBase64Utf8(readme.content);
      readmeHtml = await renderMarkdown(raw);
    }
  } catch {
    readmeHtml = "<p>README indisponível.</p>";
  }

  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 max-w-3xl mx-auto">
      <Link
        href="/projetos/"
        className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100 jetbrains-mono animated"
      >
        <ArrowLeft size={12} strokeWidth={1.6} /> voltar
      </Link>

      <header className="mt-6 mb-10">
        <h1 className="jetbrains-mono font-bold text-3xl md:text-5xl tracking-tight">
          {repo.name}
        </h1>
        {repo.description && (
          <p className="mt-3 opacity-80 leading-relaxed">{repo.description}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full box-ghost text-sm animated hover:text-[color:var(--red)]"
          >
            ver repo <ArrowUpRight size={12} strokeWidth={1.6} />
          </Link>
          {live && (
            <Link
              href={live}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm animated border border-[color:var(--red)] text-[color:var(--red)]"
            >
              abrir site <ArrowUpRight size={12} strokeWidth={1.6} />
            </Link>
          )}
          {repo.language && (
            <span className="text-xs opacity-60">{repo.language}</span>
          )}
          <span className="text-xs opacity-40">★ {repo.stargazers_count}</span>
        </div>
      </header>

      <article
        className="
          prose-jetbrains
          [&_h1]:jetbrains-mono [&_h1]:text-2xl [&_h1]:mt-8 [&_h1]:font-semibold
          [&_h2]:jetbrains-mono [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:font-semibold
          [&_h3]:jetbrains-mono [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:font-semibold
          [&_p]:opacity-90 [&_p]:leading-relaxed [&_p]:my-4
          [&_a]:text-[color:var(--red)] [&_a]:underline-offset-4
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-4 [&_ul]:opacity-90
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-4 [&_ol]:opacity-90
          [&_code]:text-[color:var(--red)] [&_code]:text-sm
          [&_pre]:box-ghost [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4
          [&_blockquote]:border-l-2 [&_blockquote]:border-[color:var(--red)] [&_blockquote]:pl-4 [&_blockquote]:opacity-70 [&_blockquote]:my-4
          [&_img]:rounded-xl [&_img]:my-4
          [&_hr]:border-[color:var(--foregroundTR)] [&_hr]:my-8
          [&_table]:w-full [&_th]:text-left [&_td]:py-1
        "
        dangerouslySetInnerHTML={{ __html: readmeHtml }}
      />
    </main>
  );
}
