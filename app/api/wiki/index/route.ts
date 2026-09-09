import { fetchWeKnora, isWeKnoraConfigured, WikiIndex, wikiPath } from "../../../../lib/weknora";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!isWeKnoraConfigured()) return Response.json({ error: "Wiki is not configured" }, { status: 503 });
  try {
    return Response.json(await fetchWeKnora<WikiIndex>(wikiPath("/index?limit=100")));
  } catch (error) {
    console.error("Failed to load WeKnora wiki index", error);
    return Response.json({ error: "Wiki is temporarily unavailable" }, { status: 502 });
  }
}
