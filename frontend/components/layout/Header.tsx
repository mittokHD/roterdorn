"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { SearchIcon, UserIcon, MenuIcon, CloseIcon } from "@/components/ui/Icons";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-50 border-b transition-all duration-300 bg-[rgba(26,26,38,0.6)] backdrop-blur-xl border-border-subtle"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02]"
            id="header-logo"
          >
            <Image src="/logo.png" alt="Roterdorn Logo" width={40} height={40} className="rounded-xl object-contain drop-shadow-md mr-1" />
            <span className="text-2xl font-black tracking-tight text-brand-500">
              roter
            </span>
            <span className="text-2xl font-black tracking-tight text-text-primary">
              dorn
            </span>
            <span className="ml-1 inline-block h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-125 bg-brand-500 shadow-brand" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" id="desktop-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary ${
                    isActive ? "text-text-primary bg-surface-tertiary" : "text-text-secondary"
                  }`}
                  id={`nav-${item.href.slice(1)}`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search, Auth & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/suche"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-border-subtle bg-surface-tertiary text-text-secondary hover:border-border-hover hover:text-text-primary"
              id="header-search"
            >
              <SearchIcon />
              <span className="hidden sm:inline">Suche</span>
            </Link>

            {/* Auth Button */}
            {!isLoading && (
              user ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-text-secondary">
                    {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-border-subtle bg-surface-tertiary text-text-secondary hover:border-border-hover hover:text-text-primary"
                  >
                    Abmelden
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-border-subtle bg-surface-tertiary text-text-secondary hover:border-border-hover hover:text-text-primary"
                >
                  <UserIcon />
                  Anmelden
                </Link>
              )
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden rounded-lg p-2 transition-colors text-text-secondary bg-surface-tertiary"
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
            className="md:hidden pb-4 border-t border-border-subtle"
            id="mobile-nav"
          >
            <div className="flex flex-col gap-1 pt-3">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "text-text-primary bg-surface-tertiary" : "text-text-secondary bg-transparent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile Auth */}
              {!isLoading && (
                user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-text-muted border-t border-border-subtle mt-1 pt-3">
                      Angemeldet als <span className="text-text-primary font-medium">{user.username}</span>
                    </div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-left text-text-secondary hover:text-text-primary"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary border-t border-border-subtle mt-1 pt-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Anmelden
                    </Link>
                    <Link
                      href="/registrieren"
                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-brand-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Registrieren
                    </Link>
                  </>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
