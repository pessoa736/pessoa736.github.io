import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "mySite/components/nav";
import Footer from "mySite/components/footer";
import ThemeScript from "mySite/components/themeScript";
import CartesianAura from "mySite/components/cartesianAura";

const JetBrainsMono = JetBrains_Mono({
  variable: "--font-Jetbrains-mono",
  preload: true,
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pessoa736.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "davi — garoto de programa",
    template: "%s · davi",
  },
  description:
    "portfólio do davi: projetos, stack e formação. UFRN · ECT · Lua, TypeScript, React, Next.js.",
  keywords: [
    "davi",
    "pessoa736",
    "portfólio",
    "lua",
    "typescript",
    "react",
    "nextjs",
    "UFRN",
    "ECT",
  ],
  authors: [{ name: "davi", url: siteUrl }],
  creator: "davi",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: "davi — garoto de programa",
    description:
      "portfólio do davi: projetos, stack e formação. UFRN · ECT · Lua, TypeScript, React, Next.js.",
    siteName: "pessoa736.github.io",
    images: [
      {
        url: "/images/projImg.png",
        width: 1200,
        height: 630,
        alt: "davi — portfólio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "davi — garoto de programa",
    description:
      "portfólio do davi: projetos, stack e formação. UFRN · ECT · Lua, TypeScript, React, Next.js.",
    images: ["/images/projImg.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${JetBrainsMono.variable} antialiased min-h-screen flex flex-col`}>
        <CartesianAura />
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
