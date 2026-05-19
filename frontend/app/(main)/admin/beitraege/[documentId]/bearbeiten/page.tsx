import type { Metadata } from "next";
import AdminAccessState from "@/components/admin/AdminAccessState";
import ReviewEditorForm, { type ReviewEditorInitial } from "@/components/admin/ReviewEditorForm";
import { DETAIL_FIELDS } from "@/lib/admin-review-fields";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";
import { getAdminRezension } from "@/lib/admin-reviews";
import { getStrapiMediaUrl } from "@/lib/strapi";
import type { AdminAffiliateLink, AdminExtraDetailRow, DetailComponent, RezensionType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Beitrag bearbeiten",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ documentId: string }>;
}

export default async function EditReviewPage({ params }: PageProps) {
  const user = await getCurrentUserForAdmin();

  if (!user) {
    return (
      <AdminAccessState
        title="Anmeldung erforderlich"
        description="Melde dich an, um diesen Beitrag zu bearbeiten."
        href="/login"
        linkLabel="Anmelden"
      />
    );
  }

  if (!user.isAdmin) {
    return (
      <AdminAccessState
        title="Kein Zugriff"
        description="Dein Konto ist nicht für die Beitragsverwaltung freigeschaltet."
        href="/"
        linkLabel="Zur Startseite"
      />
    );
  }

  const { documentId } = await params;
  const rezension = await getAdminRezension(documentId);

  if (!rezension) {
    return (
      <AdminAccessState
        title="Beitrag nicht gefunden"
        description="Der Beitrag konnte nicht geladen werden."
        href="/admin/beitraege"
        linkLabel="Zurück zur Verwaltung"
      />
    );
  }

  const detail = rezension.details?.[0] || null;
  const initial: ReviewEditorInitial = {
    documentId: rezension.documentId,
    title: rezension.title,
    slug: rezension.slug,
    type: rezension.type,
    content: rezension.content || "",
    rating: rezension.rating,
    publishedAt: rezension.publishedAt,
    coverUrl: rezension.cover?.url ? getStrapiMediaUrl(rezension.cover.url) : null,
    autorName: rezension.autor?.name || "",
    genreNames: rezension.genres?.map((genre) => genre.name) || [],
    detailId: detail?.id || null,
    details: {
      ...toDetailRecord(detail),
      ...extraRowsToDetailRecord(rezension.type, rezension.extraDetails || []),
    },
    affiliateLinksText: affiliateLinksToText(rezension.affiliateLinks || []),
  };

  return (
    <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-accent">
          Administration
        </p>
        <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
          Beitrag bearbeiten
        </h1>
        <p className="mt-3 text-sm text-text-muted">{rezension.title}</p>
      </header>

      <ReviewEditorForm initial={initial} />
    </main>
  );
}

function extraRowsToDetailRecord(type: RezensionType, rows: AdminExtraDetailRow[]) {
  const fieldsByLabel = new Map(DETAIL_FIELDS[type].map((field) => [field.label.toLowerCase(), field]));
  const record: Record<string, string> = {};

  for (const row of rows) {
    const field = fieldsByLabel.get(row.label.toLowerCase());
    if (!field) continue;
    record[field.name] = row.values.map((value) => value.label).join(field.input === "textarea" ? "\n" : ", ");
  }

  return record;
}

function affiliateLinksToText(links: AdminAffiliateLink[]) {
  return links
    .map((link) => `${link.label || "Affiliate-Link"} | ${link.url}`)
    .join("\n");
}

function toDetailRecord(detail: DetailComponent | null) {
  if (!detail) return {};

  const record: Record<string, string | number | null> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (key === "__component" || key === "id") continue;
    if (typeof value === "string" || typeof value === "number" || value === null) {
      record[key] = value;
    }
  }

  return record;
}
