import Link from "next/link";
import type { GhRepo } from "mySite/lib/github";
import { ghPagesThumb, projectSlug } from "mySite/lib/github";
import LangChip from "mySite/components/langChip";
import { ArrowUpRight } from "lucide-react";

interface Props {
  repos: GhRepo[];
}

export default function OnAirList({ repos }: Props) {
  if (!repos.length) return null;

  return (
    <section>
      <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
        {/* no ar */}
      </h2>
      <ul className="flex flex-col">
        {repos.map((r) => {
          const live =
            r.homepage ||
            (r.has_pages
              ? `https://pessoa736.github.io/${r.name}/`
              : null);
          if (!live) return null;
          const thumb = ghPagesThumb(r);
          return (
            <li
              key={r.id}
              className="group flex items-center gap-4 py-3 border-b last:border-b-0 border-[color:var(--foregroundTR)]"
            >
              <div
                className="size-10 rounded-lg shrink-0 bg-cover bg-center box-ghost"
                style={{ backgroundImage: `url(${thumb})` }}
              />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/projetos/${projectSlug(r.name)}/`}
                  className="text-sm font-medium hover:text-[color:var(--red)] animated"
                >
                  {r.name}
                </Link>
                {r.description && (
                  <p className="text-xs opacity-60 line-clamp-1 mt-0.5">
                    {r.description}
                  </p>
                )}
              </div>
              <LangChip language={r.language} />
              <Link
                href={live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full box-ghost animated hover:text-[color:var(--red)]"
              >
                abrir <ArrowUpRight size={12} strokeWidth={1.6} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
