import { getSimilarRezensionen } from "@/lib/strapi";
import type { RezensionType } from "@/lib/types";
import ReviewCard from "@/components/reviews/ReviewCard";

interface SimilarReviewsProps {
  type: RezensionType;
  currentSlug: string;
}

export default async function SimilarReviews({ type, currentSlug }: SimilarReviewsProps) {
  let items;
  try {
    const res = await getSimilarRezensionen(type, currentSlug, 4);
    items = res.data || [];
  } catch {
    return null;
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold mb-6 text-text-primary">Ähnliche Rezensionen</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        {items.map((rezension) => (
          <ReviewCard key={rezension.id} rezension={rezension} />
        ))}
      </div>
    </section>
  );
}
