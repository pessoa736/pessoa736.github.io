import Image from "next/image";

/**
 * Hero enxuto, com tipografia respirada. Sem painéis empilhados.
 * Diferencia do portfolio-genérico com uma única imagem nítida e uma assinatura
 * monoespaçada em vez de "olá, eu sou X".
 */
export default function Hero() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
      <div>
        <p className="text-xs opacity-50 jetbrains-mono tracking-[0.2em] uppercase mb-3">
          UFRN · ECT · 2025
        </p>
        <h1 className="jetbrains-mono font-bold leading-[1.05] tracking-tight text-4xl md:text-6xl">
          davi.
          <br />
          <span className="opacity-60">garoto</span>{" "}
          <span className="text-[color:var(--red)]">de</span>{" "}
          <span className="opacity-60">programa.</span>
        </h1>
        <p className="mt-6 max-w-prose opacity-80 leading-relaxed">
          construo engines, ferramentas e sistemas fictícios coerentes — quase todos em{" "}
          <span className="text-[color:var(--red)]">lua</span>. estudante de
          ciência e tecnologia na ufrn.
        </p>
      </div>

      <Image
        src="/images/jpg/eu.jpg"
        width={320}
        height={360}
        alt="davi"
        priority
        className="rounded-2xl box-ghost w-32 md:w-48 h-auto self-end md:self-center"
      />
    </section>
  );
}
