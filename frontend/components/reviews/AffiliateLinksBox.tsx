import type { AdminAffiliateLink } from "@/lib/types";
import type { LegacyAffiliateLink } from "@/lib/legacy-editorial.generated";

interface AffiliateLinksBoxProps {
  links: Array<LegacyAffiliateLink | AdminAffiliateLink>;
}

export default function AffiliateLinksBox({ links }: AffiliateLinksBoxProps) {
  if (links.length === 0) return null;

  return (
    <aside className="mb-10 rounded-xl border border-brand-500/30 bg-brand-500/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Bezugslink
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            Dieser Beitrag enthält einen Affiliate-Link aus der Legacy-Datenbank.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={`${link.provider || "affiliate"}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
