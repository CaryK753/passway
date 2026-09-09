import path from "node:path";
import {
  loadArticles,
  publishableArticles,
} from "../packages/weknora-sync/src/content";
import type { ContentArticle } from "../packages/weknora-sync/src/types";

const contentRoot = path.join(process.cwd(), "content");

export async function getPublicArticles(): Promise<ContentArticle[]> {
  return publishableArticles(await loadArticles(contentRoot));
}

export async function getPublicArticle(
  segments: string[],
): Promise<ContentArticle | undefined> {
  const requestedPath = `${segments.join("/")}.md`;
  return (await getPublicArticles()).find(({ path: articlePath }) =>
    articlePath === requestedPath
  );
}

export function articleHref(article: ContentArticle): string {
  const route = article.path
    .replace(/\.md$/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `/articles/${route}`;
}

export function articleBody(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---(?:\n|$)/, "");
}
