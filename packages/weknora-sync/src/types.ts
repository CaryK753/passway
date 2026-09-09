export const ARTICLE_STATUSES = ["draft", "published", "archived"] as const;
export const REVIEW_STATUSES = [
  "draft",
  "in-review",
  "verified",
  "stale",
  "conflicted",
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface ArticleMetadata {
  content_id: string;
  title: string;
  summary: string;
  jurisdiction: string;
  category: string;
  status: ArticleStatus;
  review_status: ReviewStatus;
  last_reviewed: string | null;
  review_due: string | null;
  updated_at: string;
  effective_from: string | null;
  effective_until: string | null;
  sources: string[];
  aliases?: string[];
}

export interface ContentArticle {
  metadata: ArticleMetadata;
  path: string;
  markdown: string;
  sha256: string;
}

export interface ManifestEntry {
  path: string;
  sha256: string;
  knowledge_id: string;
  parse_status: string;
  synced_at: string;
}

export interface SyncManifest {
  schema_version: 1;
  knowledge_base_id: string;
  source_commit: string;
  entries: Record<string, ManifestEntry>;
}

export type SyncAction =
  | { type: "create"; contentId: string; path: string; sha256: string }
  | {
      type: "update";
      contentId: string;
      path: string;
      previousPath: string;
      sha256: string;
      knowledgeId: string;
    }
  | {
      type: "move";
      contentId: string;
      path: string;
      previousPath: string;
      knowledgeId: string;
    }
  | {
      type: "delete";
      contentId: string;
      previousPath: string;
      knowledgeId: string;
    };

export interface SyncPlan {
  actions: SyncAction[];
  unchanged: number;
}
