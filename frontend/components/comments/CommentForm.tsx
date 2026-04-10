"use client";

import { useState } from "react";

interface CommentFormProps {
  rezensionId: string;
}

export default function CommentForm({ rezensionId }: CommentFormProps) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot state
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !text.trim()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          text: text.trim(),
          website: website, // Honeypot
          rezensionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Kommentar konnte nicht gesendet werden.");
      }

      setStatus("success");
      setName("");
      setText("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten."
      );
    }
  }

  return (
    <div>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Kommentar schreiben
      </h3>

      {status === "success" ? (
        <div
          className="rounded-xl p-5 text-center"
          style={{
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#22c55e",
          }}
        >
          <p className="text-sm font-medium mb-1">✅ Kommentar eingereicht!</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Dein Kommentar wird nach Freigabe angezeigt.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-3 text-xs underline"
            style={{ color: "var(--text-accent)" }}
          >
            Noch einen Kommentar schreiben
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="comment-name"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Name
            </label>
            <input
              id="comment-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:ring-2"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }}
            />
          </div>

          {/* Honeypot Field - Invisible to users, catches bots */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="comment-text"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Kommentar
            </label>
            <textarea
              id="comment-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dein Kommentar..."
              required
              rows={4}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-300 focus:ring-2 resize-y"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }}
            />
          </div>

          {status === "error" && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !name.trim() || !text.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: "var(--brand-500)",
              color: "white",
              boxShadow: "var(--shadow-brand)",
            }}
            id="comment-submit"
          >
            {status === "loading" ? "Wird gesendet..." : "Kommentar abschicken"}
          </button>

          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Kommentare werden vor der Veröffentlichung geprüft.
          </p>
        </form>
      )}
    </div>
  );
}
