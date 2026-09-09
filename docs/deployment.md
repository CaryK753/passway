# Passway 部署

## 当前生产形态

Passway 使用 Next.js standalone 镜像和 Docker Compose。容器内部监听 3000，宿主机默认仅绑定 `127.0.0.1:3100`，由 Nginx、宝塔或其他入口层终止 TLS 并反向代理。

## 环境变量

- `PASSWAY_PORT`：宿主机回环端口，默认 `3100`。
- `PASSWAY_PUBLIC_URL`：正式外部基址，例如 `https://passway.example.org`。域名接入前可以留空；绑定域名后必须设置，以确保 RSS 中的自链接和文章链接稳定。

WeKnora API Key 不属于 Web 容器运行配置，不得写入 Compose、镜像或浏览器环境变量。

## 部署命令

```bash
git pull --ff-only
docker compose config
docker compose up -d --build
docker compose ps
curl --fail http://127.0.0.1:3100/api/health
```

## 域名接入

将 HTTPS 站点反向代理到 `http://127.0.0.1:3100`，然后在部署目录创建未跟踪的 `.env`：

```dotenv
PASSWAY_PORT=3100
PASSWAY_PUBLIC_URL=https://你的域名
```

重建容器后验证首页、健康检查和 `/feeds/passway.xml`。最后再将正式 Feed URL 添加到 WeKnora RSS 数据源。

当前部署使用 `https://run.emberflare.pro`，反向代理目标为 `http://127.0.0.1:3100`。WeKnora RSS 数据源只能在 Feed 至少包含一篇 `published + verified` 文章后创建，空 Feed 不作为接入完成证据。

## 回滚

切换到已验证的提交并重新构建。不要删除 `content/` 或改写 Git 历史；文章版本必须保持可审计。
