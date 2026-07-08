# 00 - 项目概述

## 1. 项目简介

ELM 是一个基于 Django + Taro 小程序 + React 的多角色外卖平台，覆盖**客户下单、商家接单、骑手配送、平台管理**四个核心业务角色。

**当前形态：3 个微信小程序（客户 / 商家 / 骑手）+ 1 个 Web 管理后台（Manager）**。三端 C 端/商家/骑手已迁移至微信小程序；`fronted/` 下的 Customer / Merchant / Rider 三个 Web 前端**已废弃**（功能被小程序取代，代码保留供参考），仅 Manager 管理后台仍为在用 Web 应用。

| 属性 | 说明 |
|------|------|
| 项目名称 | ELM 外卖平台 |
| 后端技术栈 | Python 3.13 · Django 6.0 · Django REST Framework · djangorestframework-simplejwt · Django Channels · Daphne |
| 小程序技术栈 | Taro 4 · React · TypeScript · weapp-tailwindcss（Customer / Merchant / Rider 三端） |
| Web 后台技术栈 | React 19 · TypeScript · Vite · Tailwind CSS v4 · Axios · Lucide React（Manager 端） |
| 认证方式 | JWT (access + refresh token) |
| 架构模式 | 前后端分离 · RESTful API |

---

## 2. 系统架构

```
┌──────────────┬──────────────┬──────────────┐   ┌──────────────┐
│  Customer    │  Merchant    │    Rider     │   │   Manager    │
│  小程序      │  小程序      │  小程序      │   │  Web 后台    │
│  (客户下单)  │  (商家管理)  │  (骑手配送)  │   │  (平台管理)  │
│   Taro 4     │   Taro 4     │   Taro 4     │   │  port 3000   │
└──────────────┴──────────────┴──────────────┘   └──────────────┘
                        ↕ HTTP/JSON
         ┌─────────────────────────────────────┐
         │  Django REST Framework + simplejwt  │
         │  http://localhost:8000/api/v1/       │
         ├─────────────────────────────────────┤
         │  JWT 认证中间件 · RBAC 权限中间件    │
         └─────────────────────────────────────┘
                        ↕
┌──────┬──────┬──────┬────────┬──────┬─────────┬──────────┐
│accounts│orders│merchants│products│riders│reviews│admin_panel│
└──────┴──────┴──────┴────────┴──────┴─────────┴──────────┘
                        ↕
              ┌──────────────────┐
              │   SQLite (开发)  │
              │ PostgreSQL (生产) │
              └──────────────────┘
```

---

## 3. 客户端应用（3 小程序 + 1 Web 后台）

### 3.1 微信小程序（客户 / 商家 / 骑手）

三个 C 端/商家/骑手小程序均为独立的 Taro 4 + React 项目，与 Web 端共用同一后端 API（`/api/v1`），各自有独立的 `node_modules` 和 `dist/`。

| 应用 | 目录 | 技术栈 | tab 页 | 后端对接 |
|------|------|--------|--------|---------|
| Customer 小程序 | `miniprogram/customer/` | Taro 4 + React + TS | 首页 / 订单 / 购物车 / 我的 | ✅ 完整对接 |
| Merchant 小程序 | `miniprogram/merchant/` | Taro 4 + React + TS | 订单 / 商品 / 数据 / 我的 | ✅ 订单收发、商品 CRUD、店铺设置对接；数据看板为 Mock |
| Rider 小程序 | `miniprogram/rider/` | Taro 4 + React + TS | 待接单 / 我的配送 / 历史 / 我的 | ✅ 抢单、取餐、送达、开工状态对接 |

移植约定（三端一致）：`axios→Taro.request`、`localStorage→Taro storage`、`toast→Taro.showToast`、单页 `currentRoute`→多页 tabBar、DOM 标签→`View/Text/Image`、`input onChange`→`Input onInput`、`lucide-react` 图标→emoji 占位，Tailwind className 经 `weapp-tailwindcss` 复用。登录时按角色校验（customer/merchant/rider）。

