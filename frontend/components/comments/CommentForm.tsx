"use client";

import { useState } from "react";
import { useCommentSubmit } from "@/hooks/useCommentSubmit";

interface CommentFormProps {
  rezensionId: string;
}

export default function CommentForm({ rezensionId }: CommentFormProps) {
  // 1. Logik über Custom Hook abstrahiert
  const { error, isLoading, isSuccess, submitComment, resetStatus } = useCommentSubmit();

  // 2. Formular-State gebündelt verwalten
  const [formData, setFormData] = useState({
    name: "",
    text: "",
    website: "", // Honeypot
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({ name: "", text: "", website: "" });
    resetStatus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) return;

    await submitComment({
      ...formData,
      name: formData.name.trim(),
      text: formData.text.trim(),
      rezensionId,
    });
    
    // Formular nach Erfolg leeren
    setFormData({ name: "", text: "", website: "" });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-[color:var(--text-primary)]">
        Kommentar schreiben
      </h3>

      {isSuccess ? (
        <div className="rounded-xl p-5 text-center bg-[#22c55e1a] border border-[#22c55e4d] text-green-500">
          <p className="text-sm font-medium mb-1">✅ Kommentar eingereicht!</p>
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
          <div>
            <label
              htmlFor="comment-name"
              className="block text-sm font-medium mb-1.5 text-[color:var(--text-secondary)]"
            >
              Name
            </label>
            <input
              id="comment-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Dein Name"
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[color:var(--brand-500)] bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)] border border-[color:var(--border-default)]"
            />
          </div>

          {/* Honeypot Field */}
          <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px]">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="comment-text"
              className="block text-sm font-medium mb-1.5 text-[color:var(--text-secondary)]"
            >
              Kommentar
            </label>
            <textarea
              id="comment-text"
              name="text"
              value={formData.text}
              onChange={handleChange}
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
            disabled={isLoading || !formData.name.trim() || !formData.text.trim()}
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
