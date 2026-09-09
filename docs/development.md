# 开发规范

## 仓库与内容边界

`/Users/cary/Desktop/Fun/passway` 是项目与发布仓库，保存 `content/`、Next.js、同步工具、测试、文档和任务记录。现有 iCloud Pathway Vault 只作为迁移输入；生产、CI 和 Vercel 不直接读取个人 iCloud 目录。

推荐结构：

```text
passway/
├── apps/web/
├── content/
├── packages/
│   ├── content/
│   ├── weknora-client/
│   └── weknora-sync/
├── scripts/
├── docs/
├── .codex/tasks/
└── supabase/
```

PoC 前不创建空 package。模块文件遵守项目行数限制。

## 发布流水线

```text
读取指定 Git commit
→ 校验 Markdown/frontmatter/来源
→ 生成内容清单与同步计划
→ 增量写入 WeKnora
→ 等待解析
→ 验证检索、Wiki、图谱和引用
→ 发布 Next.js
```

校验或同步失败时，线上继续使用上一有效版本。构建不能从未提交工作树或 iCloud 中间态读取生产内容。

## Adapter 边界

应用只能通过内部接口依赖 WeKnora：

```ts
interface KnowledgeBackend {
  plan(source: ContentSnapshot): Promise<SyncPlan>;
  sync(plan: SyncPlan): Promise<SyncResult>;
  verify(result: SyncResult): Promise<VerificationReport>;
  getWikiIndex(): Promise<WikiIndex>;
  getWikiPage(slug: string): Promise<WikiPage>;
  getWikiGraph(scope: GraphScope): Promise<WikiGraph>;
  streamAnswer(input: ChatInput): AsyncIterable<ChatEvent>;
}
```

接口表示责任边界，不要求首个 PoC 一次实现全部方法。WeKnora 路由和响应转换集中在 Adapter 内，页面组件不得依赖其原始响应结构。

## 环境变量

命名在实现 PoC 时冻结，至少区分：

- 服务端 API 地址；
- 管理 API Key；
- knowledge base ID；
- Agent 或 Embed 渠道 ID；
- 同步环境 `development/staging/production`。

密钥不使用 `NEXT_PUBLIC_*`，不写入 manifest、日志或客户端 bundle。

## 开发要求

- 先改内容契约和 ADR，再改同步器与前端。
- 同步工具默认 dry-run，删除需要显式计划与阈值保护。
- API 成功不等于同步成功，必须轮询解析并运行验证。
- 每次同步携带 source commit、content ID 和 request ID。
- 不用全局 skip、ignore 或关闭类型检查掩盖错误。
- WeKnora 生成内容不得写回或覆盖 `content/`。
- 用户背景默认只用于当前问答；持久化需要独立隐私决策。

## 最小验证层级

1. 单文章 schema 与来源校验。
2. 全内容稳定 ID、站内链接和发布状态校验。
3. 同步计划快照测试。
4. 新增、更新、移动、删除和幂等恢复集成测试。
5. WeKnora 解析、检索、Wiki 和图谱部署探针。
6. 问答引用、法域污染、时间污染和降级测试。

