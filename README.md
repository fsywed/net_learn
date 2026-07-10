# NetLearn · 在线网络安全学习平台

一个面向网络安全学习的在线平台，提供课程学习与在线靶机（CTF 靶场）能力，支持用户在隔离容器中进行实战练习。

## 项目简介

- **课程学习**：结构化的安全知识课程内容。
- **在线靶机**：基于 Docker 的靶机实例按需调度，每位用户可申请独立靶机环境并限时回收。
- **用户体系**：注册登录、JWT 鉴权、角色（普通用户 / 管理员）。
- **管理后台**：课程与靶机管理。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 后端 | FastAPI · SQLAlchemy 2.0 (async) · asyncpg · Alembic · Pydantic Settings · python-jose · passlib · redis · docker SDK |
| 前端 | React · Vite · TypeScript · react-router-dom · axios · @uiw/react-md-preview |
| 数据库 | PostgreSQL 16 · Redis 7 |
| 基础设施 | Docker · Docker Compose · Nginx |

## 目录结构

```
workspace/
├── backend/          # FastAPI 后端
│   ├── app/          # 应用代码（main/config/database/api/models/schemas）
│   ├── alembic/      # 数据库迁移
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # React + Vite 前端
│   ├── src/
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

## 启动方式

1. 复制环境变量文件并按需修改：

   ```bash
   cp .env.example .env
   ```

2. 使用 Docker Compose 一键启动全部服务：

   ```bash
   docker compose up -d --build
   ```

3. 启动完成后访问：

   - 前端：http://localhost:8080
   - 后端 API：http://localhost:8000/api/health

## 说明

- 后端通过挂载 `/var/run/docker.sock` 调度靶机容器。
- 开发模式下后端源码已挂载至容器内，可配合 `--reload` 热更新。
- 数据库数据通过 `pgdata` 卷持久化。
