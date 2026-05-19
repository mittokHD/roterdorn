"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { SearchIcon, MenuIcon, CloseIcon } from "@/components/ui/Icons";
import { useAuth } from "@/contexts/AuthContext";
import NavLink from "./NavLink";
import HeaderAuth from "./HeaderAuth";
import MobileMenu from "./MobileMenu";

/**
 * Header — the sticky top navigation bar.
 *
 * This component is intentionally kept as a thin orchestrator. It owns:
 * - mobileMenuOpen state (toggle button and drawer must share it)
 * - handleLogout (needs router for the post-logout redirect)
 *
 * All UI rendering is delegated to focused subcomponents:
 * - NavLink: a single nav item (shared between desktop & mobile)
 * - HeaderAuth: desktop auth controls (login/logout)
 * - MobileMenu: full mobile drawer with nav + auth
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    const desktopNavQuery = window.matchMedia("(min-width: 1536px)");
    const closeAtDesktopWidth = () => {
      if (desktopNavQuery.matches) setMobileMenuOpen(false);
    };

    closeAtDesktopWidth();
    desktopNavQuery.addEventListener("change", closeAtDesktopWidth);

    return () => {
      desktopNavQuery.removeEventListener("change", closeAtDesktopWidth);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b transition-all duration-300 bg-[rgba(26,26,38,0.6)] backdrop-blur-xl border-border-subtle">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* ─── Main Bar ─────────────────────────────── */}
        <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="group flex min-w-max items-center gap-2 transition-transform duration-200 hover:scale-[1.02]"
            id="header-logo"
          >
            <Image
              src="/logo.png"
              alt="Roterdorn Logo"
              width={48}
              height={48}
              className="rounded-xl object-contain drop-shadow-md"
            />
            <span className="text-2xl font-black tracking-tight" aria-label="roterdorn">
              <span className="text-brand-500">roter</span>
              <span className="text-text-primary">dorn</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="col-start-2 hidden min-w-0 justify-center gap-1 2xl:flex" id="desktop-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                subcategories={item.subcategories}
                isActive={pathname.startsWith(item.href)}
                variant="desktop"
              />
            ))}
          </nav>

          {/* Actions: Search, Auth, Mobile Toggle */}
          <div className="col-start-3 flex min-w-max justify-self-end items-center gap-3">
            <Link
              href="/suche"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-border-subtle bg-surface-tertiary text-text-secondary hover:border-border-hover hover:text-text-primary"
              id="header-search"
            >
              <SearchIcon />
              <span className="hidden sm:inline">Suche</span>
            </Link>

            <HeaderAuth user={user} isLoading={isLoading} onLogout={handleLogout} />

            <button
              className="2xl:hidden rounded-lg p-2 transition-colors text-text-secondary bg-surface-tertiary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü öffnen"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Drawer ─────────────────────────── */}
        {mobileMenuOpen && (
          <MobileMenu
            pathname={pathname}
            user={user}
            isLoading={isLoading}
            onClose={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
          />
        )}

      </div>
    </header>
  );
}
