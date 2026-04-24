import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
    <html lang="de" className={`${inter.variable} h-full`} suppressHydrationWarning>
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
