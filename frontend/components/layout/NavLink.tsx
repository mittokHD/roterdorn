import Link from "next/link";

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  /** Controls layout and style differences between desktop and mobile navigation. */
  variant: "desktop" | "mobile";
  onClick?: () => void;
}

/**
 * NavLink — a navigation item used in both desktop and mobile contexts.
 *
 * The `variant` prop drives the two visual treatments:
 * - desktop: relative positioning for the active indicator bar, compact icon spacing
 * - mobile: full-width touch target with larger padding, no indicator bar
 */
export default function NavLink({ href, icon, label, isActive, variant, onClick }: NavLinkProps) {
  if (variant === "desktop") {
    return (
      <Link
        href={href}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary ${
          isActive ? "text-text-primary bg-surface-tertiary" : "text-text-secondary"
        }`}
        id={`nav-${href.slice(1)}`}
      >
        <span className="mr-1.5">{icon}</span>
        {label}
        {/* Active state indicator — a small bar anchored to the bottom of the link */}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand-500" />
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "text-text-primary bg-surface-tertiary" : "text-text-secondary bg-transparent"
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  );
}
