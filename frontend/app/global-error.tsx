"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
          <div 
            className="rounded-2xl p-8 mb-8"
            style={{ 
              background: "var(--bg-tertiary)", 
              border: "1px solid var(--border-brand)"
            }}
          >
            <h1 className="text-3xl font-black mb-2" style={{ color: "var(--brand-500)" }}>
              Oops! Etwas ist schiefgelaufen.
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Wir konnten die Daten leider nicht laden. Entweder ist der Server gerade überlastet oder es gab ein temporäres Problem.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: "var(--brand-500)",
                  color: "white",
                  boxShadow: "var(--shadow-brand)",
                }}
              >
                Erneut versuchen
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Zur Startseite
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
