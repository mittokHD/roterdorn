import { MetadataRoute } from "next";
import { getRezensionen } from "@/lib/strapi";
import { TYPE_REVERSE_MAP } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL from environment or fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roterdorn.de";

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
    url: `${baseUrl}${route}`,
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
      const typeSlug = TYPE_REVERSE_MAP[rezension.type] || "buch";
      return {
        url: `${baseUrl}/${typeSlug}/${rezension.slug}`,
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
