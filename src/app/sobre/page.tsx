import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "sobre",
  description: "sobre davi: formação, jeito de pensar, áreas em que trabalha.",
};

export default function SobrePage() {
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 max-w-3xl mx-auto flex flex-col gap-12">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] opacity-50 jetbrains-mono mb-2">
           {/* davi */}
        </p>
        <h1 className="jetbrains-mono font-bold text-3xl md:text-4xl tracking-tight">
          sobre.
        </h1>
        <p className="opacity-80 leading-relaxed mt-4">
          sou <span className="text-[color:var(--red)]">davi</span>, estudante
          do bacharelado interdisciplinar em ciência e tecnologia (BCT) na
          escola de ciência e tecnologia (ECT) da UFRN. construo engines,
          ferramentas e sistemas fictícios coerentes — a maioria em{" "}
          <span className="text-[color:var(--red)]">lua</span>, alguns em{" "}
          typescript/next.js quando o assunto pede. curiosidade arquitetural:
          quero entender princípios, não decorar procedimentos.
        </p>
      </header>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
           {/* formação */}
        </h2>
        <ul className="flex flex-col gap-3">
          <li className="box-glass rounded-2xl p-4">
            <div className="font-medium">Universidade Federal do Rio Grande do Norte</div>
            <div className="opacity-80 text-sm">
              Bacharelado Interdisciplinar em Ciência e Tecnologia (BCT) — ECT
            </div>
            <div className="opacity-50 text-xs mt-1">ago/2025 – ago/2028 · em curso</div>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
           {/* áreas de interesse */}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            ["computação", "kernels, compiladores, redes, engines"],
            ["matemática", "álgebra linear, transformações, espaços vetoriais"],
            ["design", "sistemas com identidade própria"],
            ["desenho", "raro, mas eventual. posto no instagram e X"],
            ["música", "rock, disco, anos 80, vaporwave, jpop, punk"],
          ].map(([title, sub]) => (
            <li key={title} className="box-glass rounded-2xl p-4">
              <div className="font-medium">{title}</div>
              <div className="opacity-60 text-xs mt-1">{sub}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
          {/* como trabalho */}
        </h2>
        <p className="opacity-80 leading-relaxed text-sm">
          aprendo melhor quando consigo ver o problema, a motivação da solução,
          a estrutura interna e as consequências. comento código com essa
          mentalidade: explicar princípios, mostrar trade-offs, evitar abstrações
          que escondem o que importa.
        </p>
      </section>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
          {/* contato */}
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <a
              href="mailto:pessoa736@users.noreply.github.com"
              className="hover:text-[color:var(--red)] animated"
            >
              pessoa736@users.noreply.github.com
            </a>
          </li>
          <li>
            <a
              href="https://github.com/pessoa736"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)] animated inline-flex items-center gap-1"
            >
              github.com/pessoa736
              <ArrowUpRight size={12} strokeWidth={1.6} />
            </a>
          </li>
          <li>
            <a
              href="https://instagram.com/pessoa736"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)] animated inline-flex items-center gap-1"
            >
              @pessoa736
              <ArrowUpRight size={12} strokeWidth={1.6} />
            </a>
          </li>
          <li>
            <a
              href="https://x.com/pessoa736"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)] animated inline-flex items-center gap-1"
            >
              @pessoa736
              <ArrowUpRight size={12} strokeWidth={1.6} />
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
