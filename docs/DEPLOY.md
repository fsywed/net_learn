# NetLearn 部署与验收文档

在线网络安全学习平台的一键部署说明与端到端验收清单。

## 一、环境要求

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Linux（推荐 Ubuntu 20.04+ / CentOS 8+） |
| Docker | 20.10 及以上 |
| Docker Compose | v2（`docker compose` 子命令） |
| 内存 | ≥ 2GB |
| 可用端口 | 8080（前端）、8000（后端 API）、5432（DB）、6379（Redis）、30000-30100（靶机映射端口段） |

> 后端通过挂载 `/var/run/docker.sock` 调度靶机容器，因此宿主机必须运行 Docker 守护进程，且执行 `docker compose` 的用户需具有 docker socket 访问权限（通常归属 `docker` 组）。

## 二、启动步骤

```bash
# 1. 进入项目根目录
cd /workspace

# 2. 复制环境变量示例文件并按需修改（务必修改 JWT_SECRET 与管理员密码）
cp .env.example .env

# 3. 构建示例靶机镜像（首次部署必须，否则靶机无法启动）
docker build -t netlearn/sample-nginx-flag:latest targets/sample-nginx-flag

# 4. 构建并启动全部服务（db / redis / backend / frontend）
docker compose up -d --build

# 5. 查看服务状态，等待 backend 与 db 健康检查通过
docker compose ps
```

启动完成后：

- 前端访问：`http://<主机IP>:8080`
- 后端 API 文档：`http://<主机IP>:8000/docs`
- 后端在首次启动时会自动建表、引导管理员账号并幂等写入演示数据（示例课程 + 示例靶机模板）。

## 三、默认管理员账号

| 字段 | 值 |
| --- | --- |
| 邮箱 | `admin@netlearn.local` |
| 密码 | `admin123456` |

> 生产环境请务必在 `.env` 中修改 `ADMIN_BOOTSTRAP_PASSWORD` 与 `JWT_SECRET` 后再启动。

## 四、端到端验收清单

以下步骤从前端 UI 与后端 API 两个维度验收，全部通过即视为部署成功。

### 1. 注册学员账号
- UI：访问 `http://<主机IP>:8080`，进入注册页，填写邮箱与密码完成注册。
- API：`POST /api/auth/register`，请求体 `{"email":"student@test.com","password":"123456"}`，期望返回 `access_token`。

### 2. 登录
- UI：使用注册邮箱登录，进入主页。
- API：`POST /api/auth/login`，期望返回 `access_token`。

### 3. 浏览示例课程
- UI：进入「课程」页，应能看到「Web 安全入门」课程，点开后含两章节（Markdown 正文）。
- API：`GET /api/courses/`（携带 Bearer Token），期望列表中含 `title="Web 安全入门"` 且 `chapters` 长度为 2。

### 4. 启动示例靶机
- UI：进入「靶机」页，应能看到「示例：Nginx Flag 查找」（难度 easy），点击启动。
- API：`POST /api/instances/{template_id}/start`，期望返回 `access_port`（30000-30100 区间的主机端口）与 `access_host`。

### 5. 访问靶机并找到 Flag
- 浏览器访问 `http://<主机IP>:<access_port>`，看到 Nginx 欢迎页。
- 按 `Ctrl+U` 查看页面源代码，在 HTML 注释中找到 Flag：`flag{w3lc0me_t0_n3t_l3arn}`。

### 6. 提交 Flag
- UI：在靶机详情页输入 Flag 并提交，期望提示「Flag 正确，通关成功」。
- API：`POST /api/submissions/{template_id}/submit`，请求体 `{"flag":"flag{w3lc0me_t0_n3t_l3arn}"}`，期望 `is_correct=true`、`score_awarded=10`。

### 7. 查看积分
- UI：进入「个人中心」，积分应为 `10`，通关记录含「示例：Nginx Flag 查找」。
- API：`GET /api/profile/`，期望 `score=10` 且 `solved_count=1`；`GET /api/auth/me` 同样返回 `score=10`。

## 五、常见问题排查

### 1. 端口被占用
- 现象：`docker compose up` 报 `bind: address already in use`。
- 排查：`sudo lsof -i :8080`（或 8000/5432/6379）定位占用进程。
- 处理：停掉占用进程，或在 `docker-compose.yml` 调整宿主机映射端口。

### 2. docker.sock 权限不足
- 现象：启动靶机时后端报 `Permission denied: /var/run/docker.sock` 或 `connect: permission denied`。
- 排查：`ls -l /var/run/docker.sock`，确认属主组与 backend 容器内进程权限。
- 处理：将宿主机执行用户加入 `docker` 组（`sudo usermod -aG docker $USER` 后重新登录），或确认 compose 中 backend 已挂载 `/var/run/docker.sock:/var/run/docker.sock`。

### 3. 示例靶机镜像缺失
- 现象：启动靶机返回 500，日志含 `No such image: netlearn/sample-nginx-flag:latest`。
- 处理：执行 `docker build -t netlearn/sample-nginx-flag:latest targets/sample-nginx-flag` 后重试。

### 4. 靶机端口段耗尽或被占用
- 现象：启动靶机失败，提示无可用端口。
- 排查：确认 `HOST_PORT_RANGE_START`~`HOST_PORT_RANGE_END`（默认 30000-30100）未被宿主机其他进程占用，且未被防火墙拦截。
- 处理：在 `.env` 调整端口段并 `docker compose up -d` 重启 backend。

### 5. 数据库连接失败
- 现象：backend 日志报 `could not connect to server` 或 `authentication failed`。
- 排查：`docker compose ps` 确认 db 为 healthy；检查 `.env` 中 `DATABASE_URL` 与 db 服务的 `POSTGRES_USER/PASSWORD/DB` 是否一致。
- 处理：修正 `.env` 后 `docker compose up -d --force-recreate backend`。

### 6. 演示数据未生成
- 现象：课程或靶机列表为空。
- 排查：查看 backend 启动日志，确认 lifespan 中 `seed_demo_data` 执行无异常；种子为幂等插入，按名称查重，重复启动不会重复写入。
- 处理：如数据库被手动清空，重启 backend 即可重新写入。

### 7. 前端无法访问 API
- 现象：前端页面白屏或接口报 502/504。
- 排查：`curl http://<主机IP>:8080/api/health` 是否经 nginx 反代到 backend；确认 frontend 的 `nginx.conf` 中 `proxy_pass http://backend:8000;` 且 backend 已启动。
- 处理：`docker compose restart frontend backend`。
