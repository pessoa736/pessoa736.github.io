import Link from "next/link";

interface Props {
  items: { label: string; href: string }[];
  title?: string;
}

/**
 * "Agora" — três links rápidos pro que tá rolando agora.
 * Substitui o velho "minha stack" em formato de card de skills.
 */
export default function Now({ items, title = "agora" }: Props) {
  return (
    <section>
      <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
        // {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full box-glass text-sm animated hover:text-[color:var(--red)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--red)]" />
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
