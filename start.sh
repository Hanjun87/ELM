#!/bin/bash
# ELM 平台启动脚本
# 用法: ./start.sh [backend|customer|merchant|rider|manager|all]

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/src/elm"

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_step()  { echo -e "${BLUE}[STEP]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查依赖
check_deps() {
    command -v uv >/dev/null 2>&1 || { log_error "uv 未安装，请先安装: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
    command -v node >/dev/null 2>&1 || { log_error "Node.js 未安装"; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm 未安装"; exit 1; }
}

# 启动后端
start_backend() {
    log_step "启动 Django 后端..."
    cd "$BACKEND_DIR"

    # 安装依赖
    log_info "同步 Python 依赖..."
    uv sync --quiet

    # 迁移
    log_info "执行数据库迁移..."
    uv run python manage.py migrate --run-syncdb 2>&1 | grep -E "OK|Applying|No migrations" || true

    # 检查是否需要初始化数据
    MERCHANT_COUNT=$(uv run python manage.py shell -c "from merchants.models import Merchant; print(Merchant.objects.count())" 2>/dev/null || echo "0")
    if [ "$MERCHANT_COUNT" = "0" ]; then
        log_info "初始化测试数据..."
        uv run python manage.py init_data 2>&1 | grep -E "✓|创建|ERROR" || true
    else
        log_info "数据库已有数据，跳过初始化"
    fi

    log_info "后端启动于 http://localhost:8000"
    log_info "测试账号: 客户 13800001000/customer · 商家 13800002000/merchant"
    log_info "         骑手 13800003000/rider   · 管理员 13800004000/manager"
    uv run python manage.py runserver
}

# 启动前端
start_frontend() {
    local APP=$1
    local DIR="$ROOT_DIR/fronted/$APP"

    if [ ! -d "$DIR" ]; then
        log_error "目录不存在: $DIR"
        exit 1
    fi

    log_step "启动 $APP 前端..."
    cd "$DIR"

    if [ ! -d "node_modules" ]; then
        log_info "安装 npm 依赖..."
        npm install --silent
    fi

    log_info "$APP 前端启动于 http://localhost:3000"
    DISABLE_HMR=false npm run dev
}

# 主逻辑
check_deps

TARGET="${1:-menu}"

case "$TARGET" in
    backend)
        start_backend
        ;;
    customer)
        start_frontend "Customer"
        ;;
    merchant)
        start_frontend "Merchant"
        ;;
    rider)
        start_frontend "Rider"
        ;;
    manager)
        start_frontend "Manager"
        ;;
    all)
        log_warn "同时启动所有服务，前端端口均为 3000（会冲突），建议分窗口启动"
        start_backend &
        BACKEND_PID=$!
        log_info "等待后端就绪..."
        sleep 3
        log_info "如需启动前端，请在新终端执行: ./start.sh customer"
        wait $BACKEND_PID
        ;;
    menu|*)
        echo ""
        echo "  ELM 外卖平台启动脚本"
        echo "  ─────────────────────"
        echo "  用法: ./start.sh <目标>"
        echo ""
        echo "  目标选项:"
        echo "    backend   启动 Django 后端 (http://localhost:8000)"
        echo "    customer  启动客户端前端   (http://localhost:3000)"
        echo "    merchant  启动商家端前端   (http://localhost:3000)"
        echo "    rider     启动骑手端前端   (http://localhost:3000)"
        echo "    manager   启动管理端前端   (http://localhost:3000)"
        echo ""
        echo "  推荐启动顺序:"
        echo "    终端1: ./start.sh backend"
        echo "    终端2: ./start.sh customer  (或 merchant/rider/manager)"
        echo ""
        echo "  测试账号 (init_data 种子):"
        echo "    客户:   13800001000 / customer"
        echo "    商家:   13800002000 / merchant"
        echo "    骑手:   13800003000 / rider"
        echo "    管理员: 13800004000 / manager"
        echo ""

        echo -n "请选择要启动的组件 [backend/customer/merchant/rider/manager]: "
        read -r CHOICE
        case "$CHOICE" in
            backend|customer|merchant|rider|manager)
                "$0" "$CHOICE"
                ;;
            *)
                log_error "无效选择: $CHOICE"
                exit 1
                ;;
        esac
        ;;
esac
