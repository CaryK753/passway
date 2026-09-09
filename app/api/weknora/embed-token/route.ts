const apiBase = process.env.WEKNORA_API_BASE?.replace(/\/$/, "");
const channelId = process.env.WEKNORA_EMBED_CHANNEL_ID;
const publishToken = process.env.WEKNORA_EMBED_PUBLISH_TOKEN;

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  if (!apiBase || !channelId || !publishToken) {
    return Response.json({ error: "Chat is not configured" }, { status: 503 });
  }
  try {
    const publicOrigin = process.env.PASSWAY_PUBLIC_URL
      ? new URL(process.env.PASSWAY_PUBLIC_URL).origin
      : new URL(request.url).origin;
    const response = await fetch(`${apiBase}/embed/${channelId}/exchange`, {
      method: "POST",
      headers: { Authorization: `Embed ${publishToken}`, Origin: publicOrigin },
      cache: "no-store",
    });
    const body = await response.json();
    const token = body?.data?.session_token;
    if (!response.ok || !token) throw new Error(`exchange returned HTTP ${response.status}`);
    return Response.json({ token, expiresIn: body.data.expires_in }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to mint WeKnora embed token", error);
    return Response.json({ error: "Chat is temporarily unavailable" }, { status: 502 });
  }
}
