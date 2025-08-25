import type { Metadata } from "next";
import { Provider } from "site/components/ui/provider";
import "./global.css";

export const metadata: Metadata = {
  title: "Davi Pessoa — Desenvolvedor Front-end",
  description: "Portfólio e projetos de Davi Pessoa, desenvolvedor front-end focado em Next.js e React.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
