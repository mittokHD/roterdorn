"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { TYPE_META } from "@/lib/constants";
import type { RezensionType } from "@/lib/types";

interface UserKommentar {
  id: number;
  documentId: string;
  text: string;
  isApproved: boolean;
  createdAt: string;
  rezension?: {
    title: string;
    slug: string;
    type: RezensionType;
  };
}

export default function ProfilPage() {
  const { user, isLoading } = useAuth();
  const [kommentare, setKommentare] = useState<UserKommentar[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingComments(true);
    fetch("/api/profil/kommentare")
      .then((r) => r.json())
      .then((data) => setKommentare(data.kommentare || []))
      .catch(() => setKommentare([]))
      .finally(() => setLoadingComments(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-shimmer h-8 w-48 rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold mb-2 text-text-primary">Nicht angemeldet</h1>
          <p className="text-text-secondary mb-6 text-sm">
            Melde dich an, um dein Profil zu sehen.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 text-white"
          >
            Anmelden
          </Link>
        </div>
      </div>
    );
  }

  const approved = kommentare.filter((k) => k.isApproved);
  const pending = kommentare.filter((k) => !k.isApproved);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      {/* Profile Card */}
      <div className="glass-card p-8 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center text-2xl font-black text-brand-400">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-primary">{user.username}</h1>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl p-4 bg-surface-tertiary border border-border-subtle text-center">
            <p className="text-2xl font-black text-text-primary">{kommentare.length}</p>
            <p className="text-xs text-text-muted mt-1">Kommentare gesamt</p>
          </div>
          <div className="rounded-xl p-4 bg-surface-tertiary border border-border-subtle text-center">
            <p className="text-2xl font-black text-text-primary">{approved.length}</p>
            <p className="text-xs text-text-muted mt-1">Veröffentlicht</p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <h2 className="text-lg font-bold mb-4 text-text-primary">Deine Kommentare</h2>

      {loadingComments ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-20 rounded-xl" />
          ))}
        </div>
      ) : kommentare.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p className="text-3xl mb-3">💬</p>
          <p className="text-sm">Du hast noch keine Kommentare geschrieben.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <p className="text-xs text-text-muted px-1">
              {pending.length} Kommentar{pending.length !== 1 ? "e" : ""} warten auf Freischaltung.
            </p>
          )}
          {kommentare.map((k) => {
            const rezMeta = k.rezension?.type ? TYPE_META[k.rezension.type] : null;
            const href =
              rezMeta && k.rezension
                ? `/${rezMeta.slug}/${k.rezension.slug}`
                : null;

            return (
              <div
                key={k.id}
                className={`rounded-xl p-4 border transition-all ${
                  k.isApproved
                    ? "bg-surface-tertiary border-border-subtle"
                    : "bg-surface-secondary border-border-subtle opacity-70"
                }`}
              >
                {k.rezension && (
                  <div className="flex items-center gap-2 mb-2">
                    {rezMeta && (
                      <span className="text-xs">{rezMeta.icon}</span>
                    )}
                    {href ? (
                      <Link href={href} className="text-xs font-medium text-text-accent hover:underline">
                        {k.rezension.title}
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-text-secondary">
                        {k.rezension.title}
                      </span>
                    )}
                    {!k.isApproved && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Ausstehend
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-text-secondary leading-relaxed">{k.text}</p>
                <p className="text-xs text-text-muted mt-2">
                  {new Date(k.createdAt).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
