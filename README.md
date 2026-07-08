# ELM 外卖平台

一个完整的外卖平台系统：**3 个微信小程序（客户 / 商家 / 骑手）+ 1 个 Web 管理后台（Manager）**，共用一套 Django REST 后端。

> `fronted/` 下的 Customer / Merchant / Rider 三个 Web 前端**已废弃**（功能由对应小程序取代，代码保留供参考），仅 Manager 管理后台仍为在用 Web 应用。

## 🎯 项目状态

**当前版本**: v1.0.0 - MVP 完成  
**状态**: ✅ 核心功能可用，可完整演示

## 🚀 快速开始

### 启动后端
```bash
cd src/elm
uv run python manage.py runserver
```

### 微信小程序（客户 / 商家 / 骑手）
```bash
cd miniprogram/customer   # 或 miniprogram/merchant、miniprogram/rider
npm install
npm run build:weapp        # 或 npm run dev:weapp 监听编译
```
用微信开发者工具「导入项目」选择对应的 `miniprogram/<app>` 目录（AppID 可用测试号）。
连本地后端需在「详情 → 本地设置」勾选「不校验合法域名」。
详见 [miniprogram/customer/README.md](miniprogram/customer/README.md)。

### 启动 Web 管理后台（Manager）
```bash
cd fronted/Manager
npm install && npm run dev   # http://localhost:3000
```

### 测试账号
```
客户端: 13800000001 / customer
商家端: 13800000002 / merchant
骑手端: 13800000003 / rider
管理端: 13800000004 / manager
```

Manager 后台访问 http://localhost:3000 开始体验。

## 📊 项目数据

### 后端
- **Django Apps**: 13 个（10 个已挂载路由）
- **数据库模型**: 10+ 个
- **测试数据**（`init_data` + `add_more_data`）:
  - 商家: 21 个
  - 商品: 98 个
  - 骑手: 11 个
  - 客户: 11 个
  - 订单: 19 个（覆盖全部 8 个状态）
  - 评价: 5 条 · 优惠券: 6 张

### 客户端
- **微信小程序**: 3 个（Customer / Merchant / Rider，Taro 4 + React）
- **Web 管理后台**: 1 个（Manager，React 19 + Vite）
- **API 驱动**: 小程序三端与 Manager 均对接真实后端

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
├── miniprogram/          # 微信小程序（在用）
│   ├── customer/         # 客户端小程序 (Taro + React)
│   ├── merchant/         # 商家端小程序 (Taro + React)
│   └── rider/            # 骑手端小程序 (Taro + React)
├── fronted/              # React Web 前端
│   ├── Manager/          # 管理后台（在用）
│   ├── Customer/         # 客户端 Web（已废弃，被小程序取代）
│   ├── Merchant/         # 商家端 Web（已废弃，被小程序取代）
│   └── Rider/            # 骑手端 Web（已废弃，被小程序取代）
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

### 微信小程序（客户 / 商家 / 骑手）
- Taro 4 + React + TypeScript
- weapp-tailwindcss（复用 Tailwind className）
- Taro.request / Taro storage

### Web 管理后台（Manager）
- React 19 + TypeScript + Vite
- Tailwind CSS + Axios

## 📈 下一步计划

### 短期
- [ ] WebSocket 实时通知（Channels 目前用 InMemory 层）
- [ ] 小程序图片上传（接入 `/uploads`，商家商品编辑用）
- [ ] 商家数据看板接入真实 analytics（当前为 Mock）

### 中期
- [ ] 支付接口集成（`payments` app 待挂路由）
- [ ] 骑手异常上报后端接口
- [ ] 优惠券打通（`promotions` app 待挂路由）

### 长期
- [ ] 补充单元测试
- [ ] 性能优化
- [ ] 生产部署（Postgres + Redis Channel 层）

## 📝 License

Apache-2.0

## 👥 作者

Wu05011

---

**项目已达到 MVP 状态，欢迎体验！**
