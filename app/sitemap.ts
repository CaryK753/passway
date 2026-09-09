import type { MetadataRoute } from "next";
import { articleHref, getPublicArticles } from "../lib/public-content";
import { SITE_URL } from "../lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublicArticles();
  return [
    {
      url: SITE_URL.toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...articles.map((article) => ({
      url: new URL(articleHref(article), SITE_URL).toString(),
      lastModified: article.metadata.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
