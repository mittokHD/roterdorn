import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://roterdorn.de"),
  title: {
    default: "roterdorn — Rezensionen, Artikel und Interviews",
    template: "%s — roterdorn",
  },
  description:
    "Ehrliche und ausführliche Rezensionen zu Büchern, Filmen, Musik, Spielen und Events.",
  keywords: [
    "Rezensionen",
    "Bücher",
    "Filme",
    "Spiele",
    "Musik",
    "Events",
    "Artikel",
    "Interviews",
    "Reviews",
    "roterdorn",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "roterdorn",
    title: "roterdorn — Rezensionen, Artikel und Interviews",
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
    <html lang="de" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
