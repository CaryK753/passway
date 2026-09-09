# Web 基础阅读与公开 RSS

## 状态

进行中

## 目标

建立 Next.js App Router 基础应用，让已核验 Markdown 文章在 WeKnora 不可用时仍可阅读，并提供可供 WeKnora 订阅的公开 RSS 路由。

## TODO

- [x] 冻结首个 Web 增量范围。
- [x] 建立全局布局、导航和无内容状态。
- [x] 实现 `published + verified` 文章列表与深链阅读。
- [x] 使用安全 Markdown 渲染，不启用原始 HTML。
- [x] 显示核验日期、复核日期和官方来源。
- [x] 实现 `/feeds/passway.xml` 动态全文 Feed。
- [x] 实现 `/api/health` 健康检查。
- [x] 通过 GitHub Actions 的类型、测试和生产构建。
- [ ] 部署后以公开 URL 验证 Feed，并接入 WeKnora RSS 数据源。

## 非目标

- 本增量不实现问答、Wiki 图谱和多标签工作区。
- 不导入未经重新核验的 PathPass 内容。
- 不让浏览器接触 WeKnora 管理密钥。