构建：`cd miniprogram/<app> && npm install && npm run build:weapp`，产物在 `dist/`，用微信开发者工具导入对应 `miniprogram/<app>` 目录（AppID 可用测试号）。连本地后端需在「详情 → 本地设置」勾选「不校验合法域名」。

> ⚠️ 三个小程序的 `project.config.json` 若沿用同一 AppID，无法在微信开发者工具中同时打开；真机/上传前需各自配置独立 AppID。

### 3.2 Web 管理后台（Manager）

| 应用 | 目录 | 端口 | 角色 | 后端对接 |
|------|------|------|------|---------|
| Manager | `fronted/Manager/` | 3000 | 管理员 | ✅ 完整对接 (axios)，桌面 Web 布局 |

### 3.3 已废弃的 Web 前端（代码保留）

`fronted/` 下的以下三个 Web 前端**已废弃**，功能由对应小程序取代，代码仅供参考、不再维护：

| 已废弃应用 | 目录 | 取代者 |
|-----------|------|--------|
| ~~Customer (Web)~~ | `fronted/Customer/` | `miniprogram/customer/` |
| ~~Merchant (Web)~~ | `fronted/Merchant/` | `miniprogram/merchant/` |
| ~~Rider (Web)~~ | `fronted/Rider/` | `miniprogram/rider/` |

---

## 4. 后端 Django Apps

| App | 状态 | 说明 |
|-----|------|------|
| accounts | ✅ 已上线 | 用户注册/登录/JWT/RBAC |
| merchants | ✅ 已上线 | 商家信息、店铺管理 |
| products | ✅ 已上线 | 商品/分类管理 |
| orders | ✅ 已上线 | 完整订单生命周期 |
| addresses | ✅ 已上线 | 收货地址管理 |
| promotions | ✅ 已上线 | 优惠券管理 |
| riders | ✅ 已上线 | 骑手档案/状态管理 |
| reviews | ✅ 已上线 | 评价/回复 |
| admin_panel | ✅ 已上线 | 平台管理看板/用户封禁 |
| uploads | ✅ 已上线 | 图片上传 |
| payments | ⏳ 预留 | 模型/迁移存在，无 HTTP 端点 |
| notifications | ⏳ 预留 | 模型/迁移存在，无 HTTP 端点 |
| common | ⏳ 预留 | 工具 App，待定义用途 |

---

## 5. 订单状态流转

```
客户下单 → pending → paid(支付) → accepted(商家接单)
                                        ↓
                    cancelled ← reject   prepare → preparing
                                                        ↓
                                             ready(出餐完成)
                                                   ↓
                                           picked(骑手取餐)
                                                   ↓
                                          delivered(送达)
                                                   ↓
                                          finished(客户确认)
```

---

## 6. 测试账号与 Mock 数据

`init_data` 种子的 4 个基础账号：

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 客户 | 13800000001 | customer |
| 商家 | 13800000002 | merchant |
| 骑手 | 13800000003 | rider |
| 管理员 | 13800000004 | manager |

`init_data` + `add_more_data` 后的数据规模：**21 商家 · 98 商品 · 11 骑手 · 11 客户 · 19 订单（覆盖全部 8 个状态）· 5 评价 · 6 优惠券**。扩充账号明细见 [TEST_ACCOUNTS.md](TEST_ACCOUNTS.md)。

---

## 7. 文档索引

| 文档 | 说明 |
|------|------|
| [API.md](API.md) | 接口文档（所有已实现端点） |
| [需求说明书.md](需求说明书.md) | 功能需求描述 |
| [设计说明书.md](设计说明书.md) | 用例图、功能结构图、E-R图、数据库设计 |
| [DEPLOY.md](DEPLOY.md) | 部署文档 |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 开发指南 |
| [TESTING.md](TESTING.md) | 测试文档 |
| [03-rbac-design.md](03-rbac-design.md) | RBAC 权限设计 |
| [04-order-lifecycle.md](04-order-lifecycle.md) | 订单生命周期设计 |
