import { getLatestApprovedComments, getRezensionen } from "@/lib/strapi";
import type { LatestKommentar, Rezension } from "@/lib/types";

// Import extracted layout sections
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import LatestReviewsSection from "@/components/home/LatestReviewsSection";
import LatestCommentsSection from "@/components/home/LatestCommentsSection";

/**
 * HomePage Component
 * 
 * Fetches the latest reviews from Strapi and renders the landing page layout.
 * Errors during fetching are caught and yield an empty array to show the EmptyState gracefully.
 */
export default async function HomePage() {
  let rezensionen: Rezension[] = [];
  let latestComments: LatestKommentar[] = [];

  try {
    const [response, comments] = await Promise.all([
      getRezensionen({ pageSize: 8 }),
      getLatestApprovedComments(6),
    ]);
    rezensionen = response.data || [];
    latestComments = comments;
  } catch (error) {
    // Failsafe: if the CMS is down or the query fails, display empty state
    console.error("Failed to fetch initial reviews:", error);
    rezensionen = [];
    latestComments = [];
  }

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px]"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(214, 37, 37, 0.34) 0%, rgba(116, 16, 22, 0.24) 44%, rgba(10, 10, 15, 0) 84%), linear-gradient(180deg, rgba(72, 9, 15, 0.28) 0%, rgba(54, 7, 12, 0.18) 58%, rgba(10, 10, 15, 0) 100%)",
        }}
      />
      <div className="relative z-10">
        <HeroSection />
        <CategoriesSection />
        <LatestReviewsSection rezensionen={rezensionen} />
        <LatestCommentsSection comments={latestComments} />
      </div>
    </div>
  );
}
