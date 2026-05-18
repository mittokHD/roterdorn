import type { Metadata } from "next";
import AdminAccessState from "@/components/admin/AdminAccessState";
import ReviewEditorForm, { type ReviewEditorInitial } from "@/components/admin/ReviewEditorForm";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Neuer Beitrag",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewReviewPage() {
  const user = await getCurrentUserForAdmin();

  if (!user) {
    return (
      <AdminAccessState
        title="Anmeldung erforderlich"
        description="Melde dich an, um einen neuen Beitrag zu erstellen."
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

  const initial: ReviewEditorInitial = {
    title: "",
    slug: "",
    type: "Buch",
    content: "",
    rating: null,
    publishedAt: null,
    coverUrl: null,
    autorName: user.username,
    genreNames: [],
    detailId: null,
    details: {},
    affiliateLinksText: "",
  };

  return (
    <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-accent">
          Administration
        </p>
        <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
          Neuer Beitrag
        </h1>
      </header>

      <ReviewEditorForm initial={initial} />
    </main>
  );
}
