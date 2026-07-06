# 00 - 项目概述

## 1. 项目简介

ELM 是一个基于 Django + React 的多角色外卖平台，支持客户下单、商家接单、骑手配送、平台管理四个核心业务流程。

**项目名称**: ELM (外卖管理系统)  
**技术栈**: Django 6.0 + DRF + React 19 + TypeScript + Tailwind CSS v4  
**架构模式**: 前后端分离 + RESTful API + WebSocket 实时通知

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (React 19)                      │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│  Customer端  │   Rider端    │  Merchant端  │   Manager端     │
│  (用户下单)  │  (骑手配送)  │  (商家接单)  │  (平台管理)     │
└──────────────┴──────────────┴──────────────┴─────────────────┘
                              ↕ HTTPS/JSON
┌─────────────────────────────────────────────────────────────┐
│                    API 网关层 (Django REST Framework)         │
├─────────────────────────────────────────────────────────────┤
│  认证中间件 (JWT) │ 权限中间件 (RBAC) │ 限流中间件          │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      业务逻辑层 (Django Apps)                 │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│  accounts    │   orders     │  merchants   │    riders       │
│  (用户认证)  │  (订单管理)  │  (商家管理)  │   (骑手管理)    │
├──────────────┼──────────────┼──────────────┼─────────────────┤
│  products    │   payments   │  promotions  │   notifications │
│  (商品管理)  │  (支付结算)  │  (营销活动)  │   (消息推送)    │
└──────────────┴──────────────┴──────────────┴─────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      数据持久层                               │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│ PostgreSQL   │    Redis     │   Celery     │   Channels      │
│ (关系数据)   │  (缓存/会话) │  (异步任务)  │  (WebSocket)    │
└──────────────┴──────────────┴──────────────┴─────────────────┘
```

## 3. 核心功能模块

### 3.1 客户端 (Customer)
- 账号注册登录、手机验证码
- 浏览商家/商品、搜索筛选
- 购物车、下单结算、优惠券
- 订单跟踪、评价、退款

### 3.2 商家端 (Merchant)
- 店铺信息管理、营业时间设置
- 商品上下架、库存管理、分类管理
- 订单接单/拒单、出餐确认
- 营销活动配置（满减、折扣、新客立减）
- 数据看板（营业额、订单量、评价）

### 3.3 骑手端 (Rider)
- 工作状态切换（空闲/忙碌/休息）
- 订单抢单/接单
- 配送流程：到店 → 取餐 → 送达
- 异常上报（缺货、联系不上客户）
- 收入统计、历史记录

### 3.4 管理端 (Manager)
- 用户管理（封禁/解封）
- 商家审核（营业执照、食品许可证）
- 商品审核
- 举报处理
- 平台数据看板（GMV、DAU、订单量、退款率）
- 财务结算（商家分账、骑手提现）
- 系统配置（佣金比例、超时阈值）

## 4. 技术选型说明

### 4.1 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Django | 6.0 | Web 框架 |
| Django REST Framework | 3.17 | RESTful API |
| Channels | 4.3 | WebSocket 实时通信 |
| Celery | 5.6 | 异步任务队列 |
| Redis | 8.0 | 缓存 + Celery Broker + Session 存储 |
| PostgreSQL | 16+ | 关系型数据库 |
| Daphne | 4.2 | ASGI 服务器 |

### 4.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.0 | UI 框架 |
| TypeScript | 5.8 | 类型安全 |
| Vite | 6.2 | 构建工具 |
| Tailwind CSS | 4.1 | 样式框架 |
| Lucide React | 0.546 | 图标库 |
| Motion | 12.23 | 动画库 |

### 4.3 为什么选择 Django 6.0

- **成熟的 ORM**: 简化数据库操作，支持复杂查询和事务
- **内置管理后台**: 快速搭建数据管理界面
- **DRF 生态**: 完善的 REST API 开发工具链
- **Channels 支持**: 原生支持 WebSocket，便于实现实时通知
- **安全性**: 内置 CSRF、XSS、SQL 注入防护

## 5. 部署架构

### 5.1 开发环境
```bash
# 前端 (4个独立应用，分别运行在不同端口)
cd fronted/Customer && npm run dev    # localhost:3000
cd fronted/Merchant && npm run dev    # localhost:3001
cd fronted/Rider && npm run dev       # localhost:3002
cd fronted/Manager && npm run dev     # localhost:3003

