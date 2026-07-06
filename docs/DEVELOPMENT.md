# ELM 开发指南

## 环境要求

- Python 3.13+
- Node.js 18+
- uv (Python 包管理)
- npm

## 初始化项目

### 后端初始化
```bash
cd src/elm

# 安装依赖
uv sync

# 初始化数据库
uv run python manage.py migrate

# 创建测试数据
uv run python manage.py init_data
uv run python manage.py add_more_data

# 启动服务器
uv run python manage.py runserver
```

### 前端初始化
```bash
cd fronted/Customer

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## API 测试

### 登录
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800000001", "password": "customer"}'
```

### 获取商家列表
```bash
curl http://localhost:8000/api/v1/merchants/
```

### 创建订单（需要 token）
```bash
curl -X POST http://localhost:8000/api/v1/orders/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": 1,
    "items": [{"name": "商品", "price": 28, "quantity": 1}],
    "address_snapshot": {"name": "张三", "phone": "138", "address": "XXX"}
  }'
```

## 常用命令

### Django 管理
```bash
# 创建迁移
uv run python manage.py makemigrations

# 执行迁移
uv run python manage.py migrate

# 创建超级用户
uv run python manage.py createsuperuser

# Django Shell
uv run python manage.py shell
```

### 前端开发
```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check
```

## 项目规范

### API 响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 错误码
- 0: 成功
- 1xxx: 认证错误
- 2xxx: 用户错误
- 3xxx: 商家错误
- 4xxx: 订单错误
- 9xxx: 系统错误

### Git 提交规范
```
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 构建
```

## 常见问题

### Q: 端口被占用
```bash
# 查找占用进程
lsof -i :8000
# 杀死进程
kill -9 <PID>
```

### Q: CORS 错误
确保 Django settings.py 中配置了：
```python
CORS_ALLOW_ALL_ORIGINS = True
```

### Q: Token 过期
重新登录获取新 token，或实现 token 刷新机制。

## 调试技巧

### 后端调试
```python
# 在代码中添加断点
import pdb; pdb.set_trace()

# 查看 SQL 查询
from django.db import connection
print(connection.queries)
```

### 前端调试
```typescript
// 查看 API 响应
console.log('API Response:', response);

// React DevTools
// 安装浏览器扩展
```

## 部署

### 开发环境
- 后端: http://localhost:8000
- 前端: http://localhost:3000

### 生产环境（待配置）
- 使用 PostgreSQL
- 配置 Nginx
- 使用 Gunicorn
- 配置 HTTPS

---

更多信息请查看 [API 文档](02-api-design.md)

## 生产环境部署

### 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，设置以下变量:
# - SECRET_KEY: 使用 python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 生成
# - ALLOWED_HOSTS: 你的域名
# - 数据库配置
```

### 生产环境运行
```bash
# 设置环境变量
export DJANGO_SETTINGS_MODULE=config.settings_prod

# 收集静态文件
python manage.py collectstatic

# 使用 Gunicorn 运行
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### 安全检查
```bash
python manage.py check --deploy
```
