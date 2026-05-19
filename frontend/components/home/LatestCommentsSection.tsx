import Link from "next/link";
import type { LatestKommentar } from "@/lib/types";
import { TYPE_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface LatestCommentsSectionProps {
  comments: LatestKommentar[];
}

export default function LatestCommentsSection({ comments }: LatestCommentsSectionProps) {
  return (
    <section className="w-full px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Neueste Kommentare</h2>
      </div>

      {comments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {comments.map((comment) => (
            <CommentCard key={comment.documentId || comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface-secondary p-6 text-sm text-text-muted">
          Noch keine freigeschalteten Kommentare vorhanden.
        </div>
      )}
    </section>
  );
}

function CommentCard({ comment }: { comment: LatestKommentar }) {
  const review = comment.rezension;
  const reviewMeta = review ? TYPE_META[review.type] : null;
  const href = review && reviewMeta ? `/${reviewMeta.slug}/${review.slug}#kommentare` : null;

  const content = (
    <article className="h-full rounded-lg border border-border-subtle bg-surface-secondary p-5 transition-colors hover:border-border-hover hover:bg-surface-tertiary">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span className="font-semibold text-text-secondary">{comment.name}</span>
        {comment.createdAt && <span>· {formatDate(comment.createdAt)}</span>}
      </div>
      <p className="line-clamp-4 text-sm leading-6 text-text-secondary">
        {comment.text}
      </p>
      {review && (
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-text-accent">
          Zu: {review.title}
        </p>
      )}
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}
