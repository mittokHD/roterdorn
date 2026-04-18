import { MetadataRoute } from "next";
import { getRezensionen } from "@/lib/strapi";
import { TYPE_META } from "@/lib/constants";
import { SITE_URL } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    "",
    "/suche",
    "/buch",
    "/film",
    "/musik",
    "/spiel",
    "/event",
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
        lastModified: new Date(rezension.updatedAt || rezension.publishedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error("Failed to fetch rezensionen for sitemap:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
