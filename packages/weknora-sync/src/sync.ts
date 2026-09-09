import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { WeKnoraClient } from "./client.js";
import type {
  ContentArticle,
  ManifestEntry,
  SyncManifest,
  SyncPlan,
} from "./types.js";

interface ApplyOptions {
  client: WeKnoraClient;
  knowledgeBaseId: string;
  sourceCommit: string;
  manifestPath: string;
  previousManifest: SyncManifest | null;
  articles: ContentArticle[];
  plan: SyncPlan;
  maxDeletes: number;
  timeoutMs?: number;
  pollMs?: number;
}

export async function applySyncPlan(options: ApplyOptions): Promise<SyncManifest> {
  const deletes = options.plan.actions.filter((action) => action.type === "delete");
  if (deletes.length > options.maxDeletes) {
    throw new Error(
      `删除计划 ${deletes.length} 条，超过安全阈值 ${options.maxDeletes}`,
    );
  }

  const articles = new Map(
    options.articles.map((article) => [article.metadata.content_id, article]),
  );
  const entries: Record<string, ManifestEntry> = {
    ...(options.previousManifest?.entries ?? {}),
  };
  const changedKnowledgeIds: string[] = [];

  for (const action of options.plan.actions) {
    if (action.type === "delete") continue;
    const article = articles.get(action.contentId);
    if (!article) throw new Error(`计划引用了不存在的文章: ${action.contentId}`);

    if (action.type === "create") {
      const knowledgeId = await options.client.createManual(
        options.knowledgeBaseId,
        article.metadata.title,
        article.markdown,
        requestId("create", action.contentId),
      );
      entries[action.contentId] = pendingEntry(article, knowledgeId);
      changedKnowledgeIds.push(knowledgeId);
      continue;
    }

    if (action.type === "update") {
      await options.client.updateManual(
        action.knowledgeId,
        article.metadata.title,
        article.markdown,
        requestId("update", action.contentId),
      );
      entries[action.contentId] = pendingEntry(article, action.knowledgeId);
      changedKnowledgeIds.push(action.knowledgeId);
      continue;
    }

    entries[action.contentId] = {
      ...entries[action.contentId]!,
      path: article.path,
    };
  }

  for (const knowledgeId of changedKnowledgeIds) {
    await options.client.waitUntilProcessed(knowledgeId, requestId("verify", knowledgeId), {
      timeoutMs: options.timeoutMs ?? 300_000,
      pollMs: options.pollMs ?? 2_000,
    });
    const contentId = Object.keys(entries).find(
      (candidate) => entries[candidate]?.knowledge_id === knowledgeId,
    );
    if (contentId && entries[contentId]) entries[contentId].parse_status = "completed";
  }

  for (const action of deletes) {
    await options.client.deleteKnowledge(
      action.knowledgeId,
      requestId("delete", action.contentId),
    );
    delete entries[action.contentId];
  }

  const manifest: SyncManifest = {
    schema_version: 1,
    knowledge_base_id: options.knowledgeBaseId,
    source_commit: options.sourceCommit,
    entries,
  };
  await writeManifestAtomically(options.manifestPath, manifest);
  return manifest;
}

function pendingEntry(article: ContentArticle, knowledgeId: string): ManifestEntry {
  return {
    path: article.path,
    sha256: article.sha256,
    knowledge_id: knowledgeId,
    parse_status: "pending",
    synced_at: new Date().toISOString(),
  };
}

function requestId(action: string, contentId: string): string {
  return `passway-${action}-${contentId}-${randomUUID()}`;
}

async function writeManifestAtomically(
  manifestPath: string,
  manifest: SyncManifest,
): Promise<void> {
  const directory = path.dirname(manifestPath);
  await mkdir(directory, { recursive: true });
  const temporary = `${manifestPath}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporary, manifestPath);
}
