import { siteConfig } from "mySite/config/site";

interface Props {
  language: string | null;
}

/**
 * Linguagem como um dot de cor + nome. Zero emoji, zero ícone externo —
 * a cor já carrega o significado.
 */
export default function LangChip({ language }: Props) {
  if (!language) return null;
  const color = siteConfig.languageColor[language] ?? "#888";
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-80">
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {language}
    </span>
  );
}
