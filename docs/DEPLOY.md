# ELM 部署文档

## 环境要求

| 工具 | 开发环境 | 生产环境 |
|------|---------|---------|
| Python | 3.13+ | 3.13+ |
| Node.js | 18+ | 18+（构建时需要） |
| uv | 最新 | 最新 |
| 数据库 | SQLite（内置） | PostgreSQL 14+ |
| Redis | 可选 | 必须（Channels 多进程） |
| Web Server | Django runserver | Nginx + Daphne |

---

## 一、开发环境部署

### 1.1 克隆仓库

```bash
git clone <repo-url>
cd ELM
```

### 1.2 后端初始化

```bash
cd src/elm

# 安装 Python 依赖
uv sync

# 创建数据库表
uv run python manage.py migrate

# 初始化测试数据（角色 + 4个测试账号 + 示例商品/订单）
uv run python manage.py init_data

# 追加更多演示数据（可选）
uv run python manage.py add_more_data

# 启动开发服务器（HTTP，不含 WebSocket）
uv run python manage.py runserver
```

### 1.3 前端初始化（选一个角色）

```bash
# 客户端
cd fronted/Customer && npm install && npm run dev

# 商家端
cd fronted/Merchant && npm install && npm run dev

# 骑手端
cd fronted/Rider && npm install && npm run dev

# 管理端
cd fronted/Manager && npm install && npm run dev
```

> 所有前端默认均运行在 `http://localhost:3000`，不可同时开多个。

### 1.4 使用启动脚本

```bash
# 项目根目录
chmod +x start.sh
./start.sh          # 交互式选择启动哪个前端
```

---

## 二、生产环境部署

### 2.1 环境变量配置

复制示例文件并编辑：

```bash
cp .env.example .env
```

必须设置的变量：

```bash
# .env
SECRET_KEY=<使用 python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 生成>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# CORS（设为前端域名）
CORS_ALLOW_ALL=False
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# PostgreSQL
DB_NAME=elm_db
DB_USER=elm_user
DB_PASSWORD=<强密码>
DB_HOST=localhost
DB_PORT=5432

# Redis（Channels 使用）
REDIS_URL=redis://localhost:6379/0
```

### 2.2 PostgreSQL 配置

```bash
# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE elm_db;
CREATE USER elm_user WITH PASSWORD '<强密码>';
GRANT ALL PRIVILEGES ON DATABASE elm_db TO elm_user;
\q

# 安装 psycopg2 驱动
cd src/elm && uv add psycopg2-binary
```

### 2.3 后端生产部署

```bash
cd src/elm

# 切换生产配置
export DJANGO_SETTINGS_MODULE=config.settings_prod

# 安装依赖
uv sync

# 迁移数据库
uv run python manage.py migrate

# 初始化数据
uv run python manage.py init_data

# 收集静态文件
uv run python manage.py collectstatic --noinput

# 安全检查
uv run python manage.py check --deploy

# 使用 Daphne 启动（支持 WebSocket）
uv run daphne config.asgi:application --bind 0.0.0.0 --port 8000
```

或用 Gunicorn（仅 HTTP，无 WebSocket）：

```bash
uv run gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### 2.4 前端生产构建

```bash
# 各前端分别构建
cd fronted/Customer && npm install && npm run build   # 产出 dist/
cd fronted/Merchant && npm install && npm run build
cd fronted/Rider    && npm install && npm run build
cd fronted/Manager  && npm install && npm run build
```

### 2.5 Nginx 配置

```nginx
# /etc/nginx/sites-available/elm

# 后端 API
upstream elm_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # 静态文件
    location /static/ {
        alias /var/www/elm/static/;
        expires 30d;
    }

    # 上传文件
    location /media/ {
        alias /var/www/elm/media/;
        expires 7d;
    }

    # API 和 WebSocket
    location /api/ {
        proxy_pass http://elm_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws/ {
        proxy_pass http://elm_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 客户端前端（示例，各前端可部署在不同子域名）
    location / {
        root /var/www/elm/customer;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/elm /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
```

### 2.6 Systemd 服务

```ini
# /etc/systemd/system/elm-backend.service
[Unit]
Description=ELM Backend (Daphne)
After=network.target postgresql.service redis.service

[Service]
User=www-data
WorkingDirectory=/opt/elm/src/elm
Environment="DJANGO_SETTINGS_MODULE=config.settings_prod"
EnvironmentFile=/opt/elm/.env
ExecStart=/opt/elm/.venv/bin/daphne config.asgi:application --bind 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable elm-backend
sudo systemctl start elm-backend
sudo systemctl status elm-backend
```

---

## 三、常用运维命令

```bash
# 查看日志（生产环境）
tail -f /var/log/django/elm.log

# 重启服务
sudo systemctl restart elm-backend

# 数据库迁移（更新后执行）
export DJANGO_SETTINGS_MODULE=config.settings_prod
uv run python manage.py migrate

# 清除过期 Session
uv run python manage.py clearsessions
```

---

## 四、环境差异对照

| 配置项 | 开发环境 | 生产环境 |
|--------|---------|---------|
| settings | `config.settings` | `config.settings_prod` |
| 数据库 | SQLite | PostgreSQL |
| 调试模式 | DEBUG=True | DEBUG=False |
| CORS | 允许所有 | 仅指定域名 |
| Channels | InMemoryChannelLayer | Redis Channel Layer |
| 静态文件 | Django runserver | Nginx |
| 媒体文件 | `src/elm/media/` | `/var/www/elm/media/` + Nginx |
| 限流 | 无 | 100/hour (匿名), 1000/hour (已登录) |
| 日志 | 控制台 | 文件 + 控制台 |

---

## 五、健康检查

```bash
# 后端健康检查
curl http://localhost:8000/api/v1/merchants/

# Django 系统检查
uv run python manage.py check --deploy

# 数据库连接测试
uv run python manage.py dbshell
```
