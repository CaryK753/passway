# Spark 首次部署

## 状态

进行中

## 目标

将 Passway 以可复现、可回滚的 Docker Compose 方式部署到 `spark`，为后续域名绑定保留回环代理端口。

## TODO

- [x] 只读盘点服务器服务、监听端口、Docker 与磁盘空间。
- [x] 选定未占用的 `127.0.0.1:3100`。
- [x] 增加 Next.js standalone 容器构建。
- [x] 增加 Compose、健康检查和部署文档。
- [ ] GitHub Actions 验证部署配置所在提交。
- [ ] 在 `/opt/passway` 拉取仓库并构建容器。
- [ ] 验证容器健康、首页、RSS 与端口绑定。

## 安全边界

- 不改动 WeKnora Compose、网络、卷和端口。
- 不开放新的公网监听或修改防火墙。
- 不把 WeKnora API Key 写入项目或服务器部署环境。
