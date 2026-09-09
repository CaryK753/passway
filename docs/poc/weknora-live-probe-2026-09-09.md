# WeKnora 实例 PoC 记录

## 范围

- 实例：`https://weknora.spark-ai.top/api/v1`
- 日期：2026-09-09
- 隔离知识库：`Passway PoC`
- 知识库 ID：`1f9da7d8-ddab-4420-b67c-d4968571cc87`
- 未记录 API Key。
- 未读取、修改或删除任何既有知识库内容。

## 知识库配置

- 类型：`document`
- Keyword：启用
- Vector：启用
- Wiki：启用
- Entity graph：关闭
- 存储：MinIO
- 分块策略：heading，1024 字符，100 overlap

## 三篇安全样本

样本均明确声明不包含真实移民政策，只用于系统验证：

| 标题 | Knowledge ID | 唯一探针 |
| --- | --- | --- |
| Passway PoC · 德国样本 | `3519874f-189a-40fb-8565-8051f25b248a` | `PASSWAY_POC_DE_20260909` |
| Passway PoC · 加拿大样本 | `615def16-3c60-402f-ad37-14dea74df366` | `PASSWAY_POC_CA_20260909` |
| Passway PoC · 澳大利亚样本 | `190f8312-8ede-44b5-bc49-24352a874d78` | `PASSWAY_POC_AU_20260909` |

## 已验证合同

1. `GET /knowledge-bases` 使用 API Key 成功。
2. `POST /knowledge-bases` 成功创建隔离知识库。
3. `POST /knowledge-bases/:id/knowledge/manual` 使用 `{title, content, status:"publish"}` 成功，响应为 `{success,data}`。
4. `GET /knowledge/:id` 可读取解析、摘要、启用和待处理子任务状态。
5. `POST /knowledge-search` 可检索三篇样本，响应为 `{success,data[]}`。
6. Wiki Index 和 Graph 是直接对象，不使用 `{success,data}` 包装：
   - `GET /knowledgebase/:kb_id/wiki/index`
   - `GET /knowledgebase/:kb_id/wiki/graph?mode=overview&limit=500`
7. 空图的 `edges` 为 `null`，Adapter 应归一化为 `[]`。

## 发现的问题

### WPK-01：Wiki 子任务具有明显的异步等待阶段

三篇知识均满足：

- `summary_status=completed`
- `enable_status=enabled`
- 基础检索可召回
- `parse_status=finalizing`
- `pending_subtasks_count=1`

初次有界轮询期间，Wiki Index 仍为 0 页，Wiki Graph 只有 Index 节点。后续复查时三篇均转为 `completed`、待处理子任务归零，Wiki Index 版本变为 3 并生成 19 页；页面链接图生成 20 个节点和 112 条边。

这证明“基础检索可用”与“Auto-Wiki 完成”是两个独立门槛，但本次不是永久卡死。同步器应分别报告 `retrieval_ready` 和 `wiki_ready`，并为 Wiki 的 debounce、批处理和生成阶段配置更长的独立超时。

### WPK-02：唯一探针不保证 Top-1

三个样本文本高度相似。搜索对每个探针都返回三个结果；德国、加拿大探针的目标文档排第一，澳大利亚探针的目标文档不是第一。同步验证应检查目标 knowledge ID 是否进入结果集及内容是否包含探针，不能只依赖 Top-1。

### WPK-03：知识库聚合计数存在延迟或语义差异

知识库返回 `knowledge_count=3`，但当时 `chunk_count=0`；与此同时知识搜索已经返回分块结果。不能用知识库聚合 `chunk_count` 单独判定索引是否可用。

## 当前结论

基础 Markdown 入库、检索、Auto-Wiki 和页面链接图生成均已通过。下一步测试单篇更新后旧探针消失、新探针出现，以及 Wiki 版本递增；随后测试移动、受保护删除和幂等恢复。
