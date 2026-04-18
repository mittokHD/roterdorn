"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import CommentForm from "./CommentForm";

interface CommentGateProps {
  rezensionId: string;
}

export default function CommentGate({ rezensionId }: CommentGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="rounded-xl p-6 text-center bg-surface-tertiary border border-border-subtle">
        <p className="text-sm text-text-secondary mb-4">
          Um einen Kommentar zu schreiben, musst du angemeldet sein.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 bg-[color:var(--brand-500)] text-white shadow-[0_0_15px_var(--brand-500)]"
          >
            Anmelden
          </Link>
          <Link
            href="/registrieren"
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary"
          >
            Registrieren
          </Link>
        </div>
      </div>
    );
  }

  return <CommentForm rezensionId={rezensionId} />;
}
