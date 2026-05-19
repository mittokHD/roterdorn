"use client";

import { useMemo, useState } from "react";

export interface CrosspostItem {
  title: string;
  url: string;
  excerpt: string;
  imageUrl?: string;
  typeLabel: string;
}

interface CrosspostPanelProps {
  items: CrosspostItem[];
}

type Platform = "facebook" | "instagram";

export default function CrosspostPanel({ items }: CrosspostPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState<Platform | null>(null);
  const selectedItem = items[selectedIndex];

  const preparedMessage = useMemo(() => {
    if (!selectedItem) return "";
    return message.trim() || `${selectedItem.title}\n\n${selectedItem.excerpt}\n\n${selectedItem.url}`;
  }, [message, selectedItem]);

  async function post(platform: Platform) {
    if (!selectedItem) return;

    setStatus(null);
    setIsPosting(platform);

    try {
      const response = await fetch("/api/admin/crosspost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          title: selectedItem.title,
          url: selectedItem.url,
          excerpt: selectedItem.excerpt,
          imageUrl: selectedItem.imageUrl,
          message: preparedMessage,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data.manualUrl ? `${data.error} Manuell: ${data.manualUrl}` : data.error);
        return;
      }

      setStatus(data.message || "Crosspost wurde erstellt.");
    } catch {
      setStatus("Crosspost konnte nicht gesendet werden.");
    } finally {
      setIsPosting(null);
    }
  }

  async function copyText() {
    if (!preparedMessage) return;
    await navigator.clipboard.writeText(preparedMessage);
    setStatus("Text wurde in die Zwischenablage kopiert.");
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-secondary p-6 text-sm text-text-muted">
        Keine Inhalte zum Crossposten vorhanden.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="rounded-xl border border-border-subtle bg-surface-secondary p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Inhalte
        </h2>
        <div className="space-y-2">
          {items.map((item, index) => (
            <button
              key={item.url}
              type="button"
              onClick={() => {
                setSelectedIndex(index);
                setMessage("");
                setStatus(null);
              }}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                index === selectedIndex
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-border-subtle bg-surface-tertiary hover:border-border-hover"
              }`}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide text-text-accent">
                {item.typeLabel}
              </span>
              <span className="mt-1 block text-sm font-semibold text-text-primary">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-secondary p-5">
        <h2 className="text-lg font-bold text-text-primary">Crosspost vorbereiten</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Facebook nutzt die Seiten-Verbindung, Instagram benötigt zusätzlich ein öffentlich erreichbares Bild.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Beitragstext
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={preparedMessage}
              rows={8}
              className="w-full rounded-xl border border-border-default bg-[color:var(--bg-tertiary)] px-4 py-3 text-sm text-text-primary outline-none transition-all focus:ring-2 focus:ring-[color:var(--brand-500)]"
            />
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-tertiary p-4 text-sm text-text-muted">
            <p className="font-medium text-text-secondary">{selectedItem?.title}</p>
            <p className="mt-2 break-all">{selectedItem?.url}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => post("facebook")}
              disabled={isPosting !== null}
              className="rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPosting === "facebook" ? "Sendet..." : "Facebook posten"}
            </button>
            <button
              type="button"
              onClick={() => post("instagram")}
              disabled={isPosting !== null}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPosting === "instagram" ? "Sendet..." : "Instagram posten"}
            </button>
            <button
              type="button"
              onClick={copyText}
              className="rounded-lg border border-border-subtle bg-surface-tertiary px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              Text kopieren
            </button>
          </div>

          {status && (
            <div className="rounded-lg border border-border-subtle bg-surface-tertiary p-3 text-sm text-text-secondary">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
