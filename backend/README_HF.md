---
title: NetLearn Backend
emoji: 🎯
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# NetLearn 后端 — Hugging Face Spaces 部署

网络安全学习平台的动态靶机后端，部署在 HF Spaces 上（永久免费）。

## 运行模式

HF Spaces 不支持 `--privileged`，无法 Docker-in-Docker，因此后端以**模拟模式**运行：

| 模式 | 说明 |
|---|---|
| Docker 模式 | 在有 Docker daemon 的服务器上，启动真实靶机容器 |
| **模拟模式**（HF Spaces 使用） | 用内嵌 aiohttp HTTP 服务模拟靶机页面，Flag 藏在 HTML 注释中 |

模拟模式下用户体验完整：启动实例 → 访问靶机页面 → 查看源码找 Flag → 提交验证。

## 部署步骤

1. 在 Hugging Face 创建 Space：https://huggingface.co/new-space
2. SDK 选 **Docker**
3. 把 `backend/` 目录下所有文件上传到 Space 仓库根目录
4. 把 `Dockerfile.hf` 重命名为 `Dockerfile`
5. 在 Space Settings → Variables 中设置环境变量：

   | 变量 | 值 | 说明 |
   |---|---|---|
   | `SIMULATION_MODE` | `auto` | 自动检测 Docker，不可用则模拟 |
   | `CORS_ORIGINS` | `https://fsywed.github.io` | 允许的前端域名 |
   | `PUBLIC_BASE_URL` | `https://你的用户名-netlearn-backend.hf.space` | 对外 URL |

6. Space 自动构建启动，访问 `https://你的用户名-netlearn-backend.hf.space/api/health` 验证

## API 端点

- `GET  /api/health` — 健康检查
- `GET  /api/targets` — 列出靶机模板
- `POST /api/instances/spawn` — 启动靶机实例
- `GET  /api/instances` — 列出当前 IP 的实例
- `DELETE /api/instances/{id}` — 停止实例
- `POST /api/submissions` — 提交 Flag
- `ALL  /api/proxy/{id}/{token}/{path}` — 反向代理到靶机
