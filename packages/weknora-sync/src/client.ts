export interface KnowledgeRecord {
  id: string;
  parseStatus: string;
  errorMessage: string;
}

export interface KnowledgeSearchResult {
  id: string;
  content: string;
  knowledgeId: string;
  knowledgeTitle: string;
  score: number;
}

export interface WikiIndex {
  version: number;
  intro: string;
  groups: Array<{ type: string; total: number; items: unknown[] }>;
}

export interface WikiGraph {
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
  meta: Record<string, unknown>;
}

interface ClientOptions {
  baseUrl: string;
  apiKey: string;
  fetch?: typeof globalThis.fetch;
}

export class WeKnoraClient {
  readonly #baseUrl: string;
  readonly #apiKey: string;
  readonly #fetch: typeof globalThis.fetch;

  constructor(options: ClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#apiKey = options.apiKey;
    this.#fetch = options.fetch ?? globalThis.fetch;
  }

  async createManual(
    knowledgeBaseId: string,
    title: string,
    content: string,
    requestId: string,
  ): Promise<string> {
    const data = await this.#request(
      `/knowledge-bases/${encodeURIComponent(knowledgeBaseId)}/knowledge/manual`,
      { method: "POST", body: JSON.stringify({ title, content, status: "publish" }) },
      requestId,
    );
    return requiredString(data, "id");
  }

  async updateManual(
    knowledgeId: string,
    title: string,
    content: string,
    requestId: string,
  ): Promise<void> {
    await this.#request(
      `/knowledge/manual/${encodeURIComponent(knowledgeId)}`,
      { method: "PUT", body: JSON.stringify({ title, content, status: "publish" }) },
      requestId,
    );
  }

  async deleteKnowledge(knowledgeId: string, requestId: string): Promise<void> {
    await this.#request(
      `/knowledge/${encodeURIComponent(knowledgeId)}`,
      { method: "DELETE" },
      requestId,
    );
  }

  async getKnowledge(knowledgeId: string, requestId: string): Promise<KnowledgeRecord> {
    const data = await this.#request(
      `/knowledge/${encodeURIComponent(knowledgeId)}`,
      { method: "GET" },
      requestId,
    );
    return {
      id: requiredString(data, "id"),
      parseStatus: requiredString(data, "parse_status"),
      errorMessage: optionalString(data, "error_message"),
    };
  }

  async searchKnowledge(
    knowledgeBaseId: string,
    query: string,
    requestId: string,
  ): Promise<KnowledgeSearchResult[]> {
    const payload = await this.#fetchPayload(
      "/knowledge-search",
      { method: "POST", body: JSON.stringify({ query, knowledge_base_id: knowledgeBaseId }) },
      requestId,
    );
    const root = objectValue(payload, "响应");
    if (root.success !== true || !Array.isArray(root.data)) {
      throw new Error(`WeKnora 搜索响应结构无效: ${errorMessage(root)}`);
    }
    return root.data.map((item, index) => {
      const result = objectValue(item, `data[${index}]`);
      return {
        id: requiredString(result, "id"),
        content: requiredString(result, "content"),
        knowledgeId: requiredString(result, "knowledge_id"),
        knowledgeTitle: requiredString(result, "knowledge_title"),
        score: requiredNumber(result, "score"),
      };
    });
  }

  async getWikiIndex(knowledgeBaseId: string, requestId: string): Promise<WikiIndex> {
    const payload = objectValue(
      await this.#fetchPayload(
        `/knowledgebase/${encodeURIComponent(knowledgeBaseId)}/wiki/index`,
        { method: "GET" },
        requestId,
      ),
      "Wiki index",
    );
    if (!Array.isArray(payload.groups)) throw new Error("WeKnora Wiki groups 缺失");
    return {
      version: requiredNumber(payload, "version"),
      intro: requiredString(payload, "intro"),
      groups: payload.groups.map((item, index) => {
        const group = objectValue(item, `groups[${index}]`);
        if (!Array.isArray(group.items)) throw new Error(`groups[${index}].items 缺失`);
        return {
          type: requiredString(group, "type"),
          total: requiredNumber(group, "total"),
          items: group.items,
        };
      }),
    };
  }

  async getWikiGraph(knowledgeBaseId: string, requestId: string): Promise<WikiGraph> {
    const payload = objectValue(
      await this.#fetchPayload(
        `/knowledgebase/${encodeURIComponent(knowledgeBaseId)}/wiki/graph?mode=overview&limit=500`,
        { method: "GET" },
        requestId,
      ),
      "Wiki graph",
    );
    if (!Array.isArray(payload.nodes)) throw new Error("WeKnora Wiki nodes 缺失");
    if (payload.edges !== null && !Array.isArray(payload.edges)) {
      throw new Error("WeKnora Wiki edges 结构无效");
    }
    return {
      nodes: payload.nodes.map((node, index) => objectValue(node, `nodes[${index}]`)),
      edges: (payload.edges ?? []).map((edge: unknown, index: number) =>
        objectValue(edge, `edges[${index}]`),
      ),
      meta: objectValue(payload.meta, "meta"),
    };
  }

  async waitUntilProcessed(
    knowledgeId: string,
    requestId: string,
    options: { timeoutMs: number; pollMs: number },
  ): Promise<KnowledgeRecord> {
    const deadline = Date.now() + options.timeoutMs;
    while (Date.now() < deadline) {
      const record = await this.getKnowledge(knowledgeId, requestId);
      if (record.parseStatus === "completed") return record;
      if (["failed", "cancelled"].includes(record.parseStatus)) {
        throw new Error(
          `WeKnora 解析失败 ${knowledgeId}: ${record.errorMessage || record.parseStatus}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, options.pollMs));
    }
    throw new Error(`等待 WeKnora 解析超时: ${knowledgeId}`);
  }

  async #request(
    endpoint: string,
    init: RequestInit,
    requestId: string,
  ): Promise<Record<string, unknown>> {
    const payload = await this.#fetchPayload(endpoint, init, requestId);
    const root = objectValue(payload, "响应");
    if (root.success !== true) {
      throw new Error(`WeKnora 返回失败: ${errorMessage(root)}`);
    }
    return root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : {};
  }

  async #fetchPayload(
    endpoint: string,
    init: RequestInit,
    requestId: string,
  ): Promise<unknown> {
    const response = await this.#fetch(`${this.#baseUrl}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.#apiKey,
        "X-Request-ID": requestId,
      },
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`WeKnora ${response.status}: ${errorMessage(payload)}`);
    }
    return payload;
  }
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`WeKnora ${label} 结构无效`);
  }
  return value as Record<string, unknown>;
}

function requiredString(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`WeKnora data.${key} 缺失`);
  }
  return value;
}

function optionalString(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

function requiredNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`WeKnora data.${key} 缺失`);
  }
  return value;
}

function errorMessage(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const root = payload as Record<string, unknown>;
    if (typeof root.message === "string") return root.message;
    if (root.error && typeof root.error === "object") {
      const error = root.error as Record<string, unknown>;
      if (typeof error.message === "string") return error.message;
    }
  }
  return "未知错误";
}
