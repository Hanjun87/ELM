# 00 - 项目概述

## 1. 项目简介

ELM 是一个基于 Django + React 的多角色外卖平台，覆盖**客户下单、商家接单、骑手配送、平台管理**四个核心业务角色。

| 属性 | 说明 |
|------|------|
| 项目名称 | ELM 外卖平台 |
| 后端技术栈 | Python 3.13 · Django 6.0 · Django REST Framework · djangorestframework-simplejwt · Django Channels · Daphne |
| 前端技术栈 | React 19 · TypeScript · Vite · Tailwind CSS v4 · Axios · Lucide React |
| 认证方式 | JWT (access + refresh token) |
| 架构模式 | 前后端分离 · RESTful API |

---

## 2. 系统架构

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Customer    │    Rider     │  Merchant    │   Manager    │
│  (客户下单)  │  (骑手配送)  │  (商家管理)  │  (平台管理)  │
│  port 3000   │  port 3000   │  port 3000   │  port 3000   │
└──────────────┴──────────────┴──────────────┴──────────────┘
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

## 3. 前端应用

| 应用 | 目录 | 端口 | 角色 | 后端对接 |
|------|------|------|------|---------|
| Customer | `fronted/Customer/` | 3000 | 客户 | 完整对接 (axios) |
| Merchant | `fronted/Merchant/` | 3000 | 商家 | 完整对接 (axios) |
| Rider | `fronted/Rider/` | 3000 | 骑手 | 完整对接 (axios) |
| Manager | `fronted/Manager/` | 3000 | 管理员 | 完整对接 (axios) |

**每个前端独立运行，不可同时使用相同端口。** 测试时分别 `cd` 到对应目录启动。

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

## 6. 测试账号（`init_data` 种子）

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 客户 | 13800001000 | customer |
| 商家 | 13800002000 | merchant |
| 骑手 | 13800003000 | rider |
| 管理员 | 13800004000 | manager |

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
