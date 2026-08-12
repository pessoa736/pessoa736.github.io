/**
 * Stack agrupada por área, em colunas (não ícones misturados).
 * Cada coluna tem tom e justificativa — não é só um monte de logos.
 */
const areas = [
  {
    name: "linguagens",
    items: ["lua", "typescript", "javascript", "rust", "c++"],
    tone: "mais minhas preferidas são lua e rust.",
  },
  {
    name: "kernel/os",
    items: ["limine", "rust", "nalgebra", "Rhai"],
    tone: "to com bastante interesse atualmente em sitemas bare-metal",
  },
  {
    name: "web",
    items: ["react", "next.js", "tailwind", "chakra-ui", "prisma"],
    tone: "este site é o exemplo. server components quando dá.",
  },
  {
    name: "devops",
    items: ["git", "github actions", "github pages", "docker", "versel"],
    tone: "entrega continua leve. sem orquestração desnecessária.",
  },
];

export default function Stack() {
  return (
    <section>
      <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
       {"// stack em uso"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {areas.map((area) => (
          <article
            key={area.name}
            className="box-glass rounded-2xl p-4 animated hover:-translate-y-0.5"
          >
            <h3 className="jetbrains-mono text-xs uppercase tracking-wider opacity-50 mb-3">
              {area.name}
            </h3>
            <ul className="flex flex-wrap gap-1.5 mb-3">
              {area.items.map((it) => (
                <li
                  key={it}
                  className="text-sm px-2 py-0.5 rounded-md"
                  style={{ background: "var(--foregroundTR)" }}
                >
                  {it}
                </li>
              ))}
            </ul>
            <p className="text-xs opacity-60 leading-snug">{area.tone}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
