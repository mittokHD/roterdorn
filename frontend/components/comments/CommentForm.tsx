"use client";

import { useState } from "react";
import { useCommentSubmit } from "@/hooks/useCommentSubmit";
import { useAuth } from "@/contexts/AuthContext";

interface CommentFormProps {
  rezensionId: string;
}

export default function CommentForm({ rezensionId }: CommentFormProps) {
  const { user } = useAuth();
  const { error, isLoading, isSuccess, submitComment, resetStatus } = useCommentSubmit();
  const [text, setText] = useState("");

  const handleReset = () => {
    setText("");
    resetStatus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    await submitComment({
      name: user.username,
      text: text.trim(),
      website: "",
      rezensionId,
    });

    setText("");
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-[color:var(--text-primary)]">
        Kommentar schreiben
      </h3>

      {isSuccess ? (
        <div className="rounded-xl p-5 text-center bg-[#22c55e1a] border border-[#22c55e4d] text-green-500">
          <p className="text-sm font-medium mb-1">Kommentar eingereicht!</p>
          <p className="text-xs text-[color:var(--text-muted)]">
            Dein Kommentar wird nach Freigabe angezeigt.
          </p>
          <button
            onClick={handleReset}
            className="mt-3 text-xs underline text-[color:var(--text-accent)] hover:opacity-80 transition-opacity"
          >
            Noch einen Kommentar schreiben
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-brand-500 text-white">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-text-secondary">{user?.username}</span>
          </div>

          <div>
            <textarea
              id="comment-text"
              name="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dein Kommentar..."
              required
              rows={4}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[color:var(--brand-500)] resize-y bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)] border border-[color:var(--border-default)]"
            />
          </div>

          {error && (
            <div className="rounded-lg p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 bg-[color:var(--brand-500)] text-white shadow-[0_0_15px_var(--brand-500)]"
            id="comment-submit"
          >
            {isLoading ? "Wird gesendet..." : "Kommentar abschicken"}
          </button>

          <p className="text-xs text-[color:var(--text-muted)]">
            Kommentare werden vor der Veröffentlichung geprüft.
          </p>
        </form>
      )}
    </div>
  );
}
