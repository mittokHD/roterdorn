import type { Kommentar } from "@/lib/types";
import { formatDateShort } from "@/lib/constants";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  rezensionId: string;
  kommentare: Kommentar[];
}

export default function CommentSection({
  rezensionId,
  kommentare,
}: CommentSectionProps) {
  return (
    <section id="kommentare">
      <h2
        className="text-2xl font-bold mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        Kommentare
        {kommentare.length > 0 && (
          <span
            className="ml-2 text-base font-normal"
            style={{ color: "var(--text-muted)" }}
          >
            ({kommentare.length})
          </span>
        )}
      </h2>

      {/* Comment List */}
      {kommentare.length > 0 ? (
        <div className="space-y-4 mb-10">
          {kommentare.map((kommentar) => (
            <div
              key={kommentar.id}
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: "var(--brand-500)",
                      color: "white",
                    }}
                  >
                    {kommentar.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {kommentar.name}
                  </span>
                </div>
                <time
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                  dateTime={kommentar.createdAt}
                >
                  {formatDateShort(kommentar.createdAt)}
                </time>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {kommentar.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center mb-10"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          <p className="text-sm">
            Noch keine Kommentare. Sei der Erste!
          </p>
        </div>
      )}

      {/* Comment Form */}
      <CommentForm rezensionId={rezensionId} />
    </section>
  );
}
