# WeKnora 集成与同步契约

## 1. 责任边界

```text
本地 Markdown → GitHub main → Next.js 全文 RSS → WeKnora Connector
       │                                      │
       └──── Next.js 文章 ────────────────────┼─ Auto-Wiki
                                 ├─ Wiki 页面链接图
                                 ├─ 实体关系知识图谱
                                 └─ 检索与问答
```

| 组件 | 责任 | 不负责 |
| --- | --- | --- |
| GitHub | 人工文章、来源、审核记录、版本与回滚 | 分块、向量和生成 Wiki |
| 发布器 | 校验文章、生成全文 RSS、保持稳定 GUID | 自动改写政策内容 |
| API 工具 | 状态验证、紧急撤回和 Connector 故障修复 | 取代常规 RSS 调度 |
| WeKnora | 解析、索引、检索、问答、Auto-Wiki 和派生图谱 | 决定政策是否真实或仍有效 |
| Next.js | 聚合文章、Wiki、图谱和问答体验 | 在浏览器暴露管理密钥 |
| Supabase | 可选的匿名配额、反馈和产品状态 | 复制 WeKnora 向量与图索引 |

## 2. 发布与同步输入

生产发布只读取指定 Git commit 的 `content/**/*.md`，生成公开的 `/feeds/passway.xml`。WeKnora RSS Connector 以此作为常规摄取入口。工作目录、iCloud 状态和未提交文件不能成为生产输入。

每篇文章至少具有：

```yaml
---
content_id: de-opportunity-card
title: 德国机会卡
jurisdiction: germany
category: job-search
status: published
review_status: verified
last_reviewed: 2026-09-09
effective_from: 2024-06-01
effective_until: null
sources:
  - https://example.gov/official-guidance
---
```

`content_id` 创建后不得因移动或改名变化。只有 `status: published` 且 `review_status: verified` 的文章进入生产知识库。

## 3. Feed 合同

- 输出完整当前发布集合，不截断为最近 N 篇；
- `guid` 使用稳定 `content_id`；
- `link` 指向公开文章 canonical URL；
- `pubDate` 使用 `updated_at`；
- `content:encoded` 包含完整 Markdown；
- 仅包含 `published + verified`；
- 相同 Git commit 必须生成相同 Feed 字节。

## 4. Manifest

同步器维护可提交的结构定义，但生产状态文件作为 CI artifact 或受控状态保存，不与作者手工编辑混合：

```json
{
  "schema_version": 1,
  "knowledge_base_id": "kb-00000001",
  "source_commit": "<git-sha>",
  "entries": {
    "de-opportunity-card": {
      "path": "content/germany/opportunity-card.md",
      "sha256": "<normalized-content-hash>",
      "knowledge_id": "<weknora-id>",
      "parse_status": "completed",
      "synced_at": "2026-09-09T00:00:00Z"
    }
  }
}
```

文件路径不是远端身份。哈希在统一换行符和编码后计算，但不得删除具有语义的空白或 Markdown 结构。

## 5. API 差异计划

`weknora:plan` 产生四类动作：

- `create`：Git 存在有效文章，manifest 不存在；
- `update`：`content_id` 相同但正文哈希变化；
- `move`：正文身份相同但文件路径变化，只更新本地映射；
- `delete`：Git 的目标 commit 已明确删除文章，而不是扫描暂时失败。

正式同步前必须输出机器可读计划和人类摘要。删除数量超过安全阈值时失败，不能自动继续。

API 差异计划不再是常规写入路径，只用于迁移、修复、紧急撤回和 Connector 对账。

## 6. 执行与验证

推荐命令合同：

```text
pnpm content:validate  # 校验文章与来源元数据
pnpm content:feed      # 生成确定性全文 RSS
pnpm weknora:plan      # 只读生成差异
pnpm weknora:sync      # 仅用于显式修复或迁移
pnpm weknora:verify    # 验证派生结果
```

一次同步只有同时满足以下条件才成功：

1. 所有目标 knowledge 均存在且解析状态为 `completed`；
2. 新增的唯一探针文本可由知识检索召回；
3. 更新后的旧探针不再被当作当前内容召回；
4. 删除内容不再进入生产检索；
5. 开启 Auto-Wiki 时，相应 Wiki 任务完成且索引可读取；
6. Wiki 页面链接图端点返回与当前版本一致的数据；
7. 抽样问答包含来源引用且不引用草稿。

若 WeKnora 当前版本不能由 API 导入自动触发 Wiki 更新，同步器必须明确失败或把知识同步标为 `degraded`；不得把“知识解析成功”误报为“Wiki 已更新”。

## 7. 删除、失败与回滚

第一阶段关闭 RSS 数据源的自动删除同步。文章从 Feed 消失不能单独证明应该删除远端知识；紧急撤回先通过 API 禁用或删除明确 knowledge ID，并记录原因。

- manifest 仅在整个同步批次通过验证后原子更新。
- 保存每次同步的 source commit、计划、请求 ID、知识 ID、状态和错误摘要。
- 更新优先采用可恢复策略；在确认新知识可用前不删除旧知识。
- 内容紧急撤回可先禁用对应 knowledge，再由后续同步完成删除。
- 回滚以目标 Git commit 重新生成同步计划，不直接手工拼接远端状态。

## 8. 安全

- `X-API-Key` 只存在于本地密钥存储或 GitHub Actions Secrets。
- 浏览器只调用 Passway Route Handler 或权限受限的 Embed 渠道。
- 管理、上传、删除和重建端点不能暴露到匿名前端。
- 日志不得记录 API Key、完整用户背景或限时资源直链。
- 每个请求附加可追踪但不含个人信息的 `X-Request-ID`。

## 9. PoC 矩阵

| 场景 | 操作 | 必须保存的证据 |
| --- | --- | --- |
| 新增 | 上传第一篇 Markdown | knowledge ID、解析状态、检索结果、Wiki 页面 |
| 更新 | 修改唯一事实与探针 | 新旧检索对比、Wiki 修订或重建结果 |
| 移动 | 改文件路径但保留 `content_id` | 无重复 knowledge、manifest 路径更新 |
| 删除 | 从目标 commit 删除文章 | 删除计划、远端禁用/删除、检索无结果 |
| 部分失败 | 模拟第二篇上传失败 | manifest 不前移、旧内容仍可用、错误报告 |
| 恢复 | 重跑同一计划 | 幂等完成、不产生重复知识 |

PoC 通过后才允许把 Feed 发布与数据源同步检查加入 GitHub Actions。

## 10. 官方参考与版本约束

- [WeKnora API 概览](https://github.com/Tencent/WeKnora/blob/main/docs/api/README.md)
- [知识管理 API](https://github.com/Tencent/WeKnora/blob/main/docs/api/knowledge.md)
- [知识库管理 API](https://github.com/Tencent/WeKnora/blob/main/docs/api/knowledge-base.md)
- [聊天 API](https://github.com/Tencent/WeKnora/blob/main/docs/api/chat.md)

实际部署以对应版本的 Swagger 为接口权威。实现必须记录验证过的 WeKnora 版本，不假设 `main` 分支文档与部署版本完全一致。
