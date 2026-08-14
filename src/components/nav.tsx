"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Globe2, UserRound, Menu, X } from "lucide-react";
import ThemeToggle from "mySite/components/themeToggle";

const links = [
  { href: "/", label: "início", icon: Home },
  { href: "/projetos", label: "projetos", icon: FolderOpen },
  { href: "/sites", label: "no ar", icon: Globe2 },
  { href: "/sobre", label: "sobre", icon: UserRound },
];

export default function Nav() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);

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

        {/* Desktop: links inline */}
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
          <ThemeToggle />
          {/* Hambúrguer: só mobile */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden p-1.5 rounded-full animated hover:bg-[color:var(--foregroundTR)]"
            aria-label={open ? "fechar menu" : "abrir menu"}
            aria-expanded={open}
          >
            {open ? (
              <X size={16} strokeWidth={1.6} />
            ) : (
              <Menu size={16} strokeWidth={1.6} />
            )}
          </button>
        </div>
      </nav>

      {/* Menu expandido: só mobile */}
      {open && (
        <ul className="sm:hidden box-glass-strong rounded-2xl mt-2 p-2 flex flex-col gap-1 text-sm">
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
                  onClick={() => setOpen(false)}
                  className={
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl animated " +
                    (active
                      ? "text-[color:var(--red)]"
                      : "opacity-70 hover:opacity-100")
                  }
                >
                  <Icon size={16} strokeWidth={1.6} />
                  <span>{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
