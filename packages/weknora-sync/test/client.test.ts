import { describe, expect, it, vi } from "vitest";
import { WeKnoraClient } from "../src/client.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("WeKnoraClient", () => {
  it("creates published manual Markdown with server-only headers", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse({ success: true, data: { id: "knowledge-1" } }),
    );
    const client = new WeKnoraClient({
      baseUrl: "https://weknora.example/api/v1/",
      apiKey: "secret-key",
      fetch,
    });

    const id = await client.createManual("kb-1", "标题", "# 正文", "request-1");

    expect(id).toBe("knowledge-1");
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe(
      "https://weknora.example/api/v1/knowledge-bases/kb-1/knowledge/manual",
    );
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
      "X-API-Key": "secret-key",
      "X-Request-ID": "request-1",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      title: "标题",
      content: "# 正文",
      status: "publish",
    });
  });

  it("accepts successful delete responses without data", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse({ success: true }),
    );
    const client = new WeKnoraClient({
      baseUrl: "https://weknora.example/api/v1",
      apiKey: "secret-key",
      fetch,
    });
    await expect(client.deleteKnowledge("knowledge-1", "request-2")).resolves.toBeUndefined();
  });

  it("surfaces WeKnora error messages", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse(
        { success: false, error: { message: "knowledge base not found" } },
        404,
      ),
    );
    const client = new WeKnoraClient({
      baseUrl: "https://weknora.example/api/v1",
      apiKey: "secret-key",
      fetch,
    });
    await expect(client.getKnowledge("missing", "request-3")).rejects.toThrow(
      "WeKnora 404: knowledge base not found",
    );
  });

  it("stops polling when parsing fails", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      jsonResponse({
        success: true,
        data: { id: "knowledge-1", parse_status: "failed", error_message: "bad markdown" },
      }),
    );
    const client = new WeKnoraClient({
      baseUrl: "https://weknora.example/api/v1",
      apiKey: "secret-key",
      fetch,
    });
    await expect(
      client.waitUntilProcessed("knowledge-1", "request-4", {
        timeoutMs: 100,
        pollMs: 1,
      }),
    ).rejects.toThrow("bad markdown");
  });
});

