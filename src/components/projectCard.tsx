import Link from "next/link";
import type { GhRepo } from "mySite/lib/github";
import { ghPagesThumb, projectSlug } from "mySite/lib/github";
import LangChip from "mySite/components/langChip";
import AreaPill from "mySite/components/areaPill";

interface Props {
  repo: GhRepo;
  /** sizing: "lg" = vitrina (home), "md" = grade (lista) */
  size?: "lg" | "md" | "sm";
}

export default function ProjectCard({ repo, size = "md" }: Props) {
  const thumb = ghPagesThumb(repo);
  const slug = projectSlug(repo.name);

  return (
    <Link
      href={`/projetos/${slug}/`}
      className={
        "group block rounded-2xl overflow-hidden animated hover:-translate-y-0.5 " +
        (size === "lg" ? "" : "h-full")
      }
    >
      <div
        className={
          "relative rounded-2xl box-glass overflow-hidden " +
          (size === "lg" ? "aspect-[4/3]" : "aspect-[16/10]")
        }
      >
        <div
          className="absolute inset-0 group-hover:scale-105 animated"
          style={{
            backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%), url(${thumb})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "var(--foregroundTR)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-3.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white drop-shadow">
              {repo.name}
            </span>
            <AreaPill language={repo.language} className="!text-white/90 bg-black/40" />
          </div>
          <LangChip language={repo.language} />
        </div>
      </div>

      {size === "lg" && repo.description && (
        <p className="mt-3 text-sm opacity-70 line-clamp-2">{repo.description}</p>
      )}
    </Link>
  );
}
