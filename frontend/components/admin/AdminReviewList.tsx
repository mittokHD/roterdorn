"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminReviewSummary } from "@/lib/admin-reviews";
import { TYPE_META } from "@/lib/constants";

interface AdminReviewListProps {
  rezensionen: AdminReviewSummary[];
}

export default function AdminReviewList({ rezensionen }: AdminReviewListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rezensionen;

    return rezensionen.filter((rezension) => {
      const meta = TYPE_META[rezension.type];
      const searchable = [
        rezension.title,
        rezension.slug,
        meta.label,
        meta.labelPlural,
        rezension.publishedAt ? "veröffentlicht" : "entwurf",
        rezension.autor?.name,
        ...rezension.genres.map((genre) => genre.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(needle);
    });
  }, [query, rezensionen]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-border-subtle bg-surface-secondary p-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text-secondary">
            Beiträge durchsuchen
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titel, Typ, Redakteur oder Kategorie"
            className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:ring-2 focus:ring-[color:var(--brand-500)]"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-secondary">
        <div className="grid grid-cols-[120px_minmax(0,1fr)_160px_170px_120px] border-b border-border-subtle px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted max-lg:hidden">
          <span>Typ</span>
          <span>Titel</span>
          <span>Status</span>
          <span>Bearbeitet</span>
          <span className="text-right">Aktion</span>
        </div>

        <div className="divide-y divide-border-subtle">
          {filtered.map((rezension) => {
            const meta = TYPE_META[rezension.type];
            const publicPath = `/${meta.slug}/${rezension.slug}`;

            return (
              <article
                key={rezension.documentId}
                className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[120px_minmax(0,1fr)_160px_170px_120px] lg:items-center"
              >
                <div className="font-semibold text-text-accent">
                  {meta.icon} {meta.label}
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">{rezension.title}</h2>
                  <p className="mt-1 text-xs text-text-muted">
                    {[rezension.autor?.name, rezension.genres.map((genre) => genre.name).join(", ")]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="text-text-secondary">
                  {rezension.publishedAt ? "Veröffentlicht" : "Entwurf"}
                </div>
                <time className="text-text-muted" dateTime={rezension.lastEditedAt}>
                  {new Intl.DateTimeFormat("de-DE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(rezension.lastEditedAt))}
                </time>
                <div className="flex gap-2 lg:justify-end">
                  {rezension.publishedAt && (
                    <Link href={publicPath} className="text-text-muted hover:text-text-primary">
                      Ansicht
                    </Link>
                  )}
                  <Link
                    href={`/admin/beitraege/${rezension.documentId}/bearbeiten`}
                    className="font-semibold text-text-accent hover:text-brand-400"
                  >
                    Bearbeiten
                  </Link>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-text-muted">
              Keine passenden Beiträge gefunden.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
