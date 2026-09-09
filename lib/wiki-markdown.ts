function safeWikiTarget(slug: string): string | null {
  const cleaned = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!cleaned || cleaned.includes("..") || !/^[\p{L}\p{N}/_-]+$/u.test(cleaned)) return null;
  return cleaned.split("/").map(encodeURIComponent).join("/");
}

export function renderWikiMarkdown(markdown: string): string {
  return markdown.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (whole, rawSlug: string, rawLabel?: string) => {
    const target = safeWikiTarget(rawSlug);
    if (!target) return rawLabel?.trim() || rawSlug.trim() || whole;
    const label = (rawLabel?.trim() || rawSlug.trim()).replace(/([\[\]])/g, "\\$1");
    return `[${label}](/wiki/${target})`;
  });
}
