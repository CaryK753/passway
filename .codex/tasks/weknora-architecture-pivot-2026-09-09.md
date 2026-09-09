# WeKnora 架构转向

## 状态

已完成（架构与 PoC 契约已冻结；工程 PoC 另立任务）

## 目标

将 Passway 从“人工维护细粒度 Obsidian 图谱并自建 Graph RAG”调整为“GitHub 管理普通 Markdown 文章，WeKnora 生成可重建的检索、Wiki 与图谱，Next.js 统一呈现”。

## 边界

- 本轮只冻结架构、内容契约、同步协议、前端边界与 PoC 门槛。
- 不删除或批量迁移现有 Pathway Vault。
- 不初始化 Next.js 工程，不写入 WeKnora，不创建生产密钥。

## TODO

- [x] 盘点现有规划、ADR、内容规范和工作区边界。
- [x] 明确人工内容、WeKnora 派生数据和前端的所有权。
- [x] 设计增量同步协议、manifest 与失败恢复规则。
- [x] 区分 Wiki 页面链接图与实体关系知识图谱。
- [x] 更新产品、开发、内容、Web、路线图、风险和评测文档。
- [ ] 用实际 WeKnora 部署验证 API 上传能否触发 Wiki 与图谱更新。
- [ ] 选取 3 篇文章实施新增、修改、删除的同步 PoC。
- [ ] 根据 PoC 证据决定同步工具的正式接口和自动化方式。

## 当前决策

1. GitHub `main` 中通过校验的 Markdown 是人工知识事实源。
2. WeKnora 的知识条目、分块、索引、Auto-Wiki 和图谱都是可重建派生数据。
3. Passway 前端直接渲染人工文章，通过服务端 Adapter 读取 WeKnora Wiki、图谱和问答。
4. 同步采用稳定 `content_id`、内容哈希和 manifest，不按文件名猜测远端身份。
5. WeKnora API 上传触发 Wiki/图谱更新尚未获得本项目实测证据，因此列为 PoC 阻断项。

## 完成标准

- 主文档不再把自建 Graph RAG 或细粒度 Wikilink 图谱描述为已选方案。
- 旧 ADR 保留且明确标记为被新 ADR 取代。
- PoC 的输入、动作、证据、失败条件和回滚方式可由另一位开发者直接执行。
