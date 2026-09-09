# 正式域名与 RSS 激活

## 状态

进行中

## 目标

将 `https://run.emberflare.pro` 设为 Passway 的公开基址，验证 HTTPS 与 Feed 合同，并在内容满足接入条件时连接 WeKnora RSS 数据源。

## TODO

- [x] 确认服务器当前提交与运行环境。
- [x] 写入未跟踪的服务器 `.env` 并重建容器。
- [x] 验证 HTTPS 首页、健康检查、Feed Content-Type 与公开链接。
- [x] 确认 Feed 是否包含可发布文章。
- [x] 因 Feed 暂无已核验文章，明确阻断 WeKnora RSS 数据源创建。
- [x] 增加 RSS 自动发现、robots 与 sitemap。
- [ ] 更新部署状态并通过 CI。

## 安全边界

- WeKnora API Key 不进入 Git、容器环境或公开页面。
- 不用占位或未经核验文章制造非空 Feed。
- 不改变现有 WeKnora 知识库和数据源，除非目标明确为 Passway PoC。
