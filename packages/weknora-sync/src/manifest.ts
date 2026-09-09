import { readFile } from "node:fs/promises";
import { z } from "zod";
import type { SyncManifest } from "./types.js";

const entrySchema = z.object({
  path: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  knowledge_id: z.string().min(1),
  parse_status: z.string().min(1),
  synced_at: z.iso.datetime(),
});

const manifestSchema = z.object({
  schema_version: z.literal(1),
  knowledge_base_id: z.string().min(1),
  source_commit: z.string().min(1),
  entries: z.record(z.string(), entrySchema),
});

export async function loadManifest(filePath: string): Promise<SyncManifest | null> {
  try {
    const raw: unknown = JSON.parse(await readFile(filePath, "utf8"));
    return manifestSchema.parse(raw);
  } catch (error) {
    if (isMissingFile(error)) return null;
    throw new Error(`无法读取 manifest ${filePath}`, { cause: error });
  }
}

function isMissingFile(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
