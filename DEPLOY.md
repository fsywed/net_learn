# 部署指南

## 整体架构

```
┌──────────────────┐     HTTPS      ┌────────────────────┐    unix socket    ┌──────────────────┐
│  GitHub Pages    │  ──────────▶   │   Fly.io / 自建    │   ────────────▶   │  Docker daemon   │
│  React 前端      │                 │   FastAPI 后端     │                   │  (靶机容器)      │
│  fsywed.github.io│                 │   netlearn-backend │                   │  30000-40000     │
│  /net_learn      │                 │                    │                   │                  │
└──────────────────┘                 └────────────────────┘                   └──────────────────┘
```

前端在 GitHub Pages（纯静态）。后端是 FastAPI，运行在能访问 Docker daemon 的 Linux 机器上，
后端通过 Python docker SDK（unix socket）创建/销毁容器。
容器端口 30000-40000 随机分配，**不直接对外暴露**，全部走 `/api/proxy/<id>/<token>/<path>` 反向代理。

## 三种部署方案（按推荐顺序）

| 方案 | 费用 | 难度 | Docker 支持 | 备注 |
|---|---|---|---|---|
| **A. Oracle Cloud Always Free** | **完全免费（需信用卡验证）** | 中 | ✅ 完整 | 4 OCPU + 24GB ARM 永久免费，最适合长期跑 |
| B. Fly.io 付费 1GB machine | ~$5/月 | 低 | ✅ 需挂 docker.sock | 文档齐全、CLI 友好 |
| C. 自建 Linux 服务器 | 自定 | 低 | ✅ 直接 | 任何 Ubuntu + Docker 即可 |

> **不推荐**：Fly.io free tier（256MB 内存）跑不了 Docker 容器；Render.com free 无 Docker 支持。

---

## 方案 A：Oracle Cloud Always Free（推荐）

免费 ARM 4核 24GB 内存实例，永久免费。

### 1. 创建实例
- 注册 / 登录 Oracle Cloud
- 创建 Compute Instance：
  - Shape: `VM.Standard.A1.Flex`（4 OCPU / 24 GB）
  - Image: Ubuntu 22.04 (Canonical) aarch64
  - 允许 22 端口入站
- 记下公网 IP

### 2. 装 Docker
```bash
ssh ubuntu@<公网IP>

# Ubuntu 22.04 一键装 docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

### 3. 部署后端

#### 方式 A1：直接跑（最快）
```bash
# 装 Python 3.12
sudo apt-get update && sudo apt-get install -y python3.12 python3.12-venv
python3.12 -m venv .venv
source .venv/bin/activate
pip install --only-binary=:all: -r backend/requirements.txt

# 跑起来
cd backend
DATABASE_URL="sqlite+aiosqlite:///./netlearn.db" \
DOCKER_HOST="unix:///var/run/docker.sock" \
CORS_ORIGINS='["https://fsywed.github.io"]' \
TARGET_PORT_RANGE_START=30000 \
TARGET_PORT_RANGE_END=40000 \
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/netlearn.log 2>&1 &

# 验活
curl http://127.0.0.1:8000/api/health
```

#### 方式 A2：Docker 化
```bash
cd backend
docker build -t netlearn-backend:latest .
docker run -d --name netlearn-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /opt/netlearn/data:/data \
  -e DATABASE_URL="sqlite+aiosqlite:////data/netlearn.db" \
  netlearn-backend:latest
```

### 4. 防火墙放行 8000 端口
Oracle 默认安全列表需要加规则：
- Networking → Virtual Cloud Networks → 选 VCN → Security Lists → Default
- Add Ingress Rule：Source 0.0.0.0/0, Protocol TCP, Port 8000

### 5. HTTPS（强烈建议）
用 Caddy / Nginx 反代 + Let's Encrypt 证书：
```bash
sudo apt install -y caddy
echo "netlearn.example.com {
    reverse_proxy 127.0.0.1:8000
}" | sudo tee /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

---

## 方案 B：Fly.io 付费 1GB machine

### 1. 装 flyctl 并登录
```bash
curl -L https://fly.io/install.sh | sh
fly auth signup   # 或 fly auth login
```

### 2. 创建应用
```bash
cd backend
fly launch --no-deploy --copy-config --name netlearn-backend
```

