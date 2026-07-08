# ELM 开发指南

## 环境要求

| 工具 | 版本 |
|------|------|
| Python | 3.13+ |
| Node.js | 18+ |
| uv | 最新 |
| npm | 9+ |

---

## 快速启动

> **一键启动脚本**（推荐）: 项目根目录有 `start.sh`，可按需选择启动哪个前端。

### 手动启动

**后端**（在 `src/elm/` 目录下执行）：
```bash
cd src/elm
uv sync
uv run python manage.py migrate
uv run python manage.py init_data        # 初始化角色 + 测试账号 + 示例数据
uv run python manage.py add_more_data    # 追加更多演示数据（可选）
uv run python manage.py runserver        # http://localhost:8000
```

**各前端**（各自独立，选择一个启动）：
```bash
cd fronted/Customer && npm install && npm run dev   # http://localhost:3000
cd fronted/Merchant && npm install && npm run dev   # http://localhost:3000
cd fronted/Rider    && npm install && npm run dev   # http://localhost:3000
cd fronted/Manager  && npm install && npm run dev   # http://localhost:3000
```

---

## 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 客户 | 13800001000 | customer |
| 商家 | 13800002000 | merchant |
| 骑手 | 13800003000 | rider |
| 管理员 | 13800004000 | manager |

---

## API 调试示例

### 登录
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800001000", "password": "customer"}'
```

### 创建订单（获取 token 后）
```bash
TOKEN="eyJ..."
curl -X POST http://localhost:8000/api/v1/orders/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": 1,
    "items": [{"product_id": 1, "quantity": 2}],
    "address_snapshot": {"name": "张三", "phone": "13800138000", "address": "朝阳区建国门外大街1号"}
  }'
```

---

## 常用命令

### 后端
```bash
cd src/elm

# 数据库迁移
uv run python manage.py makemigrations
uv run python manage.py migrate

# 运行测试
uv run python manage.py test                              # 全部（58 个用例）
uv run python manage.py test accounts merchants products  # 指定模块
uv run python runtests.py                                 # 脚本方式（更详细输出）

# 测试覆盖率
uv add coverage
uv run coverage run --source='.' manage.py test
uv run coverage report

# Shell
uv run python manage.py shell

# Django 检查
uv run python manage.py check
uv run python manage.py check --deploy   # 生产环境安全检查
```

### 前端
```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run lint     # TypeScript 类型检查 (tsc --noEmit)
```

---

## 项目规范

### 接口响应格式
```json
{ "code": 0, "message": "success", "data": { ... } }
{ "code": 9001, "message": "参数错误", "data": null }
```

### 错误码约定
| 范围 | 含义 |
|------|------|
| 0 | 成功 |
| 1xxx | 认证/账号错误 |
| 2xxx | 用户/地址错误 |
| 3xxx | 商家/商品错误 |
| 4xxx | 订单错误 |
| 5xxx | 骑手/优惠券错误 |
| 6xxx | 评价错误 |
| 9xxx | 参数/系统错误 |

### Git 提交规范
```
feat:     新功能
fix:      修复 bug
docs:     仅文档变更
refactor: 重构（不含功能变化）
test:     测试相关
chore:    构建/依赖更新
```

---

## 常见问题

**Q: 端口被占用**
```bash
lsof -i :8000 | grep LISTEN
kill -9 <PID>
```

**Q: uv 命令找不到**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Q: 前端编译报类型错误**
```bash
cd fronted/<AppName>
npm install    # 确保依赖已安装
npm run lint   # 查看具体错误
```

**Q: 数据库被测试污染**
测试使用独立内存数据库，不影响开发数据库。若需重置开发数据：
```bash
rm src/elm/db.sqlite3
uv run python manage.py migrate
uv run python manage.py init_data
```

---

## 相关文档

- [API 接口文档](API.md)
- [部署文档](DEPLOY.md)
- [测试文档](TESTING.md)
