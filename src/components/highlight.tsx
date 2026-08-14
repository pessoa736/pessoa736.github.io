/**
 * Recebe um texto e uma lista de palavras-chave. Renderiza inline,
 * pintando as palavras-chave com var(--red).
 *
 * Uso: <Highlight text="programo em lua e typescript" keywords={["lua", "typescript"]} />
 */

const DEFAULT_KEYWORDS = [
  "lua",
  "typescript",
  "javascript",
  "rust",
  "c++",
  "react",
  "next.js",
  "tailwind",
  "chakra-ui",
  "limine",
  "nalgebra",
  "spin",
  "github",
  "vercel",
  "docker",
  "github actions",
  "github pages",
] as const;

interface Props {
  text: string;
  keywords?: readonly string[];
}

export default function Highlight({ text, keywords = DEFAULT_KEYWORDS }: Props) {
  // Escapa regex especial chars e agrupa por tamanho (maiores primeiro)
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(${sorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );

  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) => {
        const isKeyword = keywords.some(
          (k) => k.toLowerCase() === part.toLowerCase(),
        );
        return isKeyword ? (
          <span key={i} className="text-[color:var(--red)]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
