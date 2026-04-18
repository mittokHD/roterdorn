"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t bg-surface-secondary border-border-subtle"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block group">
              <span className="text-xl font-black text-brand-500">
                roter
              </span>
              <span className="text-xl font-black text-text-primary">
                dorn
              </span>
            </Link>
            <p
              className="mt-3 text-sm leading-relaxed max-w-xs text-text-muted"
            >
              Ehrliche Rezensionen zu Büchern, Filmen, Musik, Spielen und Events.
              Unabhängig und mit Leidenschaft.
            </p>
          </div>

          {/* Kategorien */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4 text-text-secondary"
            >
              Kategorien
            </h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 text-text-muted hover:text-text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4 text-text-secondary"
            >
              Mehr
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/suche"
                  className="text-sm transition-colors duration-200 text-text-muted hover:text-text-accent"
                >
                  Suche
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 border-border-subtle"
        >
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} roterdorn. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-text-muted">
            Gebaut mit ❤️ und viel Kaffee
          </p>
        </div>
      </div>
    </footer>
  );
}
