# ELM 外卖平台

一个完整的外卖平台系统，包含客户端、商家端、骑手端和管理端。

## 🎯 项目状态

**当前版本**: v1.0.0 - MVP 完成  
**完成度**: 85%  
**状态**: ✅ 核心功能可用，可完整演示

## 🚀 快速开始

### 启动后端
```bash
cd src/elm
uv run python manage.py runserver
```

### 启动前端
```bash
cd fronted/Customer
npm run dev
```

### 测试账号
```
客户端: 13800000001 / customer
商家端: 13800000002 / merchant
骑手端: 13800000003 / rider
管理端: 13800000004 / manager
```

访问 http://localhost:3000 开始体验

## 📊 项目数据

### 后端
- **Django Apps**: 13 个
- **API 接口**: 25 个 (100% 实现)
- **数据库模型**: 10+ 个
- **测试数据**: 
  - 商家: 5 个
  - 商品: 20 个
  - 订单: 41 个
  - 用户: 6 个

### 前端
- **React 组件**: 40+ 个
- **已对接组件**: 9 个核心组件
- **API 驱动**: 100%
- **Mock 数据**: 完全清理

## 🎯 核心功能

✅ 用户登录注册  
✅ 浏览商家和商品  
✅ 购物车管理  
✅ 订单创建和管理  
✅ 地址管理  
✅ 订单状态流转  

## 📁 项目结构

```
ELM/
├── src/elm/              # Django 后端
│   ├── accounts/         # 用户认证
│   ├── merchants/        # 商家管理
│   ├── products/         # 商品管理
│   ├── orders/           # 订单系统
│   ├── riders/           # 骑手管理
│   └── ...
├── fronted/              # React 前端
│   ├── Customer/         # 客户端
│   ├── Merchant/         # 商家端
│   ├── Rider/            # 骑手端
│   └── Manager/          # 管理端
└── docs/                 # 设计文档
```

## 📚 文档

- [API 接口文档](docs/02-api-design.md) - 完整 API 规范
- [数据库设计](docs/01-database-design.md) - 数据库表结构
- [开发指南](docs/DEVELOPMENT.md) - 开发环境配置

## 🛠️ 技术栈

### 后端
- Django 6.0
- Django REST Framework
- SQLite (开发) / PostgreSQL (生产)
- Channels (WebSocket)
- Celery (异步任务)

### 前端
- React 19
- TypeScript
- Tailwind CSS
- Axios
- Framer Motion

## 📈 下一步计划

### 短期 (1-2 周)
- [ ] WebSocket 实时通知
- [ ] Rider 和 Merchant 端对接
- [ ] 图片上传功能

### 中期 (3-4 周)
- [ ] 支付接口集成
- [ ] 评价系统完善
- [ ] 优惠券功能

### 长期 (1-2 月)
- [ ] 单元测试
- [ ] 性能优化
- [ ] 生产部署

## 📝 License

Apache-2.0

## 👥 作者

Wu05011

---

**项目已达到 MVP 状态，欢迎体验！**
