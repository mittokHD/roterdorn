import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  LEGACY_EDITORIAL_ENTRIES,
  LEGACY_EDITORIAL_SECTIONS,
  type LegacyEditorialSectionSlug,
} from "@/lib/legacy-editorial.generated";
import { TYPE_META } from "@/lib/constants";
import { renderReviewHtml } from "@/lib/review-html";
import { formatDate, readingTime } from "@/lib/utils";
import { SITE_URL } from "@/lib/config";

interface LegacyEditorialDetailProps {
  section: LegacyEditorialSectionSlug;
  slug: string;
}

const entryKey = (section: LegacyEditorialSectionSlug, slug: string) => `${section}/${slug}`;

export function generateLegacyEditorialDetailMetadata(
  section: LegacyEditorialSectionSlug,
  slug: string,
): Metadata {
  const entry = LEGACY_EDITORIAL_ENTRIES[entryKey(section, slug)];
  if (!entry) return {};

  return {
    title: entry.title,
    description: entry.excerpt || `${entry.title} auf roterdorn.`,
    alternates: {
      canonical: `${SITE_URL}/${entry.section}/${entry.slug}`,
    },
    openGraph: {
      title: entry.title,
      description: entry.excerpt || `${entry.title} auf roterdorn.`,
      type: "article",
    },
  };
}

export default function LegacyEditorialDetail({ section, slug }: LegacyEditorialDetailProps) {
  const entry = LEGACY_EDITORIAL_ENTRIES[entryKey(section, slug)];
  if (!entry) notFound();

  if (entry.isReviewBacked) {
    const typeMeta = TYPE_META[entry.reviewType];
    redirect(`/${typeMeta.slug}/${entry.slug}`);
  }

  const sectionData = LEGACY_EDITORIAL_SECTIONS[entry.section];

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="transition-colors hover:text-text-accent">
          Startseite
        </Link>
        <span>›</span>
        <Link href={`/${entry.section}`} className="transition-colors hover:text-text-accent">
          {sectionData.label}
        </Link>
      </nav>

      <header className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-accent">
          {sectionData.singularLabel}
        </p>
        <h1 className="text-3xl font-black leading-tight text-text-primary sm:text-5xl">
          {entry.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-muted">
          {entry.publishedAt && <span>{formatDate(entry.publishedAt)}</span>}
          {entry.content && <span>· {readingTime(entry.content)} Min. Lesezeit</span>}
          {entry.editor && <span>· Redakteur: {entry.editor}</span>}
        </div>
      </header>

      <div
        className="prose-custom mb-12"
        dangerouslySetInnerHTML={{ __html: renderReviewHtml(entry.content || "") }}
      />

      <Link
        href={`/${entry.section}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-accent transition-colors"
      >
        ← Zurück zu {sectionData.label}
      </Link>
    </article>
  );
}