# 后端
uv run daphne config.asgi:application --port 8000
redis-server                          # localhost:6379
celery -A config worker -l info       # 异步任务 worker
```

### 5.2 生产环境 (推荐)
```
Nginx (反向代理 + 静态文件) 
  ↓
Gunicorn/Daphne (Django 应用服务器)
  ↓
PostgreSQL (主数据库)
Redis (缓存 + 队列)
Celery Worker (异步任务)
```

## 6. 数据流转示例

### 6.1 典型下单流程
```
Customer 前端
  → POST /api/v1/orders/ (创建订单)
  → Django orders.views.OrderCreateView
  → 扣减库存、生成订单、调用支付接口
  → 通过 Channels 推送消息给 Merchant WebSocket
  → Merchant 前端收到新订单通知
  → Merchant 点击"接单"
  → PATCH /api/v1/merchant/orders/{id}/accept/
  → 订单状态更新为"待取餐"
  → 系统自动派单给附近 Rider (Celery 异步任务)
  → Rider 前端收到派单通知
```

## 7. 项目目录结构

```
ELM/
├── fronted/                  # 前端项目
│   ├── Customer/            # 客户端 (React + TS)
│   ├── Merchant/            # 商家端
│   ├── Rider/               # 骑手端
│   ├── Manager/             # 管理端
│   ├── shared/              # 共享组件库
│   └── DESIGN.md            # 设计系统规范
├── src/elm/                 # Django 后端项目
│   ├── accounts/            # 用户认证模块
│   ├── orders/              # 订单管理模块
│   ├── merchants/           # 商家管理模块
│   ├── riders/              # 骑手管理模块
│   ├── products/            # 商品管理模块
│   ├── payments/            # 支付结算模块
│   ├── promotions/          # 营销活动模块
│   ├── notifications/       # 消息推送模块
│   └── config/              # 项目配置
├── docs/                    # 文档
│   ├── 00-overview.md       # 项目概述 (本文档)
│   ├── 01-database-design.md
│   ├── 02-api-design.md
│   ├── 03-rbac-design.md
│   ├── 04-order-lifecycle.md
│   └── 05-module-design.md
├── pyproject.toml           # Python 依赖配置
└── CLAUDE.md                # AI 开发指南
```

## 8. 开发规范

### 8.1 API 响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 8.2 错误码分段
- 0: 成功
- 1xxx: 认证与授权错误
- 2xxx: 用户相关错误
- 3xxx: 商家与商品错误
- 4xxx: 订单错误
- 5xxx: 配送错误
- 6xxx: 支付错误
- 7xxx: 营销活动错误
- 9xxx: 系统通用错误

### 8.3 Git 分支管理
- `main`: 生产环境分支
- `develop`: 开发分支
- `feature/*`: 功能开发分支
- `bugfix/*`: Bug 修复分支

## 9. 下一步计划

1. ✅ 完成数据库设计文档
2. ✅ 完成 API 接口设计文档
3. ✅ 完成 RBAC 权限设计文档
4. ✅ 完成订单生命周期文档
5. ✅ 完成模块划分设计文档
6. ⏳ 搭建 Django 项目骨架
7. ⏳ 实现用户认证模块
8. ⏳ 实现商家管理模块
9. ⏳ 实现订单核心流程
10. ⏳ 实现支付对接
11. ⏳ 实现 WebSocket 实时通知
12. ⏳ 编写单元测试
13. ⏳ 部署到测试环境

## 10. 相关文档

- [数据库设计](./01-database-design.md)
- [API 接口设计](./02-api-design.md)
- [RBAC 权限设计](./03-rbac-design.md)
- [订单生命周期](./04-order-lifecycle.md)
- [模块划分设计](./05-module-design.md)
- [需求分析](./需求分析.txt)
- [前端设计规范](../fronted/DESIGN.md)
