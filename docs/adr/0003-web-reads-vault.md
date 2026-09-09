# ADR-0003：Web 以指定 Vault 为只读内容源

## 状态

Superseded by ADR-0004

## 日期

2026-09-09

> 本文保留为早期决策记录。当前生产文章来自 GitHub 内容快照，WeKnora 提供派生 Wiki、图谱与问答，详见 [ADR-0004](0004-github-content-and-weknora-derived-knowledge.md)。

## 背景

Passway 的内容在 Obsidian Vault 中维护，且文件、wikilink 与 frontmatter 是知识图谱的事实来源。公开 Web 需要将同一套文件渲染成可导航的 Wiki，而不应复制到另一个可编辑 CMS。

## 决策驱动因素

- Obsidian 与 Web 必须展示同一内容、同一链接和同一核验状态。
- 贡献者应在 Vault 中编辑，不依赖网页后台。
- Graph RAG、全文索引与 UI 需要共享稳定文件 ID 和链接解析结果。
- 生产页面必须可复现、可缓存、可回滚，且不能直接读取个人 iCloud 目录。

## 考虑的方案

### 方案 A：Web 在运行时直接读取本机 Vault

开发体验直接，但生产环境无法依赖个人目录，且 iCloud 同步中间态可能被展示。

### 方案 B：Web 以已校验的 Vault 快照为只读内容源

开发环境通过 `PASSWAY_VAULT_PATH` 读取指定目录；构建或发布前生成校验快照，生产 Web 只读取该不可变快照。

### 方案 C：Supabase 或 CMS 作为网页内容事实源

查询方便，但会造成 Vault 与网页内容双向漂移，违背 ADR-0001。

## 决策

选择方案 B。Web 是 Vault 的只读渲染器：开发态从显式配置的 Vault 根目录读取，生产态从相同解析器生成、校验通过的不可变内容快照读取。Supabase 仅保存派生索引、匿名运行状态和反馈，不能成为页面正文或关系的编辑来源。

## 后果

### 正面

- Obsidian、Git、静态 Wiki 与 Graph RAG 共用一套内容和关系。
- 任何网页页面均可定位回 Vault 文件与稳定 ID。
- 内容发布可按快照回滚，AI 或数据库不可用不影响 Wiki 阅读。

### 负面

- 需要可靠的 Markdown/frontmatter/wikilink 解析器和构建校验。
- 在线编辑不是首版能力；编辑仍通过 Vault 与版本控制完成。
- Web 不能假设所有 Obsidian 插件语法都能安全渲染。

## 实施约束

- 所有文件路径必须相对于配置的 Vault 根目录解析，拒绝路径穿越。
- 前端只接收经过验证的内容模型，不直接暴露本地绝对路径。
- 草稿、内部导入卡和评审字段默认不公开；开发预览可在明确开关下查看。
- 页面、搜索和图谱读取同一个 `snapshot_id`。

## 相关决策

- ADR-0001：Vault 是唯一内容事实源。
- ADR-0002：Graph RAG 主导混合检索。
