import { describe, expect, it } from "vitest";
import { renderRssFeed } from "../src/feed.js";
import type { ContentArticle } from "../src/types.js";

function article(overrides: Partial<ContentArticle> = {}): ContentArticle {
  return {
    path: "germany/opportunity-card.md",
    markdown: "# 正文\n\n完整内容。\n",
    sha256: "a".repeat(64),
    metadata: {
      content_id: "de-opportunity-card",
      title: "德国机会卡",
      summary: "文章摘要",
      jurisdiction: "germany",
      category: "job-search",
      status: "published",
      review_status: "verified",
      last_reviewed: "2026-09-09",
      review_due: "2026-12-09",
      updated_at: "2026-09-09",
      effective_from: "2024-06-01",
      effective_until: null,
      sources: ["https://example.gov/policy"],
    },
    ...overrides,
  };
}

describe("RSS rendering", () => {
  it("uses stable content ID, canonical link and full Markdown", () => {
    const feed = renderRssFeed([article()], { baseUrl: "https://passway.example/" });
    expect(feed).toContain(
      '<guid isPermaLink="false">de-opportunity-card</guid>',
    );
    expect(feed).toContain(
      "<link>https://passway.example/articles/germany/opportunity-card</link>",
    );
    expect(feed).toContain("<![CDATA[# 正文\n\n完整内容。\n]]>");
    expect(feed).toContain("<pubDate>Wed, 09 Sep 2026 00:00:00 GMT</pubDate>");
  });

  it("is deterministic regardless of input order", () => {
    const germany = article();
    const canada = article({
      path: "canada/express-entry.md",
      metadata: {
        ...germany.metadata,
        content_id: "ca-express-entry",
        title: "加拿大快速通道",
      },
    });
    const options = { baseUrl: "https://passway.example" };
    expect(renderRssFeed([germany, canada], options)).toBe(
      renderRssFeed([canada, germany], options),
    );
  });

  it("escapes XML metadata and safely splits CDATA terminators", () => {
    const sample = article({
      markdown: "# 正文\n\n包含 ]]> 标记。\n",
      metadata: {
        ...article().metadata,
        title: "A & B <测试>",
      },
    });
    const feed = renderRssFeed([sample], { baseUrl: "https://passway.example" });
    expect(feed).toContain("<title>A &amp; B &lt;测试&gt;</title>");
    expect(feed).toContain("]]]]><![CDATA[>");
  });

  it("rejects non-http public URLs", () => {
    expect(() =>
      renderRssFeed([article()], { baseUrl: "file:///tmp/passway" }),
    ).toThrow("必须使用 http 或 https");
  });
});
