import type { Kommentar } from "@/lib/types";
import { formatDateShort } from "@/lib/constants";
import CommentGate from "./CommentGate";

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
      <h2 className="text-2xl font-bold mb-8 text-text-primary">
        Kommentare
        {kommentare.length > 0 && (
          <span className="ml-2 text-base font-normal text-text-muted">
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
              className="rounded-xl p-5 bg-surface-tertiary border border-border-subtle"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-brand-500 text-white"
                  >
                    {kommentar.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {kommentar.name}
                  </span>
                </div>
                <time
                  className="text-xs text-text-muted"
                  dateTime={kommentar.createdAt}
                >
                  {formatDateShort(kommentar.createdAt)}
                </time>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                {kommentar.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center mb-10 bg-surface-tertiary border border-border-subtle text-text-muted"
        >
          <p className="text-sm">
            Noch keine Kommentare. Sei der Erste!
          </p>
        </div>
      )}

      {/* Comment Form or Login Prompt */}
      <CommentGate rezensionId={rezensionId} />
    </section>
  );
}