### 3. 创建 volume（持久化 SQLite）
```bash
fly volumes create netlearn_data --size 1
```

### 4. 升级到 1GB 内存（默认 256MB 跑不了）
```bash
fly scale memory 1024
```

### 5. 首次部署
```bash
fly deploy
```

### 6. 挂载 docker.sock
Fly.io 不允许在 fly.toml 直接挂宿主 docker.sock，需要用 `fly machine update`：

```bash
# 找到 machine id
fly machines list

# 挂 docker.sock
fly machine update <machine-id> \
  --volume docker_sock:/var/run/docker.sock \
  --memory 1024

# 重启
fly machine restart <machine-id>
```

> 注：`docker_sock` 是 Fly.io 提供的特殊卷源，自动指向宿主 docker daemon。

### 7. 验活
```bash
curl https://netlearn-backend.fly.dev/api/health
curl https://netlearn-backend.fly.dev/api/targets
```

---

## 方案 C：自建服务器

任何装了 Docker 的 Linux 都行，本地开发 / 树莓派 / 旧笔记本均可。

```bash
git clone https://github.com/fsywed/net_learn.git
cd net_learn/backend
docker build -t netlearn-backend:latest .

docker run -d --name netlearn-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ./data:/data \
  netlearn-backend:latest
```

---

## 准备示例靶机镜像

后端 templates.py 默认用 `netlearn-nginx-flag:latest`（template id=1）。
其他三个（SSH / SQL 注入 / XSS）直接拉 Docker Hub 公共镜像。

### 1. Nginx Flag 隐藏（template id=1）

```bash
cd targets/nginx-flag
docker build -t netlearn-nginx-flag:latest .
```

启动时会读环境变量 `$FLAG` 注入到 `index.html` HTML 注释。

### 2. SSH 弱口令（template id=2）
直接用 `rastasheep/ubuntu-sshd:18.04` 公共镜像。
- 用户名/密码：`root` / `root`（拉取后 `docker inspect` 看 README）

### 3. SQL 注入（template id=3）
直接用 `vulfocus/sqli-labs:latest` 公共镜像。
- 首次访问会跳到 setup 页面，跑一下 `Setup/reset Database for labs`

### 4. XSS 反射型（template id=4）
直接用 `vulnerables/web-dvwa:latest` 公共镜像。
- 访问 `/setup.php` 重置数据库，默认账号 `admin` / `password`

---

## 前端对接

前端在 `frontend/src/api/api.ts` 里调后端：
```ts
const API_BASE = import.meta.env.VITE_API_BASE || 'https://netlearn-backend.fly.dev'
```

`VITE_API_BASE` 在 `frontend/.env.production` 写：
```
VITE_API_BASE=https://你的后端域名
```

前端 axios 拦截器检测 4xx/5xx 时显示警告 banner（已有逻辑）。

---

## 监控

- `GET /api/health` → `{status: ok, service: netlearn-backend}`
- `GET /api/targets` → 模板列表
- `GET /api/instances` → 当前 IP 的运行实例
- `DELETE /api/instances/{id}` → 手动销毁

---

## 常见问题

**Q: 启动容器失败 "permission denied /var/run/docker.sock"**
A: 后端进程的用户需要 docker 组权限：
```bash
sudo usermod -aG docker $USER
# 或在 Dockerfile 用 USER 切到非 root 时用 --group-add
```

**Q: spawn 容器很慢**
A: 第一次拉镜像（nginx:1.27-alpine 几十 MB、dvwa 几百 MB）会慢，后续命中本地缓存秒起。
建议预拉一遍：
```bash
docker pull nginx:1.27-alpine
docker pull rastasheep/ubuntu-sshd:18.04
docker pull vulfocus/sqli-labs:latest
docker pull vulnerables/web-dvwa:latest
docker pull netlearn-nginx-flag:latest
```

**Q: 端口 30000-40000 需要对外开吗**
A: **不需要**。所有访问走 `/api/proxy/<id>/<token>/<path>` 反向代理。

**Q: Flag 注入到容器哪了**
A: 两种方式：
1. 环境变量 `FLAG`（在容器内 `echo $FLAG`）
2. Docker label `netlearn.flag`（后端 logs 可见）
靶机启动脚本（如 entrypoint.sh）应读 `$FLAG` 写入自己的页面/数据库。
