"use client";

import { useMemo, useState } from "react";
import type { GhRepo } from "mySite/lib/github";
import { siteConfig } from "mySite/config/site";
import ProjectCard from "mySite/components/projectCard";

interface Props {
  repos: GhRepo[];
}

const ALL = "todas" as const;
type AreaFilter = (typeof siteConfig.areas)[number] | typeof ALL;

export default function ProjectGrid({ repos }: Props) {
  const [area, setArea] = useState<AreaFilter>(ALL);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repos.filter((r) => {
      if (area !== ALL) {
        const ra = siteConfig.languageArea[r.language ?? ""];
        if (ra !== area) return false;
      }
      if (q) {
        const haystack = `${r.name} ${r.description ?? ""} ${r.language ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [repos, area, query]);

  return (
    <>
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          {([ALL, ...siteConfig.areas] as const).map((a) => {
            const active = area === a;
            return (
              <button
                key={a as string}
                onClick={() => setArea(a)}
                className={
                  "px-3 py-1.5 rounded-full text-xs uppercase tracking-wider animated " +
                  (active
                    ? "text-[color:var(--red)] border border-[color:var(--red)]"
                    : "box-glass opacity-70 hover:opacity-100")
                }
              >
                {a as string}
              </button>
            );
          })}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filtrar por nome, descrição ou linguagem…"
          className="w-full sm:max-w-sm px-3 py-2 rounded-xl text-sm box-glass outline-none focus:border-[color:var(--red)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="opacity-50 text-sm">nenhum projeto com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ProjectCard key={r.id} repo={r} size="sm" />
          ))}
        </div>
      )}
    </>
  );
}
