import type { GhRepo } from "mySite/lib/github";
import ProjectCard from "mySite/components/projectCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  featured: GhRepo[];
}

export default function FeaturedGrid({ featured }: Props) {
  if (!featured.length) return null;
  return (
    <section>
      <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50">
            // projetos em destaque 
        </h2>
        <Link
          href="/projetos"
          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full box-glass animated hover:text-[color:var(--red)]"
        >
          ver todos <ArrowRight size={12} strokeWidth={1.6} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured.map((r) => (
          <ProjectCard key={r.id} repo={r} />
        ))}
      </div>
    </section>
  );
}
