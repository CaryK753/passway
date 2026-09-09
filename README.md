# Passway

Passway 是一个完全免费、面向公众的全球移民政策与身份路径知识项目。人工维护的普通 Markdown 文章通过 GitHub 审核和版本化；WeKnora 将这些文章派生为可检索知识、Auto-Wiki、关联图谱和带引用问答；Next.js 统一呈现文章、AI Wiki、图谱与免登录问答。

## 核心原则

1. **来源优先**：政策结论必须能够回溯到官方原始来源。
2. **文章优先**：Markdown 首先服务于人类阅读，不为构图强制拆成大量实体文件。
3. **GitHub 是人工事实源**：生产内容来自指定 commit；WeKnora 和数据库内容均可重建。
4. **派生知识不冒充事实**：Auto-Wiki 和抽取图谱必须标明由 AI 生成，不反向覆盖文章。
5. **同步必须可验证**：API 成功之后还要验证解析、检索、Wiki、图谱和引用。
6. **公开仍需克制**：不制造成功率，不替代律师或主管机关，不隐藏信息时效性。

## 架构

```text
本地 Markdown → GitHub main → WeKnora 同步器
       │                         │
       └── Next.js 文章          ├── Auto-Wiki / 页面链接图
                                 ├── 实体关系图谱
                                 └── 检索 / 流式问答
```

## 文档

- [产品与范围](docs/product.md)
- [文章内容规范](docs/content-schema.md)
- [WeKnora 集成与同步契约](docs/weknora-integration.md)
- [开发规范](docs/development.md)
- [Web Wiki 体验](docs/web-wiki-experience.md)
- [路线图](docs/roadmap.md)
- [内容治理](docs/content-governance.md)
- [评测与发布门槛](docs/evaluation-and-release-gates.md)
- [风险登记册](docs/risk-register.md)
- [ADR-0004：GitHub 文章事实源与 WeKnora 派生知识](docs/adr/0004-github-content-and-weknora-derived-knowledge.md)
- [ADR-0005：全文 RSS 主摄取通道](docs/adr/0005-rss-primary-ingestion.md)

旧架构 ADR 被保留为历史记录，但已由 ADR-0004 取代。

## 工作区边界

| 位置 | 用途 |
| --- | --- |
| `/Users/cary/Library/Mobile Documents/iCloud~md~obsidian/Documents/Pathway` | 现有内容资产与迁移输入；不得存放代码、密钥和构建产物 |
| `/Users/cary/Desktop/Fun/passway` | Git 仓库、发布文章、应用代码、同步脚本、测试、项目文档和任务记录 |

生产不直接读取个人 iCloud 目录。现有 Vault 在迁移方案验证前不删除；经筛选的文章逐步迁入仓库 `content/`。

## 当前阶段

当前处于 WeKnora 架构转向与同步 PoC 阶段。第一个工程目标不是完整前端，而是用 3 篇文章验证新增、更新、移动、删除、失败恢复、检索、Auto-Wiki 和图谱读取闭环。
