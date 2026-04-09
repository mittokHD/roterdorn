import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "roterdorn — Rezensionen für Bücher, Filme, Musik, Spiele & Events",
    template: "%s — roterdorn",
  },
  description:
    "Ehrliche und ausführliche Rezensionen zu Büchern, Filmen, Musik, Spielen und Events. Entdecke dein nächstes Lieblingsstück.",
  keywords: [
    "Rezensionen",
    "Bücher",
    "Filme",
    "Spiele",
    "Musik",
    "Events",
    "Reviews",
    "roterdorn",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "roterdorn",
    title: "roterdorn — Rezensionen für Bücher, Filme, Musik, Spiele & Events",
    description:
      "Ehrliche und ausführliche Rezensionen zu Büchern, Filmen, Musik, Spielen und Events.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
