"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DETAIL_FIELDS, type AdminDetailField } from "@/lib/admin-review-fields";
import type { RezensionType } from "@/lib/types";

type DetailValue = string | number | null | undefined;

export interface ReviewEditorInitial {
  documentId?: string;
  title: string;
  slug: string;
  type: RezensionType;
  content: string;
  rating?: number | null;
  publishedAt?: string | null;
  coverUrl?: string | null;
  autorName?: string;
  genreNames: string[];
  detailId?: number | null;
  details: Record<string, DetailValue>;
  affiliateLinksText?: string;
}

interface ReviewEditorFormProps {
  initial: ReviewEditorInitial;
}

type SaveResponse = {
  success?: boolean;
  error?: string;
  documentId?: string;
  editUrl?: string;
  publicUrl?: string;
  crosspostItem?: {
    title: string;
    url: string;
    excerpt: string;
    imageUrl?: string;
    typeLabel: string;
  };
};

const TYPES: RezensionType[] = ["Buch", "Film", "Musik", "Spiel", "Event"];

export default function ReviewEditorForm({ initial }: ReviewEditorFormProps) {
  const [documentId, setDocumentId] = useState(initial.documentId || "");
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [type, setType] = useState<RezensionType>(initial.type);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const detailFields = useMemo(() => DETAIL_FIELDS[type], [type]);
  const endpoint = documentId
    ? `/api/admin/rezensionen/${encodeURIComponent(documentId)}`
    : "/api/admin/rezensionen";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);
    setPublicUrl(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("type", type);

    const shouldPublish = formData.get("publish") === "true";
    const platforms = [
      formData.get("crosspostFacebook") === "on" ? "facebook" : null,
      formData.get("crosspostInstagram") === "on" ? "instagram" : null,
    ].filter(Boolean) as Array<"facebook" | "instagram">;

    try {
      const response = await fetch(endpoint, {
        method: documentId ? "PUT" : "POST",
        body: formData,
      });
      const data = (await response.json()) as SaveResponse;

      if (!response.ok || !data.documentId) {
        setStatus(data.error || "Beitrag konnte nicht gespeichert werden.");
        return;
      }

      if (!documentId && data.editUrl) {
        setDocumentId(data.documentId);
        window.history.replaceState(null, "", data.editUrl);
      }

      const messages = ["Beitrag wurde gespeichert."];
      if (data.publicUrl) {
        setPublicUrl(data.publicUrl);
      }

      if (platforms.length > 0 && !shouldPublish) {
        messages.push("Crosspost wurde übersprungen, weil der Beitrag als Entwurf gespeichert wurde.");
      }

      if (platforms.length > 0 && shouldPublish && data.crosspostItem) {
        for (const platform of platforms) {
          const crosspostResponse = await fetch("/api/admin/crosspost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform,
              ...data.crosspostItem,
              message: formData.get("crosspostMessage") || undefined,
            }),
          });
          const crosspostData = await crosspostResponse.json().catch(() => ({}));

          if (crosspostResponse.ok) {
            messages.push(crosspostData.message || `${platform} wurde gepostet.`);
          } else {
            const fallback = crosspostData.manualUrl ? ` Manuell: ${crosspostData.manualUrl}` : "";
            messages.push(`${platform}: ${crosspostData.error || "Crosspost fehlgeschlagen."}${fallback}`);
          }
        }
      }

      setStatus(messages.join(" "));
    } catch {
      setStatus("Beitrag konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border-subtle bg-surface-secondary p-5">
          <h2 className="text-lg font-bold text-text-primary">Inhalt</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">Titel</span>
              <input
                name="title"
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setTitle(nextTitle);
                  if (!slugTouched) setSlug(slugify(nextTitle));
                }}
                required
                className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">Slug</span>
              <input
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                required
                className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">Typ</span>
              <select
                name="type"
                value={type}
                onChange={(event) => setType(event.target.value as RezensionType)}
                className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
              >
                {TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">Redakteur</span>
              <input
                name="autor"
                defaultValue={initial.autorName}
                className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">Genres / Kategorien</span>
              <input
                name="genres"
                defaultValue={initial.genreNames.join(", ")}
                placeholder="z. B. Spielfilm, Serie"
                className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">Rezensionstext / HTML</span>
              <textarea
                name="content"
                defaultValue={initial.content}
                required
                rows={18}
                className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-3 font-mono text-sm leading-6 text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border-subtle bg-surface-secondary p-5">
          <h2 className="text-lg font-bold text-text-primary">Details</h2>
          <input type="hidden" name="detailId" value={type === initial.type ? initial.detailId || "" : ""} />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {detailFields.map((field) => (
              <DetailInput key={`${type}-${field.name}`} field={field} value={initial.details[field.name]} />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border-subtle bg-surface-secondary p-5">
          <h2 className="text-lg font-bold text-text-primary">Affiliate-Links</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Ein Link pro Zeile. Format: Label | URL
          </p>
          <textarea
            name="affiliateLinks"
            defaultValue={initial.affiliateLinksText || ""}
            rows={5}
            placeholder="Bei Amazon ansehen | https://..."
            className="mt-4 w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-3 text-sm leading-6 text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
          />
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-xl border border-border-subtle bg-surface-secondary p-5">
          <h2 className="text-lg font-bold text-text-primary">Ver&ouml;ffentlichung</h2>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">Status</span>
            <select
              name="publish"
              defaultValue={initial.publishedAt ? "true" : "false"}
              className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
            >
              <option value="false">Als Entwurf speichern</option>
              <option value="true">Ver&ouml;ffentlichen / aktualisieren</option>
            </select>
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">Bewertung</span>
            <input
              name="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              defaultValue={initial.rating ?? ""}
              className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
            />
          </label>

          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">Cover</span>
            {initial.coverUrl && (
              <div className="mb-3 overflow-hidden rounded-lg border border-border-subtle bg-surface-tertiary">
                <Image
                  src={initial.coverUrl}
                  alt=""
                  width={360}
                  height={220}
                  className="h-40 w-full object-cover"
                />
              </div>
            )}
            <input
              name="cover"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-surface-tertiary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text-primary"
            />
          </div>
        </section>

        <section className="rounded-xl border border-border-subtle bg-surface-secondary p-5">
          <h2 className="text-lg font-bold text-text-primary">Crosspost</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Wird nach dem Speichern ausgef&uuml;hrt. Entw&uuml;rfe werden nicht gepostet.
          </p>

          <label className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <input name="crosspostFacebook" type="checkbox" className="h-4 w-4 accent-[color:var(--brand-500)]" />
            Facebook
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
            <input name="crosspostInstagram" type="checkbox" className="h-4 w-4 accent-[color:var(--brand-500)]" />
            Instagram
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">Optionaler Post-Text</span>
            <textarea
              name="crosspostMessage"
              rows={5}
              className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">Optionales Crosspost-Bild</span>
            <input
              name="crosspostImage"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-surface-tertiary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text-primary"
            />
          </label>
        </section>

        <div className="sticky top-24 space-y-3">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
          >
            {isSaving ? "Speichert..." : "Beitrag speichern"}
          </button>

          {publicUrl && (
            <Link
              href={publicUrl}
              className="block rounded-xl border border-border-subtle bg-surface-secondary px-5 py-3 text-center text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
            >
              Beitrag ansehen
            </Link>
          )}

          {status && (
            <div className="rounded-xl border border-border-subtle bg-surface-secondary p-4 text-sm leading-6 text-text-secondary">
              {status}
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}

function DetailInput({ field, value }: { field: AdminDetailField; value: DetailValue }) {
  if (field.input === "select") {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-text-secondary">{field.label}</span>
        <select
          name={field.name}
          defaultValue={String(value ?? "")}
          className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
        >
          {(field.options || []).map((option) => (
            <option key={option || "empty"} value={option}>
              {option || "Keine Angabe"}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-secondary">{field.label}</span>
      {field.input === "textarea" ? (
        <textarea
          name={field.name}
          rows={5}
          defaultValue={String(value ?? "")}
          className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm leading-6 text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
        />
      ) : (
        <input
          name={field.name}
          type={field.input || "text"}
          defaultValue={String(value ?? "")}
          className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[color:var(--brand-500)]"
        />
      )}
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
