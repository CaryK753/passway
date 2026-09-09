import { getPublicArticles } from "../../../lib/public-content";
import { renderRssFeed } from "../../../packages/weknora-sync/src/feed";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const configuredBase = process.env.PASSWAY_PUBLIC_URL;
  const baseUrl = configuredBase || new URL(request.url).origin;
  const feed = renderRssFeed(await getPublicArticles(), { baseUrl });

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
