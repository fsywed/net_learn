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

## 四种部署方案（按推荐顺序）

| 方案 | 费用 | 难度 | Docker 支持 | 备注 |
|---|---|---|---|---|
| **A. Hugging Face Spaces** | **完全免费（无需信用卡）** | **低** | ❌ 模拟模式 | 零配置，邮箱注册即可，48h 休眠 |
| **B. Oracle Cloud Always Free** | **完全免费（需信用卡验证）** | 中 | ✅ 完整 | 4 OCPU + 24GB ARM 永久免费，最适合长期跑 |
| C. Fly.io 付费 1GB machine | ~$5/月 | 低 | ✅ 需挂 docker.sock | 文档齐全、CLI 友好 |
| D. 自建 Linux 服务器 | 自定 | 低 | ✅ 直接 | 任何 Ubuntu + Docker 即可 |

> **方案 A（HF Spaces）** 是最简单的免费方案：不需要信用卡、不需要安装 Docker，邮箱注册即可。
> 后端以"模拟模式"运行——用内嵌 HTTP 服务模拟靶机页面（Flag 藏在 HTML 注释中），用户体验完整。
> 如果需要真实 Docker 容器靶机，选方案 B/C/D。

---

## 方案 A：Hugging Face Spaces（最简单，推荐先试）

完全免费，邮箱注册即可，无需信用卡。后端以模拟模式运行。

### 1. 注册 Hugging Face 账号
- 访问 https://huggingface.co/join
- 邮箱注册即可（支持 Google / GitHub 登录）

### 2. 创建 Space
- 访问 https://huggingface.co/new-space
- Space name: `netlearn-backend`
- License: MIT
- SDK: **Docker**
- Space hardware: **CPU basic (Free)**

### 3. 上传代码
```bash
# 克隆你的 HF Space 仓库
git clone https://huggingface.co/spaces/你的用户名/netlearn-backend
cd netlearn-backend

# 从项目拷贝后端代码
cp -r /path/to/net_learn/backend/app .
cp /path/to/net_learn/backend/requirements.txt .
cp /path/to/net_learn/backend/Dockerfile.hf ./Dockerfile

# 创建 README.md（HF Spaces 配置文件）
cat > README.md << 'EOF'
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
EOF

# 提交推送
git add -A
git commit -m "deploy netlearn backend"
git push
```

### 4. 配置环境变量
在 Space 页面 → Settings → Variables and secrets 中添加：
- `SIMULATION_MODE` = `auto`
- `CORS_ORIGINS` = `https://fsywed.github.io`
- `PUBLIC_BASE_URL` = `https://你的用户名-netlearn-backend.hf.space`

### 5. 验活
等待构建完成后（约 2-3 分钟）：
```bash
curl https://你的用户名-netlearn-backend.hf.space/api/health
# {"status":"ok","service":"netlearn-backend"}

curl https://你的用户名-netlearn-backend.hf.space/api/targets
# 返回 4 个靶机模板
```

### 6. 更新前端
编辑 `frontend/.env.production`：
```
VITE_API_BASE=https://你的用户名-netlearn-backend.hf.space
```
重新 build + push 到 GitHub Pages。

### HF Spaces 限制
- 48 小时不活动会自动休眠，再次访问时冷启动约 30 秒
- 模拟模式下靶机是内嵌 HTTP 服务（不是真实 Docker 容器）
- CPU basic 免费 2 vCPU / 16GB 内存（足够跑模拟靶机）
- 不支持 `--privileged`（无法 Docker-in-Docker）

---

## 方案 B：Oracle Cloud Always Free

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

## 方案 C：Fly.io 付费 1GB machine

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

## 方案 D：自建服务器

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
