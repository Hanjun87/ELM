# 01 - 项目概述与技术选型

## 1. 项目背景

ELM 是一个多角色外卖配送 O2O 平台，B端与C端分离，支持以下四种角色：

| 角色 | 端 | 核心诉求 |
|------|-----|---------|
| 客户 (Customer) | C端 | 浏览商品、下单支付、追踪订单、售后评价 |
| 商家 (Merchant) | B端 | 店铺运营、商品管理、接单履约、经营分析 |
| 配送员 (Rider) | 履约端 | 接单抢单、配送流转、异常处理、收入统计 |
| 管理员 (Admin) | 运营端 | RBAC权限管理、内容审核、全局监控、财务对账 |

## 2. 技术选型

| 层面 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 语言 | Python | 3.13+ | 生态成熟，开发效率高 |
| 框架 | Django | 6.0 | 全功能Web框架，ORM/Admin/Auth开箱即用 |
| API层 | Django REST Framework | 3.17+ | 成熟的REST API框架，序列化/认证/权限/视图集 |
| 数据库 | PostgreSQL | 16+ | 支持GIS扩展(PostGIS)做地理位置计算 |
| 缓存 | Redis | 7.x | 会话缓存 + Celery消息代理 + 实时状态存储 |
| 异步任务 | Celery | 5.6+ | 异步处理支付回调、订单超时、结算批处理 |
| 实时通信 | Django Channels + Daphne | 4.x | WebSocket推送订单状态变更、新订单通知 |
| 包管理 | uv | 0.11+ | 快速依赖解析与管理 |
| 文件存储 | MinIO / 阿里云OSS | — | 商品图片、营业执照等静态文件 |
| 支付 | 支付宝/微信支付SDK | — | 第三方支付对接 |
| SMS | 阿里云/腾讯云短信 | — | 注册验证码、订单通知 |
| 地图服务 | 高德/百度地图API | — | 配送导航、距离计算、区域热力图 |

## 3. 项目目录结构

```
ELM/
├── config/                     # Django 项目配置 (project root)
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py             # 公共配置
│   │   ├── dev.py              # 开发环境
│   │   └── production.py       # 生产环境
│   ├── urls.py                 # 根路由
│   ├── asgi.py                 # ASGI 入口 (WebSocket)
│   └── wsgi.py                 # WSGI 入口
├── apps/                       # 业务应用 (按DDD限界上下文划分)
│   ├── common/                 # 公共基础模块 (抽象基类、工具函数、全局常量)
│   ├── users/                  # 用户与认证 (自定义User模型、角色、权限、地址)
│   ├── merchants/              # 商家管理 (店铺、商品分类、商品、规格、上下架)
│   ├── orders/                 # 订单核心 (购物车、订单、订单明细、状态流转)
│   ├── riders/                 # 配送管理 (骑手信息、工作状态、配送记录)
│   ├── payments/               # 支付结算 (支付单、退款、商家/骑手结算)
│   ├── marketing/              # 营销活动 (优惠券、促销规则、平台活动)
│   ├── reviews/                # 评价投诉 (订单评价、售后投诉)
│   ├── notifications/          # 通知推送 (App推送、站内消息、短信)
│   └── admin_portal/           # 管理后台 (商家审核、数据大盘、系统配置)
├── services/                   # 跨应用服务编排层
│   ├── order_service.py        # 下单流程编排
│   ├── dispatch_service.py     # 骑手派单逻辑
│   └── settlement_service.py   # 结算批处理
├── tasks/                      # Celery 异步任务
│   ├── order_tasks.py          # 订单超时/自动取消
│   ├── settlement_tasks.py     # 定时结算
│   └── notification_tasks.py   # 异步推送
├── utils/                      # 项目级工具
│   ├── pagination.py           # 统一分页
│   ├── response.py             # 统一响应格式
│   ├── permissions.py          # 自定义权限类
│   └── geo.py                  # 地理位置工具
├── templates/                  # Django模板 (管理后台)
├── static/                     # 静态文件
├── media/                      # 用户上传文件
├── docs/                       # 设计文档
├── manage.py
├── pyproject.toml
└── .env                        # 环境变量 (不入库)
```

## 4. 应用划分原则

每个 `apps/` 下的子应用遵循**限界上下文**边界，应用之间通过以下方式通信：

1. **同步调用**：通过 `services/` 层的服务函数编排，避免直接在 views 中跨应用调用
2. **异步解耦**：通过 Django Signals + Celery 任务实现跨应用事件驱动
3. **API调用**：内部管理后台可复用 REST API，避免代码耦合

## 5. 开发环境搭建

```bash
# 1. 克隆项目
git clone <repo-url> && cd ELM

# 2. 安装依赖
uv sync

# 3. 创建环境变量文件
cp .env.example .env
# 编辑 .env 配置数据库、Redis、密钥等

# 4. 创建 PostgreSQL 数据库
createdb elm_dev

# 5. 执行迁移
uv run manage.py migrate

# 6. 加载初始数据 (角色、权限、管理员)
uv run manage.py loaddata fixtures/initial_data.json

# 7. 启动开发服务器 (含 WebSocket)
uv run daphne config.asgi:application --port 8000

# 8. 启动 Celery Worker (另一个终端)
uv run celery -A config worker -l info

# 9. 启动 Celery Beat (定时任务，另一个终端)
uv run celery -A config beat -l info
```

## 6. 核心设计决策

### 6.1 用户模型：基础账号 + 扩展画像

使用 Django 自定义 User 模型做统一认证，Merchant 和 Rider 通过 OneToOneField 扩展业务属性。这避免了多表登录问题，同时保持了业务数据的隔离。

### 6.2 订单商品快照

`OrderItem` 在创建时快照商品名称、价格、规格——后续商品修改不影响历史订单。这是交易系统的标准做法。

### 6.3 金额字段

所有金额使用 `DecimalField(max_digits=10, decimal_places=2)`，**绝不使用 FloatField**，避免浮点精度问题。

### 6.4 坐标字段

经纬度使用 `DecimalField(max_digits=9, decimal_places=6)`，精度约 0.11 米，满足配送定位需求。

### 6.5 软删除

核心业务实体（商家、商品、订单）采用软删除（`is_deleted` 字段），保留数据可追溯性。

### 6.6 API版本化

通过 URL 前缀做版本控制：`/api/v1/`, `/api/v2/`。后续版本通过新 URL 前缀发布，旧版本保持兼容至废弃通知期满。**不使用** accept header 版本化（调试/文档可读性差）。

### 6.7 统一响应格式

所有 API 返回以下格式：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

业务错误码统一管理，分模块分段：

| 码段 | 模块 |
|------|------|
| 0 | 成功 |
| 1000-1999 | 认证与授权 |
| 2000-2999 | 用户 |
| 3000-3999 | 商家与商品 |
| 4000-4999 | 订单 |
| 5000-5999 | 配送 |
| 6000-6999 | 支付 |
| 7000-7999 | 营销 |
| 9000-9999 | 系统通用错误 |
