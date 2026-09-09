# 路线图

## Approach

Passway 采用“内容契约 → WeKnora 同步 PoC → 人工文章 Web → AI Wiki/图谱 → 匿名问答 → MVP”的顺序。任何阶段都必须交付可复查证据，不能用界面演示代替数据正确性。

## 阶段总览

| 阶段 | 目标 | 主要产物 |
| --- | --- | --- |
| Phase 0 | 冻结新架构 | ADR、内容契约、同步契约、风险与门槛 |
| Phase 1 | 验证 WeKnora 闭环 | 3 篇文章、RSS/API PoC、部署证据 |
| Phase 2 | 建立内容流水线 | 校验器、manifest、GitHub Actions、回滚 |
| Phase 3 | 建立人工文章 Web | Next.js 阅读、搜索、主题、标签与分屏 |
| Phase 4 | 接入 AI Wiki 与图谱 | Wiki Adapter、页面链接图、版本提示 |
| Phase 5 | 接入匿名问答 | profile、流式回答、引用、限流与降级 |
| Phase 6 | 发布 MVP | 内容快照、监控、备份、恢复和公开说明 |

## Phase 0：架构冻结

### Action Items

- [x] 接受 GitHub 人工文章事实源与 WeKnora 派生知识边界。
- [x] 定义最小文章 frontmatter。
- [x] 定义增量同步、manifest、验证和失败恢复。
- [x] 区分 Wiki 页面链接图与实体关系知识图谱。
- [x] 将旧 ADR 标记为被 ADR-0004 取代。
- [x] 评审并接受新架构方向；工程细节由 PoC 证据继续收敛。

### Exit Gate

- 主文档不存在自建 Graph RAG 与 WeKnora 方案的冲突；
- 人工内容和生成内容的可信边界明确；
- 同步 PoC 有可执行的输入、动作、证据和失败条件；
- 现有 Vault 在迁移验证前保持不变。

## Phase 1：WeKnora 同步 PoC

### 样本

选择 3 篇可核验文章，覆盖：

- 不同法域；
- 至少一篇包含年度金额或时间规则；
- 至少一篇包含表格、站内链接和多个官方来源；
- 每篇带唯一检索探针，便于证明新增和更新生效。

### Action Items

- [ ] 确认实际部署版本、Swagger 和可用端点。
- [ ] 创建隔离的 PoC knowledge base 和最小权限凭据。
- [ ] 实现内容校验与 dry-run 差异计划。
- [ ] 实现确定性全文 RSS，并连接 WeKnora RSS 数据源。
- [ ] 跑通新增、更新、移动、删除和幂等重试。
- [ ] 验证 API 导入是否触发 Auto-Wiki 与页面链接图更新。
- [ ] 验证知识检索、流式问答、引用和资源链接。
- [ ] 保存请求 ID、状态、检索结果和 Wiki/图谱证据。
- [ ] 记录版本差异、缺陷与临时兼容边界。

### Exit Gate

- 同一计划重复运行不产生重复 knowledge；
- 所有成功文章解析完成且新旧探针结果正确；
- 删除不会因临时扫描失败误触发；
- 部分失败不推进 manifest，旧内容仍可使用；
- Wiki/图谱自动更新得到实测证明，或明确形成可接受的降级方案；
- API Key 未进入仓库、日志或浏览器。

## Phase 2：内容与同步流水线

### Action Items

- [ ] 冻结 TypeScript/ESM 工程和包边界。
- [ ] 实现完整 schema、来源、状态、时间和站内链接校验。
- [ ] 实现版本化 manifest、原子更新和同步报告。
- [ ] 建立 staging/production knowledge base 隔离。
- [ ] 将 Feed 生成、XML 校验和公开可达性检查加入 CI。
- [ ] 为大批删除、超时、限流和版本不兼容设置保护。
- [ ] 在 GitHub Actions 中先运行 plan，再在受保护环境执行 sync/verify。
- [ ] 演练目标 commit 回滚和紧急内容撤回。

### Exit Gate

- 从空 WeKnora 环境可由指定 Git commit 重建；
- CI 失败不改变线上有效版本；
- 同步状态可追踪到 commit、content ID、knowledge ID 和 request ID；
- 恢复与撤回演练通过。

## Phase 3：人工文章 Web

### Action Items

- [ ] 初始化 Next.js 应用和可复现开发环境。
- [ ] 读取仓库 `content/` 并渲染 Markdown。
- [ ] 实现目录、搜索、筛选、主题、数据卡和来源卡。
- [ ] 实现标签页、一主一副分屏、深链和移动端退化。
- [ ] 显示核验、有效期、过期、冲突和纠错入口。
- [ ] 建立不依赖 WeKnora 或 JavaScript 的基本阅读路径。

### Exit Gate

- 公开文章与指定 Git commit 一致；
- 不公开草稿、绝对路径和内部评审信息；
- 用户能在三次交互内到达官方来源；
- AI 和 WeKnora 完全关闭时文章仍可读。

## Phase 4：AI Wiki 与图谱

### Action Items

- [ ] 实现 WeKnora 服务端 Adapter 和规范化数据模型。
- [ ] 渲染 Wiki 索引、页面、反向链接和生成版本。
- [ ] 实现按当前页面渐进加载的页面链接图。
- [ ] 显示 Git 内容版本与 Wiki 生成版本的同步状态。
- [ ] 评测实体关系图质量后决定是否公开。
- [ ] 对超大图、资源句柄和 WeKnora 故障建立降级。

### Exit Gate

- 用户能区分人工文章、AI Wiki 和两类图谱；
- Wiki 页面可追溯到生成版本和来源文章；
- 图谱不一次加载全库且不把页面链接冒充法律关系；
- WeKnora 故障不影响人工文章。

## Phase 5：受控匿名问答

### Action Items

- [ ] 决定 Embed MVP 与自建 Chat UI 的阶段边界。
- [ ] 定义最小 profile schema 和逐步披露。
- [ ] 实现流式回答、引用映射和相关文章联动。
- [ ] 实现速率、token、并发和每日预算限制。
- [ ] 验证用户背景不进入不必要日志。
- [ ] 测试法域污染、时间污染、信息不足和提示注入。

### Exit Gate

- 核心事实引用到人工文章和官方来源；
- 用户能区分事实、生成解释和未知；
- 预算或 WeKnora 故障时自动降级为文章搜索；
- 匿名滥用和隐私门槛通过。

## Phase 6：MVP 发布

- [ ] 冻结首发内容 commit、应用版本和 WeKnora 派生版本。
- [ ] 完成备份、恢复、回滚和密钥轮换演练。
- [ ] 发布来源、更新时间、生成内容说明、免责声明和纠错入口。
- [ ] 建立内容新鲜度、同步、检索、成本和错误监控。
- [ ] 小流量开放并按停止条件观察。

## 开发顺序

```text
Phase 0 架构冻结
  → Phase 1 WeKnora 同步 PoC
    → Phase 2 内容流水线
      → Phase 3 人工文章 Web
        → Phase 4 AI Wiki与图谱
          → Phase 5 匿名问答
            → Phase 6 MVP
```

Phase 3 可在 Phase 2 接口稳定后与部分 Phase 4 工作并行，但生产自动同步不得早于 PoC 完成。
