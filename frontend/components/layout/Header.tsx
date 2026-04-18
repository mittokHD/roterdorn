"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { SearchIcon, UserIcon, MenuIcon, CloseIcon } from "@/components/ui/Icons";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b transition-all duration-300"
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02]"
            id="header-logo"
          >
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: "var(--brand-500)" }}
            >
              roter
            </span>
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              dorn
            </span>
            <span
              className="ml-1 inline-block h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-125"
              style={{
                background: "var(--brand-500)",
                boxShadow: "var(--shadow-brand)",
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    background: isActive
                      ? "var(--bg-tertiary)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-primary)";
                      e.currentTarget.style.background = "var(--bg-elevated)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  id={`nav-${item.href.slice(1)}`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                      style={{ background: "var(--brand-500)" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search, Admin & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center justify-center rounded-lg p-2 transition-all duration-200"
              style={{
                color: "var(--text-secondary)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
              aria-label="Admin Login"
              title="Zum Admin-Dashboard"
            >
              <UserIcon />
            </Link>

            <Link
              href="/suche"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
              id="header-search"
            >
              <SearchIcon />
              <span className="hidden sm:inline">Suche</span>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden rounded-lg p-2 transition-colors"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-tertiary)",
              }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü öffnen"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden pb-4 border-t"
            style={{ borderColor: "var(--border-subtle)" }}
            id="mobile-nav"
          >
            <div className="flex flex-col gap-1 pt-3">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      background: isActive
                        ? "var(--bg-tertiary)"
                        : "transparent",
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
