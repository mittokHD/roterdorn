import Link from "next/link";
import { UserIcon } from "@/components/ui/Icons";
import type { AuthUser } from "@/contexts/AuthContext";

interface HeaderAuthProps {
  user: AuthUser | null;
  isLoading: boolean;
  onLogout: () => void;
}

/**
 * HeaderAuth — desktop-only authentication controls shown in the header bar.
 *
 * Renders nothing while the auth state is loading to avoid layout shift (CLS).
 * Renders a username + logout button for authenticated users, or a login link otherwise.
 */
export default function HeaderAuth({ user, isLoading, onLogout }: HeaderAuthProps) {
  // Suppress rendering until the auth cookie has been validated server-side.
  // This prevents a flicker from "Anmelden" → username on page load.
  if (isLoading) return null;

  if (user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link
          href="/profil"
          className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          {user.username}
        </Link>
        {user.isAdmin && (
          <Link
            href="/admin/beitraege"
            className="text-sm font-medium text-text-accent hover:text-brand-400 transition-colors"
          >
            Admin
          </Link>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-border-subtle bg-surface-tertiary text-text-secondary hover:border-border-hover hover:text-text-primary"
        >
          Abmelden
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all duration-200 border border-border-subtle bg-surface-tertiary text-text-secondary hover:border-border-hover hover:text-text-primary"
    >
      <UserIcon />
      Anmelden
    </Link>
  );
}
