# RSS 内容发布与 WeKnora 数据源

## 状态

进行中

## 目标

将 Passway 的生产同步主通道从逐篇 API 推送改为全文 RSS/Atom Feed；保留 API Client 作为健康检查、紧急撤回和修复通道。

## TODO

- [x] 核对 WeKnora RSS Connector 的增量同步能力。
- [x] 冻结 RSS 与 API 双通道的职责。
- [x] 补充文章 `updated_at` 合同。
- [x] 实现确定性全文 RSS 生成器。
- [x] 实现 XML 转义、CDATA、稳定 GUID 和原子输出。
- [x] 编写 Feed 合同测试。
- [x] 更新架构、同步契约和路线图。
- [ ] 获得公开 Feed URL 后连接 `Passway PoC` 数据源。
- [ ] 实测新增、更新、撤回和同步日志。

## 安全边界

- Feed 只包含 `published + verified` 文章。
- `guid` 使用稳定 `content_id`，不使用路径或标题。
- 第一阶段不启用自动删除。
- 不向 WeKnora 配置 localhost、iCloud 路径或尚未存在的 URL。
