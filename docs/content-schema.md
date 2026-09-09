# Markdown 文章与发布规范

## 1. 目的

Passway 内容是适合直接阅读的普通 Markdown 文章。结构化字段只承担稳定身份、发布控制、时效、来源和基础筛选，不要求作者为了知识图谱拆分大量实体文件。

生产内容放在项目仓库：

```text
content/<jurisdiction>/<article-slug>.md
```

路径使用小写 ASCII kebab-case。移动文件不能改变 `content_id`。

## 2. 最小 frontmatter

```yaml
---
content_id: de-opportunity-card
title: 德国机会卡
summary: 面向希望赴德求职者的机会卡政策说明。
jurisdiction: germany
category: job-search
status: published
review_status: verified
last_reviewed: 2026-09-09
review_due: 2026-12-09
updated_at: 2026-09-09
effective_from: 2024-06-01
effective_until: null
sources:
  - https://www.make-it-in-germany.com/example
aliases:
  - Chancenkarte
---
```

## 3. 字段规则

| 字段 | 必填 | 规则 |
| --- | --- | --- |
| `content_id` | 是 | 全仓库唯一、永久稳定的小写 kebab-case ID |
| `title` | 是 | 用户可读标题 |
| `summary` | 是 | 不含未经正文和来源支持的新结论 |
| `jurisdiction` | 是 | 受控法域 slug |
| `category` | 是 | 受控文章类别 |
| `status` | 是 | `draft`、`published`、`archived` |
| `review_status` | 是 | `draft`、`in-review`、`verified`、`stale`、`conflicted` |
| `last_reviewed` | 是 | ISO 日期；未复核草稿可为 `null` |
| `review_due` | 是 | 下次最迟复核日期 |
| `updated_at` | 是 | 正文或元数据最后发生语义变更的日期；用于 Feed 增量判断 |
| `effective_from` | 是 | 文章所述当前版本起始日；未知写 `null` |
| `effective_until` | 是 | 失效日；仍有效或未知写 `null`，正文解释未知情况 |
| `sources` | 是 | 官方原始 URL 数组；已发布文章不得为空 |
| `aliases` | 否 | 原文名和常用译名数组 |

只有 `status: published` 且 `review_status: verified` 的文章同步到生产 WeKnora 知识库。其他状态可在预览环境展示，但不能进入确定性问答证据集。

## 4. 正文模板

```md
# 标题

> 核验日期、适用范围和非法律意见提示。

## 适合谁

## 核心条件

## 申请流程

## 获得的身份与限制

## 后续路径

## 常见误区与不确定性

## 官方来源
```

章节可以按文章需要调整，但硬性数字、日期、资格、费用和身份权利必须在附近给出来源链接。文章末尾来源清单不能替代正文中的明确对应关系。

## 5. 链接

- 使用标准 Markdown 链接连接站内文章和外部来源。
- 可以保留易读的 Obsidian `[[wikilink]]`，但它不是发布必需字段，也不承担已核验法律关系。
- 同步前将受支持的站内链接规范化；未知 Obsidian 语法必须安全降级。
- WeKnora 生成的 Wiki 链接属于派生数据，不写回原文章。

## 6. 来源与时间

来源优先级为：法律与正式公报、主管机关指引、政府表格、官方统计、被授权服务机构、专业解释、一般二手资料。硬性门槛原则上至少由前四类来源之一支持。

正文必须区分来源发布日期、规则生效日期、URL 最后检查日期和文章最后人工复核日期。复核日期不是政策仍有效的证明。检测到来源变化时先标记 `stale`，不能让脚本或 LLM 自动改写政策结论。

## 7. 构建期校验

发布必须拒绝：

- 缺失或重复 `content_id`；
- 未知状态、类别或法域；
- `published/verified` 文章缺少来源、核验日期或复核截止日；
- 时间区间倒置；
- 指向不存在站内文章的链接；
- 绝对本地路径、密钥、用户资料或构建产物；
- 同一 `content_id` 在一次同步中对应多篇文章。

长期未复核、低等级来源或没有正文内来源对应关系应产生警告，并阻止提升为 `published/verified`。

## 8. 现有 Vault 迁移

现有 Pathway Vault 是迁移输入，不直接成为生产目录。迁移按文章逐篇进行：合并细粒度节点为可读文章、保留可验证来源、分配稳定 `content_id`、完成人工复核后进入 `content/`。在迁移报告和抽样核对完成前不批量删除原文件。
