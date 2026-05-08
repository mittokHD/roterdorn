import Link from "next/link";
import type { Rezension } from "@/lib/types";
import ReviewCard from "@/components/reviews/ReviewCard";
import EmptyState from "@/components/ui/EmptyState";

interface LatestReviewsSectionProps {
  /** Array of the latest reviews to display */
  rezensionen: Rezension[];
}

/**
 * LatestReviewsSection Component
 * 
 * Displays the latest published reviews in a grid layout.
 * Shows an empty state component if no reviews are available.
 * 
 * @param props - Component properties.
 */
export default function LatestReviewsSection({ rezensionen }: LatestReviewsSectionProps) {
  const hasData = rezensionen.length > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Neueste Rezensionen</h2>
        {hasData && (
          <Link
            href="/suche"
            className="text-sm font-medium transition-colors duration-200 text-text-accent"
          >
            Alle ansehen →
          </Link>
        )}
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {rezensionen.map((rezension) => (
            <ReviewCard key={rezension.id} rezension={rezension} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🌱"
          title="Noch keine Rezensionen"
          description="Es wurden noch keine Rezensionen veröffentlicht. Sobald Inhalte im CMS angelegt werden, erscheinen sie hier."
        />
      )}
    </section>
  );
}
