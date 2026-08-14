import type { Metadata } from "next";
import { getAllRepos } from "mySite/lib/github";
import ProjectGrid from "mySite/plates/projectGrid";
import Reveal from "mySite/components/reveal";

export const metadata: Metadata = {
  title: "projetos",
  description: "todos os repositórios públicos de davi, com filtro por área.",
};

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function ProjetosPage() {
  const repos = await getAllRepos();
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] opacity-50 jetbrains-mono mb-2">
          {/* todos os repos */}
        </p>
        <h1 className="jetbrains-mono font-bold text-3xl md:text-4xl tracking-tight">
          projetos.
        </h1>
      </header>
      <Reveal><ProjectGrid repos={repos} /></Reveal>
    </main>
  );
}
