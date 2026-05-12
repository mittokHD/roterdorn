import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: {
    default: "roterdorn — Rezensionen für Bücher, Filme, Musik & Spiele",
    template: "%s — roterdorn",
  },
  description:
    "Ehrliche und ausführliche Rezensionen zu Büchern, Filmen, Musik und Spielen. Entdecke dein nächstes Lieblingsstück.",
  keywords: [
    "Rezensionen",
    "Bücher",
    "Filme",
    "Spiele",
    "Musik",
    "Reviews",
    "roterdorn",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "roterdorn",
    title: "roterdorn — Rezensionen für Bücher, Filme, Musik & Spiele",
    description:
      "Ehrliche und ausführliche Rezensionen zu Büchern, Filmen, Musik und Spielen.",
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
        {/* Prevents FOUC by reading localStorage before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}`,
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
