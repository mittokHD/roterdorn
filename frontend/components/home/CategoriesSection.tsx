import Link from "next/link";
import { ALL_TYPES, TYPE_META } from "@/lib/constants";

/**
 * CategoriesSection Component
 * 
 * Displays a grid of available review categories allowing users to navigate directly to them.
 * Loops through predefined constants to dynamically render the grid.
 */
export default function CategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ALL_TYPES.map((t) => {
          const meta = TYPE_META[t];
          return (
            <Link
              key={t}
              href={`/${meta.slug}`}
              className="glass-card p-4 text-center group"
              id={`category-${meta.slug}`}
            >
              <div className="text-3xl mb-2">{meta.icon}</div>
              <h3 className="text-sm font-semibold mb-1 transition-colors duration-200 group-hover:text-[var(--text-accent)] text-text-primary">
                {meta.labelPlural}
              </h3>
              <p className="text-xs text-text-muted">{meta.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
