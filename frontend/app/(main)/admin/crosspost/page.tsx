import Link from "next/link";
import type { Metadata } from "next";
import CrosspostPanel, { type CrosspostItem } from "@/components/admin/CrosspostPanel";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";
import { SITE_URL } from "@/lib/config";
import { getRezensionen, getStrapiMediaUrl } from "@/lib/strapi";
import { TYPE_META } from "@/lib/constants";
import { LEGACY_EDITORIAL_SECTIONS } from "@/lib/legacy-editorial.generated";

export const metadata: Metadata = {
  title: "Crosspost",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CrosspostPage() {
  const user = await getCurrentUserForAdmin();

  if (!user) {
    return (
      <AccessState
        title="Anmeldung erforderlich"
        description="Melde dich an, um Inhalte auf Facebook oder Instagram vorzubereiten."
        href="/login"
        linkLabel="Anmelden"
      />
    );
  }

  if (!user.isAdmin) {
    return (
      <AccessState
        title="Kein Zugriff"
        description="Dein Konto ist nicht für Crossposting freigeschaltet."
        href="/"
        linkLabel="Zur Startseite"
      />
    );
  }

  const items = await getCrosspostItems();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-accent">
          Administration
        </p>
        <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
          Crossposten
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
          Neue Inhalte können hier für die Facebook-Seite und das Instagram-Profil von roterdorn vorbereitet werden.
        </p>
      </header>

      <CrosspostPanel items={items} />
    </main>
  );
}

async function getCrosspostItems(): Promise<CrosspostItem[]> {
  const reviewItems: CrosspostItem[] = [];

  try {
    const response = await getRezensionen({ pageSize: 12 });
    for (const rezension of response.data || []) {
      const meta = TYPE_META[rezension.type];
      const coverUrl = rezension.cover ? getStrapiMediaUrl(rezension.cover.url) : undefined;

      reviewItems.push({
        title: rezension.title,
        url: `${SITE_URL}/${meta.slug}/${rezension.slug}`,
        excerpt: createExcerpt(rezension.content),
        imageUrl: coverUrl ? toAbsoluteUrl(coverUrl) : undefined,
        typeLabel: meta.label,
      });
    }
  } catch {
    // The panel can still show legacy editorial entries below.
  }

  const editorialItems = Object.values(LEGACY_EDITORIAL_SECTIONS)
    .flatMap((section) => section.entries)
    .map((entry) => {
      const typeMeta = TYPE_META[entry.reviewType];
      const path = entry.isReviewBacked
        ? `/${typeMeta.slug}/${entry.slug}`
        : `/${entry.section}/${entry.slug}`;

      return {
        title: entry.title,
        url: `${SITE_URL}${path}`,
        excerpt: entry.excerpt,
        typeLabel: entry.sectionLabel,
      };
    });

  return dedupeItems([...reviewItems, ...editorialItems]);
}

function AccessState({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-text-muted">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
      >
        {linkLabel}
      </Link>
    </main>
  );
}

function createExcerpt(html?: string | null) {
  if (!html) return "";

  return html
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function toAbsoluteUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url}`;
}

function dedupeItems(items: CrosspostItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
