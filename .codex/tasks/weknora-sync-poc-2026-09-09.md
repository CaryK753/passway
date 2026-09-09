# WeKnora 同步 PoC

## 状态

进行中

## 目标

实现不依赖远端凭据的同步核心：文章校验、稳定哈希、manifest 解析和 dry-run 差异计划，为后续接入隔离 WeKnora 知识库奠定可测试基础。

## TODO

- [x] 核对 WeKnora 手工 Markdown 创建与更新接口。
- [x] 初始化 TypeScript/ESM 工程骨架；本地 Git 初始化因终端写权限受限待执行。
- [x] 实现文章加载和最小 schema 校验。
- [x] 实现 manifest 和 create/update/move/delete 计划。
- [x] 为关键差异场景编写测试。
- [x] 实现 WeKnora 手工 Markdown Client、解析轮询和删除安全阈值。
- [x] 为 HTTP 路由、认证头、错误响应和解析失败编写测试。
- [ ] 安装依赖并运行类型检查和测试。
- [x] 实现显式 `--apply` 的远端 sync 执行骨架和原子 manifest 写入。
- [x] 创建独立 `Passway PoC` 知识库，不触碰现有知识。
- [x] 上传 3 篇无真实政策断言的 Markdown 样本。
- [x] 验证知识状态、混合检索、Wiki Index 和 Wiki Graph 响应。
- [x] 将实例真实搜索与 Wiki 响应合同加入 WeKnora Client。
- [x] 确认 `finalizing` 是 Wiki debounce/批处理阶段，本次最终正常完成。
- [ ] 实测更新、移动、删除和幂等恢复。
- [ ] 完成远端 `verify` 命令并运行类型检查和测试。

## 边界

- 本任务不会调用现有 WeKnora 部署。
- 不迁移或删除 iCloud Pathway Vault。
- 删除仅生成计划，不执行远端删除。

## 当前验证状态

- 已完成静态文件与模块边界检查。
- `pnpm install` 与 `git init` 被当前终端策略拒绝，因为项目目录不在可写执行根内。
- 因依赖未安装，类型检查和 Vitest 尚未运行，不能视为通过。
- 实例基础入库、检索、Auto-Wiki 与页面链接图均已通过，详见 PoC 报告。
