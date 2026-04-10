"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Error Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div 
        className="rounded-2xl p-8 max-w-lg"
        style={{ 
          background: "var(--bg-tertiary)", 
          border: "1px solid var(--border-brand)"
        }}
      >
        <h2 className="text-2xl font-black mb-3" style={{ color: "var(--brand-500)" }}>
          Ein Fehler ist aufgetreten!
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Beim Laden dieser Seite ist leider etwas schiefgelaufen. Bitte versuche es noch einmal.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-hover hover:scale-105"
            style={{
              background: "var(--brand-500)",
              color: "white",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            Neu laden
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-hover hover:scale-105"
            style={{
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
