export const dynamic = "force-dynamic";

export function GET(): Response {
  const apiBase = process.env.WEKNORA_API_BASE?.replace(/\/api\/v1\/?$/, "");
  const channelId = process.env.WEKNORA_EMBED_CHANNEL_ID;
  if (!apiBase || !channelId) return Response.json({ enabled: false });
  return Response.json({ enabled: true, baseUrl: apiBase, channelId });
}
