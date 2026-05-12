import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import NavLink from "./NavLink";
import type { AuthUser } from "@/contexts/AuthContext";

interface MobileMenuProps {
  pathname: string;
  user: AuthUser | null;
  isLoading: boolean;
  onClose: () => void;
  onLogout: () => void;
}

/**
 * MobileMenu — the full-width drawer that appears below the header on small screens.
 *
 * Receives all required state and callbacks from Header via props to keep this
 * component stateless and purely presentational. State is owned by Header because
 * the open/close toggle button also lives there.
 */
export default function MobileMenu({ pathname, user, isLoading, onClose, onLogout }: MobileMenuProps) {
  return (
    <nav className="md:hidden pb-4 border-t border-border-subtle" id="mobile-nav">
      <div className="flex flex-col gap-1 pt-3">

        {/* Primary navigation links */}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            subcategories={item.subcategories}
            isActive={pathname.startsWith(item.href)}
            variant="mobile"
            onClick={onClose}
          />
        ))}

        {/* Auth section — separated from nav by a border */}
        {!isLoading && (
          user ? (
            <>
              <Link
                href="/profil"
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary border-t border-border-subtle mt-1 pt-3"
                onClick={onClose}
              >
                Profil ({user.username})
              </Link>
              <button
                onClick={() => { onClose(); onLogout(); }}
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
                onClick={onClose}
              >
                Anmelden
              </Link>
              <Link
                href="/registrieren"
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-brand-500"
                onClick={onClose}
              >
                Registrieren
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}
