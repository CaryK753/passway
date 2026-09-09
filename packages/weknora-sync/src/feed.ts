import type { ContentArticle } from "./types.js";

interface FeedOptions {
  baseUrl: string;
  title?: string;
  description?: string;
  language?: string;
}

export function renderRssFeed(
  articles: ContentArticle[],
  options: FeedOptions,
): string {
  const baseUrl = normalizedBaseUrl(options.baseUrl);
  const ordered = [...articles].sort((left, right) =>
    left.metadata.content_id.localeCompare(right.metadata.content_id),
  );
  const items = ordered.map((article) => renderItem(article, baseUrl)).join("\n");
  const newest = ordered
    .map((article) => article.metadata.updated_at)
    .sort()
    .at(-1);
  const buildDate = newest ? `\n    <lastBuildDate>${rssDate(newest)}</lastBuildDate>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xml(options.title ?? "Passway 移民政策文章")}</title>
    <link>${xml(baseUrl)}</link>
    <description>${xml(options.description ?? "Passway 已发布并经人工复核的全文文章")}</description>
    <language>${xml(options.language ?? "zh-CN")}</language>
    <atom:link href="${xml(`${baseUrl}/feeds/passway.xml`)}" rel="self" type="application/rss+xml" />${buildDate}
${items}
  </channel>
</rss>
`;
}

function renderItem(article: ContentArticle, baseUrl: string): string {
  const route = article.path
    .replace(/\.md$/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const link = `${baseUrl}/articles/${route}`;
  return `    <item>
      <guid isPermaLink="false">${xml(article.metadata.content_id)}</guid>
      <title>${xml(article.metadata.title)}</title>
      <link>${xml(link)}</link>
      <pubDate>${rssDate(article.metadata.updated_at)}</pubDate>
      <description>${xml(article.metadata.summary)}</description>
      <content:encoded><![CDATA[${cdata(article.markdown)}]]></content:encoded>
    </item>`;
}

function normalizedBaseUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Feed base URL 必须使用 http 或 https");
  }
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/$/, "");
  return url.toString().replace(/\/$/, "");
}

function rssDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toUTCString();
}

function xml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cdata(value: string): string {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}
