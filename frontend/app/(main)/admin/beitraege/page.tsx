import Link from "next/link";
import type { Metadata } from "next";
import AdminAccessState from "@/components/admin/AdminAccessState";
import AdminReviewList from "@/components/admin/AdminReviewList";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";
import { getAdminRezensionen } from "@/lib/admin-reviews";

export const metadata: Metadata = {
  title: "Beiträge verwalten",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminReviewsPage() {
  const user = await getCurrentUserForAdmin();

  if (!user) {
    return (
      <AdminAccessState
        title="Anmeldung erforderlich"
        description="Melde dich an, um Beiträge zu erstellen und zu bearbeiten."
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

  const rezensionen = await getAdminRezensionen();

  return (
    <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-accent">
            Administration
          </p>
          <h1 className="text-3xl font-black text-text-primary sm:text-4xl">
            Beiträge verwalten
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
            Erstelle neue Rezensionen, bearbeite bestehende Inhalte und poste veröffentlichte Beiträge direkt weiter.
          </p>
        </div>

        <Link
          href="/admin/beitraege/neu"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Neuer Beitrag
        </Link>
      </header>

      <AdminReviewList rezensionen={rezensionen} />
    </main>
  );
}
