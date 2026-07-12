#!/bin/bash
# NetLearn 本地一键启动脚本
# 
# 使用方法：
#   1. 安装 Docker Desktop：https://www.docker.com/products/docker-desktop
#   2. 克隆代码：git clone https://github.com/fsywed/net_learn.git
#   3. 进入目录：cd net_learn
#   4. 运行脚本：bash scripts/start_local.sh
#
# 脚本会：
#   - 安装后端依赖
#   - 构建前端
#   - 启动后端（模拟模式）
#   - 启动前端开发服务器
#
# 访问：
#   - 前端：http://localhost:5173
#   - 后端 API：http://localhost:8000/api/health
#
# 停止：Ctrl+C 两次

set -e

echo "=========================================="
echo "  NetLearn 本地启动脚本"
echo "=========================================="

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 Python
if ! command -v python3 &> /dev/null; then
    error "未找到 python3，请安装 Python 3.10+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
info "Python 版本: $PYTHON_VERSION"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    error "未找到 Node.js，请安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node --version)
info "Node.js 版本: $NODE_VERSION"

# 检查 Docker（可选）
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        info "Docker 已就绪"
        export USE_DOCKER=true
    else
        warn "Docker 未运行，将使用模拟模式"
        export USE_DOCKER=false
    fi
else
    warn "未安装 Docker，将使用模拟模式"
    export USE_DOCKER=false
fi

# 创建虚拟环境
info "创建 Python 虚拟环境..."
cd backend
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate

# 安装依赖
info "安装后端依赖..."
pip install --only-binary=:all: -q -r requirements.txt

# 启动后端
info "启动后端服务..."
if [ "$USE_DOCKER" = "true" ]; then
    # Docker 模式：需要先构建靶机镜像
    warn "Docker 模式：首次启动需要拉取镜像，可能较慢"
    SIMULATION_MODE=off \
    DATABASE_URL="sqlite+aiosqlite:///./netlearn.db" \
    CORS_ORIGINS='["http://localhost:5173"]' \
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/netlearn-backend.log 2>&1 &
else
    # 模拟模式：不需要 Docker
    SIMULATION_MODE=auto \
    DATABASE_URL="sqlite+aiosqlite:///./netlearn.db" \
    CORS_ORIGINS='["http://localhost:5173"]' \
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/netlearn-backend.log 2>&1 &
fi

BACKEND_PID=$!
info "后端 PID: $BACKEND_PID"

# 等待后端启动
info "等待后端启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:8000/api/health | grep -q "ok"; then
    info "后端启动成功: http://localhost:8000/api/health"
else
    error "后端启动失败，请检查 /tmp/netlearn-backend.log"
    kill $BACKEND_PID 2>/dev/null || true
    cat /tmp/netlearn-backend.log
    exit 1
fi

# 启动前端
info "启动前端开发服务器..."
cd ../frontend

# 安装前端依赖（首次）
if [ ! -d "node_modules" ]; then
    info "安装前端依赖..."
    npm install
fi

# 修改 .env 指向本地后端
echo "VITE_API_BASE=http://localhost:8000" > .env.local

# 启动前端
npm run dev &
FRONTEND_PID=$!
info "前端 PID: $FRONTEND_PID"

# 显示信息
echo ""
echo "=========================================="
echo "  服务已启动！"
echo "=========================================="
echo "  前端地址: ${GREEN}http://localhost:5173${NC}"
echo "  后端 API: ${GREEN}http://localhost:8000${NC}"
echo "  健康检查: ${GREEN}http://localhost:8000/api/health${NC}"
echo "  靶机列表: ${GREEN}http://localhost:8000/api/targets${NC}"
echo ""
echo "  模式: ${YELLOW}$(if [ "$USE_DOCKER" = "true" ]; then echo "Docker 真实容器模式"; else echo "模拟模式（内嵌 HTTP 服务）"; fi)${NC}"
echo ""
echo "  停止方式: Ctrl+C 两次"
echo "=========================================="

# 等待用户中断
wait $FRONTEND_PID $BACKEND_PID
