import { fetchWeKnora, isWeKnoraConfigured, WikiGraph, wikiPath } from "../../../../lib/weknora";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!isWeKnoraConfigured()) return Response.json({ error: "Graph is not configured" }, { status: 503 });
  try {
    const graph = await fetchWeKnora<WikiGraph>(wikiPath("/graph?mode=overview&limit=500"));
    return Response.json({ ...graph, edges: graph.edges ?? [] });
  } catch (error) {
    console.error("Failed to load WeKnora wiki graph", error);
    return Response.json({ error: "Graph is temporarily unavailable" }, { status: 502 });
  }
}
