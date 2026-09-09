const apiBase = process.env.WEKNORA_API_BASE?.replace(/\/$/, "");
const apiKey = process.env.WEKNORA_API_KEY;
const knowledgeBaseId = process.env.WEKNORA_KNOWLEDGE_BASE_ID;

export interface WikiIndexItem { slug: string; title: string; summary: string }
export interface WikiIndexGroup { type: string; total: number; items: WikiIndexItem[] }
export interface WikiIndex { intro: string; version: number; groups: WikiIndexGroup[] }
export interface WikiPage {
  slug: string;
  title: string;
  summary: string;
  content: string;
  page_type: string;
  source_refs: string[] | null;
  in_links: string[] | null;
  out_links: string[] | null;
  updated_at: string;
}
export interface WikiGraph {
  nodes: Array<{ slug: string; title: string; page_type: string; link_count: number }>;
  edges: Array<{ source: string; target: string }>;
  meta?: { total: number; returned: number; truncated: boolean };
}

export function isWeKnoraConfigured(): boolean {
  return Boolean(apiBase && apiKey && knowledgeBaseId);
}

export async function fetchWeKnora<T>(path: string): Promise<T> {
  if (!apiBase || !apiKey) throw new Error("WeKnora server configuration is incomplete");
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`WeKnora returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export function wikiPath(path: string): string {
  if (!knowledgeBaseId) throw new Error("WeKnora knowledge base is not configured");
  return `/knowledgebase/${knowledgeBaseId}/wiki${path}`;
}

export function encodeWikiSlug(slug: string): string {
  return slug.split("/").map(encodeURIComponent).join("/");
}
