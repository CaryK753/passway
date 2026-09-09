import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";
import {
  ARTICLE_STATUSES,
  REVIEW_STATUSES,
  type ArticleMetadata,
  type ContentArticle,
} from "./types";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nullableDate = z.union([
  z.string().regex(isoDate, "必须是 YYYY-MM-DD"),
  z.null(),
]);

const articleSchema = z
  .object({
    content_id: z.string().regex(slug, "必须是小写 kebab-case"),
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    jurisdiction: z.string().regex(slug, "必须是小写 kebab-case"),
    category: z.string().regex(slug, "必须是小写 kebab-case"),
    status: z.enum(ARTICLE_STATUSES),
    review_status: z.enum(REVIEW_STATUSES),
    last_reviewed: nullableDate,
    review_due: nullableDate,
    updated_at: z.string().regex(isoDate, "必须是 YYYY-MM-DD"),
    effective_from: nullableDate,
    effective_until: nullableDate,
    sources: z.array(z.url()).default([]),
    aliases: z.array(z.string().trim().min(1)).optional(),
  })
  .strict()
  .superRefine((article, context) => {
    if (article.status === "published" && article.review_status !== "verified") {
      context.addIssue({
        code: "custom",
        path: ["review_status"],
        message: "published 文章必须是 verified",
      });
    }
    if (article.status === "published") {
      for (const field of ["last_reviewed", "review_due"] as const) {
        if (article[field] === null) {
          context.addIssue({
            code: "custom",
            path: [field],
            message: "published 文章不得为空",
          });
        }
      }
      if (article.sources.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["sources"],
          message: "published 文章至少需要一个来源",
        });
      }
    }
    if (
      article.effective_from &&
      article.effective_until &&
      article.effective_from > article.effective_until
    ) {
      context.addIssue({
        code: "custom",
        path: ["effective_until"],
        message: "不得早于 effective_from",
      });
    }
  });

function normalizeMarkdown(source: string): string {
  return `${source.replaceAll("\r\n", "\n").trimEnd()}\n`;
}

function parseFrontmatter(source: string, filePath: string): ArticleMetadata {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(source);
  if (!match?.[1]) {
    throw new Error(`${filePath}: 缺少有效 YAML frontmatter`);
  }
  const parsed: unknown = YAML.parse(match[1]);
  const result = articleSchema.safeParse(parsed);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${filePath}: ${details}`);
  }
  return result.data;
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return findMarkdownFiles(target);
      return entry.isFile() && entry.name.endsWith(".md") ? [target] : [];
    }),
  );
  return nested.flat().sort();
}

export async function loadArticles(contentRoot: string): Promise<ContentArticle[]> {
  const absoluteRoot = path.resolve(contentRoot);
  const files = await findMarkdownFiles(absoluteRoot);
  const articles = await Promise.all(
    files.map(async (file) => {
      const markdown = normalizeMarkdown(await readFile(file, "utf8"));
      const relativePath = path.relative(absoluteRoot, file).split(path.sep).join("/");
      return {
        metadata: parseFrontmatter(markdown, relativePath),
        path: relativePath,
        markdown,
        sha256: createHash("sha256").update(markdown).digest("hex"),
      };
    }),
  );

  const pathsById = new Map<string, string>();
  for (const article of articles) {
    const previous = pathsById.get(article.metadata.content_id);
    if (previous) {
      throw new Error(
        `重复 content_id ${article.metadata.content_id}: ${previous}, ${article.path}`,
      );
    }
    pathsById.set(article.metadata.content_id, article.path);
  }
  return articles;
}

export function publishableArticles(articles: ContentArticle[]): ContentArticle[] {
  return articles.filter(
    ({ metadata }) =>
      metadata.status === "published" && metadata.review_status === "verified",
  );
}
