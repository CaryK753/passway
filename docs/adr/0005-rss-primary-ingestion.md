# ADR-0005：以全文 RSS 作为 WeKnora 主摄取通道

## 状态

Accepted

## 日期

2026-09-09

## 背景

ADR-0004 确立 GitHub Markdown 为人工内容事实源，并计划通过自研同步器逐篇调用 WeKnora API。WeKnora 已提供 RSS/Atom Connector，包括全文抓取、内容指纹增量同步、多 Feed、调度、游标和同步日志。

若继续自建全部推送生命周期，会重复实现 WeKnora 已具备的调度、去重、失败记录和数据源管理。

## 决策

1. Passway 从 GitHub 内容快照生成公开、确定性的全文 RSS Feed。
2. WeKnora RSS Connector 订阅该 Feed，承担常规新增和更新。
3. API Client 保留用于只读验证、显式重同步、紧急禁用/撤回和 Connector 故障修复。
4. 第一阶段关闭自动同步删除。撤回必须显式执行并留下审计证据。
5. RSS 生成失败阻止新内容发布；WeKnora 同步失败不阻止人工文章站点继续提供上一有效内容。

## Feed 身份

- `guid`：永久稳定的 `content_id`；
- `link`：公开文章 canonical URL；
- `pubDate`：文章内容最后变更时间 `updated_at`；
- `content:encoded`：完整 Markdown，不使用摘要代替；
- Feed 是全量当前发布集合，不使用“最近 N 篇”滑动窗口。

## 删除语义

RSS/Atom 没有跨实现一致的删除协议，Feed 条目消失也可能只是发布窗口变化。Passway 不允许 WeKnora 仅凭一次缺失自动删除知识。归档和撤回由发布状态、API 控制动作和同步报告共同处理。

## 后果

### 正面

- 大幅减少自研写入、调度和游标代码；
- GitHub/Next.js 和 WeKnora 使用同一个公开内容出口；
- Feed 可独立验证、缓存和观察；
- WeKnora 仍可替换，文章不依赖其数据库。

### 负面

- 必须先部署公开 Feed，才能完成实时 Connector PoC；
- RSS Connector 会抓取 Feed 或文章 URL，需要稳定公网可达性；
- 删除和紧急撤回仍需受控 API；
- 来源更新时间等元数据是否完整进入 WeKnora 需要实测。

## 与 ADR-0004 的关系

本 ADR 细化 ADR-0004 的同步通道，不改变 GitHub 是人工事实源、WeKnora 是派生系统的边界。
