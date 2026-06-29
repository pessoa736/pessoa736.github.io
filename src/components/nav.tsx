"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Globe2, UserRound } from "lucide-react";
import ThemeToggle from "mySite/components/themeToggle";

const links = [
  { href: "/", label: "início", icon: Home },
  { href: "/projetos", label: "projetos", icon: FolderOpen },
  { href: "/sites", label: "no ar", icon: Globe2 },
  { href: "/sobre", label: "sobre", icon: UserRound },
];

export default function Nav() {
  const path = usePathname() || "/";

  return (
      <header className="fixed top-4 left-4 right-4 z-50 max-w-5xl mx-auto">
      <nav className="box-glass-strong rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="jetbrains-mono font-bold text-base tracking-tight animated hover:opacity-80 flex items-center"
          aria-label="voltar ao início"
        >
          davi <span className="text-[color:var(--red)]">.</span>
        </Link>

        <ul className="hidden sm:flex items-center gap-1 text-sm">
          {links.map((l) => {
            const Icon = l.icon;
            const active =
              l.href === "/"
                ? path === "/"
                : path === l.href || path.startsWith(l.href + "/");
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full animated " +
                    (active
                      ? "text-[color:var(--red)]"
                      : "opacity-70 hover:opacity-100")
                  }
                >
                  <Icon size={14} strokeWidth={1.6} />
                  <span>{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/projetos"
            className="sm:hidden p-1.5 rounded-full animated hover:bg-[color:var(--foregroundTR)]"
            aria-label="projetos"
          >
            <FolderOpen size={16} strokeWidth={1.6} />
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
