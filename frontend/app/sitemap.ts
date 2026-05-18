import { MetadataRoute } from "next";
import { getRezensionen } from "@/lib/strapi";
import { CATEGORY_TYPES, EDITORIAL_NAV_ITEMS, TYPE_META } from "@/lib/constants";
import { SITE_URL } from "@/lib/config";
import { LEGACY_TAXONOMY_INDEX } from "@/lib/legacy-review-details.generated";
import { LEGACY_EDITORIAL_SECTIONS } from "@/lib/legacy-editorial.generated";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Derive the public category pages from the central visible category list.
  const categoryRoutes = CATEGORY_TYPES.map((t) => `/${TYPE_META[t].slug}`);
  const editorialRoutes = EDITORIAL_NAV_ITEMS.map((item) => item.href);
  const editorialDetailRoutes = Object.values(LEGACY_EDITORIAL_SECTIONS)
    .flatMap((section) => section.entries)
    .filter((entry) => !entry.isReviewBacked)
    .map((entry) => `/${entry.section}/${entry.slug}`);
  const taxonomyRoutes = Object.values(LEGACY_TAXONOMY_INDEX).map((entry) => entry.href);

  const staticRoutes = [
    "",
    "/suche",
    "/ueber-uns",
    "/impressum",
    "/datenschutz",
    ...categoryRoutes,
    ...editorialRoutes,
    ...editorialDetailRoutes,
    ...taxonomyRoutes,
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic routes (Rezensionen)
  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const rezensionenResponse = await getRezensionen();
    const rezensionen = rezensionenResponse.data || [];

    dynamicRoutes = rezensionen.map((rezension) => {
      // Maps e.g. "Buch" to "buch"
      const typeSlug = TYPE_META[rezension.type]?.slug || "buch";
      return {
        url: `${SITE_URL}/${typeSlug}/${rezension.slug}`,
        lastModified: new Date(rezension.updatedAt || rezension.publishedAt || rezension.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error("Failed to fetch rezensionen for sitemap:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
