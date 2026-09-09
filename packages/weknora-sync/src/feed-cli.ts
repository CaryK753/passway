#!/usr/bin/env node
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { loadArticles, publishableArticles } from "./content.js";
import { renderRssFeed } from "./feed.js";

function option(name: string, fallback?: string): string {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    if (fallback !== undefined) return fallback;
    throw new Error(`缺少参数 ${name}`);
  }
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} 缺少参数`);
  return value;
}

async function main(): Promise<void> {
  const contentRoot = path.resolve(option("--content", "content"));
  const output = path.resolve(option("--output", "public/feeds/passway.xml"));
  const baseUrl = option("--base-url", process.env.PASSWAY_PUBLIC_URL);
  const articles = publishableArticles(await loadArticles(contentRoot));
  const feed = renderRssFeed(articles, { baseUrl });
  await writeAtomically(output, feed);
  console.log(JSON.stringify({ generated: true, output, items: articles.length }, null, 2));
}

async function writeAtomically(filePath: string, content: string): Promise<void> {
  const directory = path.dirname(filePath);
  await mkdir(directory, { recursive: true });
  const temporary = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporary, content, "utf8");
  await rename(temporary, filePath);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
