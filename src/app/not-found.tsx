import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 max-w-3xl mx-auto flex flex-col items-center justify-center text-center gap-8 min-h-[60vh]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] opacity-50 jetbrains-mono mb-3">
          {/* 404 */}
        </p>
        <h1 className="jetbrains-mono font-bold text-6xl md:text-8xl tracking-tight">
          404<span className="text-[color:var(--red)]">.</span>
        </h1>
      </div>
      <p className="opacity-70 leading-relaxed max-w-prose">
        não tem nada aqui. ou você seguiu um link quebrado, ou eu apaguei essa
        página e esqueci de avisar.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full box-glass text-sm animated hover:text-[color:var(--red)]"
      >
        voltar ao início
      </Link>
    </main>
  );
}
