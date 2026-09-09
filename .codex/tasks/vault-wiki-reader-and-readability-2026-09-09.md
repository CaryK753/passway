# Vault Wiki Reader 与可读性任务

## 目标

冻结 Web 对指定 Obsidian Vault 的只读渲染契约，并为当前 Vault 增加人类可读的地图页和路径目录，保持文件级链接可被 Obsidian 与 Graph RAG 共用。

## 范围

- In：Vault Reader 架构、主题、数据 UI、跳转、多标签/分屏、图谱浏览器、MOC、路径目录与链接可读性。
- Out：Next.js 实现、数据库迁移、搜索索引、在线编辑器和内容核验升级。

## TODO

- [x] 记录 Web 读取 Vault 的架构决策。
- [x] 定义 Wiki 阅读器的内容、导航、主题、数据 UI 与图谱交互契约。
- [x] 建立 Vault 地图页与法域路径目录。
- [x] 将地图页和路径目录加入 Vault 入口。
- [x] 校验新 MOC 中的链接、路径数量和草稿状态（50 个 MOC、252 条路径、0 个断链）。
