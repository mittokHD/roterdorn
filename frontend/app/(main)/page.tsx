import { getRezensionen } from "@/lib/strapi";
import type { Rezension } from "@/lib/types";

// Import extracted layout sections
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import LatestReviewsSection from "@/components/home/LatestReviewsSection";

/**
 * HomePage Component
 * 
 * Fetches the latest reviews from Strapi and renders the landing page layout.
 * Errors during fetching are caught and yield an empty array to show the EmptyState gracefully.
 */
export default async function HomePage() {
  let rezensionen: Rezension[] = [];

  try {
    const response = await getRezensionen({ pageSize: 8 });
    rezensionen = response.data || [];
  } catch (error) {
    // Failsafe: if the CMS is down or the query fails, display empty state
    console.error("Failed to fetch initial reviews:", error);
    rezensionen = [];
  }

  return (
    <div className="relative">
      <HeroSection />
      <CategoriesSection />
      <LatestReviewsSection rezensionen={rezensionen} />
    </div>
  );
}
