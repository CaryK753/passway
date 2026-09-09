import type { ContentArticle, SyncManifest, SyncPlan } from "./types.js";

export function createSyncPlan(
  articles: ContentArticle[],
  manifest: SyncManifest | null,
): SyncPlan {
  const current = new Map(articles.map((article) => [article.metadata.content_id, article]));
  const previous = manifest?.entries ?? {};
  const actions: SyncPlan["actions"] = [];
  let unchanged = 0;

  for (const [contentId, article] of current) {
    const entry = previous[contentId];
    if (!entry) {
      actions.push({ type: "create", contentId, path: article.path, sha256: article.sha256 });
      continue;
    }
    if (entry.sha256 !== article.sha256) {
      actions.push({
        type: "update",
        contentId,
        path: article.path,
        previousPath: entry.path,
        sha256: article.sha256,
        knowledgeId: entry.knowledge_id,
      });
      continue;
    }
    if (entry.path !== article.path) {
      actions.push({
        type: "move",
        contentId,
        path: article.path,
        previousPath: entry.path,
        knowledgeId: entry.knowledge_id,
      });
      continue;
    }
    unchanged += 1;
  }

  for (const [contentId, entry] of Object.entries(previous)) {
    if (!current.has(contentId)) {
      actions.push({
        type: "delete",
        contentId,
        previousPath: entry.path,
        knowledgeId: entry.knowledge_id,
      });
    }
  }

  actions.sort((left, right) => left.contentId.localeCompare(right.contentId));
  return { actions, unchanged };
}
