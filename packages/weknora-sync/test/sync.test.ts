import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadArticles, publishableArticles } from "../src/content.js";
import { createSyncPlan } from "../src/plan.js";
import type { ContentArticle, SyncManifest } from "../src/types.js";

function markdown(id: string, title = "测试文章"): string {
  return `---
content_id: ${id}
title: ${title}
summary: 用于同步器测试的文章。
jurisdiction: germany
category: job-search
status: published
review_status: verified
last_reviewed: 2026-09-09
review_due: 2026-12-09
updated_at: 2026-09-09
effective_from: 2024-06-01
effective_until: null
sources:
  - https://example.gov/policy
---
# ${title}

同步探针。
`;
}

async function contentDirectory(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "passway-content-"));
  for (const [relativePath, source] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, source, "utf8");
  }
  return root;
}

function manifest(entries: SyncManifest["entries"]): SyncManifest {
  return {
    schema_version: 1,
    knowledge_base_id: "kb-test",
    source_commit: "abc123",
    entries,
  };
}

function entry(article: ContentArticle, pathOverride = article.path) {
  return {
    path: pathOverride,
    sha256: article.sha256,
    knowledge_id: `knowledge-${article.metadata.content_id}`,
    parse_status: "completed",
    synced_at: "2026-09-09T00:00:00.000Z",
  };
}

describe("content validation", () => {
  it("loads a valid published article", async () => {
    const root = await contentDirectory({ "germany/card.md": markdown("de-card") });
    const articles = await loadArticles(root);
    expect(articles).toHaveLength(1);
    expect(publishableArticles(articles)).toHaveLength(1);
    expect(articles[0]?.path).toBe("germany/card.md");
  });

  it("rejects duplicate content IDs", async () => {
    const root = await contentDirectory({
      "germany/a.md": markdown("duplicate-id", "文章 A"),
      "germany/b.md": markdown("duplicate-id", "文章 B"),
    });
    await expect(loadArticles(root)).rejects.toThrow("重复 content_id");
  });

  it("rejects published articles without sources", async () => {
    const source = markdown("missing-source").replace(
      "sources:\n  - https://example.gov/policy",
      "sources: []",
    );
    const root = await contentDirectory({ "germany/card.md": source });
    await expect(loadArticles(root)).rejects.toThrow("至少需要一个来源");
  });
});

describe("sync planning", () => {
  it("plans creates without a manifest", async () => {
    const root = await contentDirectory({ "germany/card.md": markdown("de-card") });
    const articles = await loadArticles(root);
    expect(createSyncPlan(articles, null).actions).toEqual([
      expect.objectContaining({ type: "create", contentId: "de-card" }),
    ]);
  });

  it("distinguishes unchanged, move, update and delete", async () => {
    const root = await contentDirectory({
      "germany/unchanged.md": markdown("unchanged"),
      "germany/moved.md": markdown("moved"),
      "germany/updated.md": markdown("updated", "新标题"),
    });
    const articles = await loadArticles(root);
    const byId = new Map(articles.map((article) => [article.metadata.content_id, article]));
    const unchanged = byId.get("unchanged")!;
    const moved = byId.get("moved")!;
    const updated = byId.get("updated")!;
    const plan = createSyncPlan(
      articles,
      manifest({
        unchanged: entry(unchanged),
        moved: entry(moved, "germany/old-location.md"),
        updated: { ...entry(updated), sha256: "a".repeat(64) },
        deleted: {
          path: "germany/deleted.md",
          sha256: "b".repeat(64),
          knowledge_id: "knowledge-deleted",
          parse_status: "completed",
          synced_at: "2026-09-09T00:00:00.000Z",
        },
      }),
    );

    expect(plan.unchanged).toBe(1);
    expect(plan.actions.map((action) => action.type).sort()).toEqual([
      "delete",
      "move",
      "update",
    ]);
  });
});
