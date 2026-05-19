import Link from "next/link";
import type { NavSubcategory } from "@/lib/constants";

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  subcategories?: NavSubcategory[];
  variant: "desktop" | "mobile";
  onClick?: () => void;
}

const subcategoryId = (href: string, label: string) =>
  `nav-${`${href}-${label}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

export default function NavLink({
  href,
  icon,
  label,
  isActive,
  subcategories = [],
  variant,
  onClick,
}: NavLinkProps) {
  if (variant === "desktop") {
    const link = (
      <Link
        href={href}
        className={`relative block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary ${
          isActive ? "text-text-primary bg-surface-tertiary" : "text-text-secondary"
        }`}
        id={`nav-${href.slice(1)}`}
        aria-haspopup={subcategories.length > 0 ? "menu" : undefined}
      >
        <span className="mr-1.5">{icon}</span>
        {label}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand-500" />
        )}
      </Link>
    );

    if (subcategories.length === 0) return link;

    return (
      <div className="relative group">
        {link}
        <div className="absolute left-0 top-full z-50 min-w-56 pt-2 opacity-0 pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto">
          <div className="rounded-lg border border-border-subtle bg-surface-secondary/95 p-2 shadow-lg backdrop-blur-xl">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.href}
                href={subcategory.href}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                id={subcategoryId(href, subcategory.label)}
                role="menuitem"
              >
                {subcategory.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={href}
        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? "text-text-primary bg-surface-tertiary" : "text-text-secondary bg-transparent"
        }`}
        onClick={onClick}
      >
        <span className="mr-2">{icon}</span>
        {label}
      </Link>
      {subcategories.length > 0 && (
        <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-border-subtle pl-3">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.href}
              href={subcategory.href}
              className="rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
              onClick={onClick}
            >
              {subcategory.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
