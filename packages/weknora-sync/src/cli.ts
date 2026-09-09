#!/usr/bin/env node
import path from "node:path";
import { loadArticles, publishableArticles } from "./content.js";
import { loadManifest } from "./manifest.js";
import { createSyncPlan } from "./plan.js";
import { WeKnoraClient } from "./client.js";
import { applySyncPlan } from "./sync.js";

interface Options {
  command: "validate" | "plan" | "sync";
  contentRoot: string;
  manifestPath: string;
  apply: boolean;
  sourceCommit: string | null;
  maxDeletes: number;
}

function parseOptions(argv: string[]): Options {
  const command = argv[0];
  if (command !== "validate" && command !== "plan" && command !== "sync") {
    throw new Error("用法: cli.ts <validate|plan|sync> [选项]");
  }
  const value = (name: string, fallback: string): string => {
    const index = argv.indexOf(name);
    if (index === -1) return fallback;
    const result = argv[index + 1];
    if (!result || result.startsWith("--")) throw new Error(`${name} 缺少参数`);
    return result;
  };
  return {
    command,
    contentRoot: path.resolve(value("--content", "content")),
    manifestPath: path.resolve(
      value("--manifest", ".passway/weknora-manifest.local.json"),
    ),
    apply: argv.includes("--apply"),
    sourceCommit: optionalValue(argv, "--source-commit"),
    maxDeletes: Number(value("--max-deletes", "0")),
  };
}

function optionalValue(argv: string[], name: string): string | null {
  const index = argv.indexOf(name);
  if (index === -1) return null;
  const result = argv[index + 1];
  if (!result || result.startsWith("--")) throw new Error(`${name} 缺少参数`);
  return result;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const articles = await loadArticles(options.contentRoot);
  const publishable = publishableArticles(articles);

  if (options.command === "validate") {
    console.log(
      JSON.stringify(
        { valid: true, articles: articles.length, publishable: publishable.length },
        null,
        2,
      ),
    );
    return;
  }

  const manifest = await loadManifest(options.manifestPath);
  const plan = createSyncPlan(publishable, manifest);
  if (options.command === "plan") {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (!options.apply) throw new Error("远端同步必须显式传入 --apply");
  if (!Number.isInteger(options.maxDeletes) || options.maxDeletes < 0) {
    throw new Error("--max-deletes 必须是非负整数");
  }
  const baseUrl = requiredEnvironment("WEKNORA_BASE_URL");
  const apiKey = requiredEnvironment("WEKNORA_API_KEY");
  const knowledgeBaseId = requiredEnvironment("WEKNORA_KNOWLEDGE_BASE_ID");
  if (!options.sourceCommit) throw new Error("sync 必须传入 --source-commit");

  const nextManifest = await applySyncPlan({
    client: new WeKnoraClient({ baseUrl, apiKey }),
    knowledgeBaseId,
    sourceCommit: options.sourceCommit,
    manifestPath: options.manifestPath,
    previousManifest: manifest,
    articles: publishable,
    plan,
    maxDeletes: options.maxDeletes,
  });
  console.log(
    JSON.stringify(
      { synced: true, sourceCommit: nextManifest.source_commit, actions: plan.actions.length },
      null,
      2,
    ),
  );
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`缺少环境变量 ${name}`);
  return value;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
