import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-32 px-4 sm:px-8 max-w-5xl mx-auto pb-12 text-sm relative z-10">
      <div className="box-glass rounded-2xl px-5 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 opacity-70">
        <div>
          <span className="jetbrains-mono font-medium">davi.</span>
          <span className="ml-2 opacity-70">
            feito em next.js, deploy em github pages.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/pessoa736"
            className="flex items-center gap-1 hover:text-[color:var(--red)] animated"
          >
            github <ArrowUpRight size={14} strokeWidth={1.6} />
          </a>
        </div>
      </div>
    </footer>
  );
}
