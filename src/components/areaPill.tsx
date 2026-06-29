import { siteConfig } from "mySite/config/site";

interface Props {
  language: string | null;
  className?: string;
}

export default function AreaPill({ language, className = "" }: Props) {
  if (!language) return null;
  const area = siteConfig.languageArea[language];
  if (!area) return null;
  return (
    <span
      className={
        "text-[10px] uppercase box-ghost tracking-wider px-2 py-0.5 rounded-full" +
        className
      }
    >
      {area}
    </span>
  );
}
