# 03 - API接口设计

## 1. 设计约定

### 1.1 URL命名规范

```
/api/v1/{resource}/                    # 资源集合
/api/v1/{resource}/{id}/               # 单个资源
/api/v1/{resource}/{id}/{action}/      # 资源上的动作(非CRUD)
```

- 资源名使用小写复数 (`/orders/`, `/products/`)
- 动作使用小写动词 (`/cancel/`, `/accept/`)
- 复合资源不超过两层嵌套 (`/merchants/{id}/products/`)
- 公开浏览接口使用资源复数 (`/merchants/`)，角色专属管理接口用单数前缀 (`/merchant/` 语义为"我的店铺"，`/rider/` 语义为"我的配送")
- 管理后台统一使用 `/admin/` 前缀

### 1.2 统一响应格式

```json
// 成功
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 列表成功
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}

// 失败
{
  "code": 4001,
  "message": "订单状态不允许此操作",
  "data": null
}
```

### 1.3 认证方式

- JWT Bearer Token：`Authorization: Bearer <access_token>`
- Access Token 有效期：2小时
- Refresh Token 有效期：7天

### 1.4 分页

使用基于 `page` + `page_size` 的分页，默认 `page_size=20`，最大 `page_size=100`。

### 1.5 错误码分段

| 码段 | 模块 | 示例 |
|------|------|------|
| 0 | 成功 | — |
| 1000-1999 | 认证与授权 | 1001: token过期, 1003: 权限不足 |
| 2000-2999 | 用户 | 2001: 手机号已注册, 2002: 地址数量超限 |
| 3000-3999 | 商家与商品 | 3001: 店铺休息中, 3002: 商品已下架 |
| 4000-4999 | 订单 | 4001: 订单状态不允许此操作, 4002: 库存不足 |
| 5000-5999 | 配送 | 5001: 配送员不可用, 5002: 转单失败 |
| 6000-6999 | 支付 | 6001: 支付失败, 6002: 退款金额超额 |
| 7000-7999 | 营销 | 7001: 优惠券已过期, 7002: 不满足使用条件 |
| 9000-9999 | 系统通用 | 9001: 参数校验失败, 9002: 服务异常 |

## 2. 接口清单

### 2.1 认证接口 (Auth)

| 方法 | URL | 说明 | 认证 |
|------|-----|------|------|
| POST | `/api/v1/auth/register/` | 客户注册 | 否 |
| POST | `/api/v1/auth/sms/send/` | 发送短信验证码 | 否 |
| POST | `/api/v1/auth/login/` | 登录获取token | 否 |
| POST | `/api/v1/auth/refresh/` | 刷新access token | 否 (需refresh token) |
| POST | `/api/v1/auth/logout/` | 登出(作废refresh token) | 是 |
| POST | `/api/v1/auth/password/reset/` | 发送重置密码验证码 | 否 |
| POST | `/api/v1/auth/password/reset/confirm/` | 确认重置密码 | 否 |
| PUT | `/api/v1/auth/password/change/` | 修改密码 | 是 |

**POST /api/v1/auth/sms/send/**
```
Request:
{
  "phone": "13800000001",
  "type": "register"              // register / login / reset_password
}

Response:
{
  "code": 0,
  "message": "验证码已发送",
  "data": { "expires_in": 300 }   // 5分钟有效
}
```

**POST /api/v1/auth/register/**
```
Request:
{
  "phone": "13800000001",
  "sms_code": "123456",
  "password": "Abc123456!",
  "username": "zhangsan"          // 可选，默认生成
}

Response:
{
  "code": 0,
  "data": {
    "user_id": 1,
    "phone": "138****0001",
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 7200
  }
}
```

**POST /api/v1/auth/login/**
```
Request:
{
  "account": "13800000001",       // 手机号或用户名
  "password": "Abc123456!"
}

Response:
{
  "code": 0,
  "data": {
    "user_id": 1,
    "phone": "138****0001",
    "roles": ["customer"],
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 7200
  }
}
```

### 2.2 用户接口 (Users)

| 方法 | URL | 说明 | 角色 |
|------|-----|------|------|
| GET | `/api/v1/users/me/` | 获取当前用户信息 | 所有 |
| PUT | `/api/v1/users/me/` | 更新个人资料 | 所有 |
| GET | `/api/v1/users/addresses/` | 收货地址列表 | 客户 |
| POST | `/api/v1/users/addresses/` | 新增收货地址 | 客户 |
| PUT | `/api/v1/users/addresses/{id}/` | 修改收货地址 | 客户 |
| DELETE | `/api/v1/users/addresses/{id}/` | 删除收货地址 | 客户 |
| PATCH | `/api/v1/users/addresses/{id}/set-default/` | 设为默认地址 | 客户 |
| GET | `/api/v1/users/coupons/` | 我的优惠券列表 | 客户 |

**POST /api/v1/users/addresses/**
```
Request:
{
  "contact_name": "张三",
  "contact_phone": "13800000001",
  "province": "上海市",
  "city": "上海市",
  "district": "浦东新区",
  "detail": "张江高科技园区XX号楼XX室",
  "latitude": 31.204527,
  "longitude": 121.583790,
  "is_default": true
}
```

### 2.3 商家浏览接口 (公开)

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/merchants/` | 商家列表 |
| GET | `/api/v1/merchants/{id}/` | 商家详情 |
| GET | `/api/v1/merchants/{id}/products/` | 商家商品列表 |
| GET | `/api/v1/merchants/{id}/reviews/` | 商家评价列表 |
| GET | `/api/v1/merchants/nearby/` | 附近商家 (需传经纬度) |

**GET /api/v1/merchants/**
```
Query:
  ?category=中餐&keyword=火锅&latitude=31.204&longitude=121.583
  &sort_by=distance&page=1&page_size=20

Response:
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "老张川味火锅",
        "logo": "https://...",
        "rating": 4.5,
        "monthly_sales": 1234,
        "distance": 520,             // 米
        "min_order_amount": "20.00",
        "delivery_fee": "3.00",
        "delivery_time": "30-45",     // 分钟
        "notice": "欢迎光临老张川味火锅",
        "tags": ["火锅", "川菜", "人气榜"],
        "promotions": [               // 匹配命中的活动
          { "type": "full_reduction", "label": "满30减5" },
          { "type": "new_customer", "label": "新客立减10元" }
        ]
      }
    ],
    "total": 45,
    "page": 1,
    "page_size": 20
  }
}
```

### 2.4 商品接口 (公开)

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/products/` | 商品搜索 (全局) |
| GET | `/api/v1/products/{id}/` | 商品详情 |
| GET | `/api/v1/categories/` | 全部分类 |

**GET /api/v1/products/{id}/**
```
Response:
{
  "code": 0,
  "data": {
    "id": 101,
    "merchant": {
      "id": 1,
      "name": "老张川味火锅",
      "logo": "https://..."
    },
    "name": "毛肚",
    "description": "新鲜毛肚，七上八下涮15秒口感最佳",
    "price": "38.00",
    "original_price": "48.00",
    "stock": 50,
    "sales_count": 8932,
    "images": ["url1", "url2"],
    "specs": [
      { "id": 1, "name": "小份", "price_modifier": "-8.00", "stock": 20 },
      { "id": 2, "name": "大份", "price_modifier": "0.00", "stock": 30 }
    ],
    "reviews": {
      "count": 128,
      "bad_count": 3,
      "items": [ ... ]              // 最近3条评价
    }
  }
}
```

### 2.5 购物车接口 (Customer)

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/cart/` | 查看购物车 |
| POST | `/api/v1/cart/items/` | 添加商品到购物车 |
| PUT | `/api/v1/cart/items/{id}/` | 修改数量/规格 |
| DELETE | `/api/v1/cart/items/{id}/` | 移除购物车项 |
| DELETE | `/api/v1/cart/clear/` | 清空购物车 |

**POST /api/v1/cart/items/**
```
Request:
{
  "product_id": 101,
  "spec_id": 2,
  "quantity": 3
}
```

**GET /api/v1/cart/**
```
Response:
{
  "code": 0,
  "data": {
    "merchant_name": "老张川味火锅",
    "merchant_id": 1,
    "delivery_fee": "3.00",
    "items": [
      {
        "id": 1,
        "product_id": 101,
        "product_name": "毛肚",
        "product_image": "https://...",
        "spec_name": "大份",
        "unit_price": "38.00",
        "quantity": 3,
        "subtotal": "114.00"
      }
    ],
    "total_amount": "114.00",
    "item_count": 3
  }
}
```

> **注意**：一个购物车只能包含同一商家的商品。添加不同商家商品时，后端提示清空后重新添加。

### 2.6 订单接口 - 客户端 (Customer Orders)

| 方法 | URL | 说明 |
|------|-----|------|
| POST | `/api/v1/orders/` | 提交订单 |
| POST | `/api/v1/orders/{id}/pay/` | 发起支付 |
| GET | `/api/v1/orders/` | 我的订单列表 |
| GET | `/api/v1/orders/{id}/` | 订单详情 |
| PATCH | `/api/v1/orders/{id}/cancel/` | 取消订单 |
| DELETE | `/api/v1/orders/{id}/` | 删除订单(软删除，仅已完成/已取消) |
| POST | `/api/v1/orders/{id}/reviews/` | 提交评价 |
| POST | `/api/v1/orders/{id}/complaints/` | 提交投诉/售后 |

**POST /api/v1/orders/ (提交订单)**
```
Request:
{
  "address_id": 1,
  "coupon_id": 5,                // 可选
  "note": "不要香菜"              // 可选
}

Response:
{
  "code": 0,
  "data": {
    "order_id": 20240705001,
    "order_no": "20240705153000A1B2C3",
    "total_amount": "114.00",
    "delivery_fee": "3.00",
    "discount_amount": "5.00",
    "paid_amount": "112.00",
    "status": "pending_payment",
    "created_at": "2024-07-05T15:30:00+08:00"
  }
}
```

> 订单基于购物车创建。提交时后端做库存预占（预减库存 + 锁定15分钟），支付成功后确认扣减，超时释放。

**POST /api/v1/orders/{id}/pay/ (发起支付)**
```
Request:
{
  "method": "alipay"              // alipay / wechat
}

Response:
{
  "code": 0,
  "data": {
    "payment_url": "https://...",  // 支付宝: 支付链接 (Web端)
    "payment_params": { ... }      // 微信: JSAPI参数 (小程序/App端)
  }
}
```

**POST /api/v1/orders/{id}/reviews/**
```
Request:
{
  "rating": 5,
  "content": "毛肚很新鲜，配送也快！",
  "images": ["https://img1.jpg", "https://img2.jpg"],
  "is_anonymous": false
}
```

### 2.7 订单接口 - 商家端 (Merchant Orders)

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/merchant/orders/` | 待处理订单列表 |
| GET | `/api/v1/merchant/orders/history/` | 历史订单 |
| GET | `/api/v1/merchant/orders/{id}/` | 订单详情 |
| PATCH | `/api/v1/merchant/orders/{id}/accept/` | 接单 |
| PATCH | `/api/v1/merchant/orders/{id}/ready/` | 备餐完成，通知取餐 |
| PATCH | `/api/v1/merchant/orders/{id}/reject/` | 拒单 (附原因) |

**PATCH /api/v1/merchant/orders/{id}/accept/**
```
Request:
{
  "estimated_ready_minutes": 20     // 预计出餐时间(分钟)
}
```

**PATCH /api/v1/merchant/orders/{id}/reject/**
```
Request:
{
  "reason": "备料不足，无法接单"     // 拒单原因，必填
}
```

### 2.8 订单接口 - 配送端 (Rider Orders)

| 方法 | URL | 说明 |
|------|-----|------|
| GET | `/api/v1/rider/orders/pool/` | 待抢订单池 |
| POST | `/api/v1/rider/orders/{id}/grab/` | 抢单 |
| GET | `/api/v1/rider/orders/my/` | 我的配送列表 |
| PATCH | `/api/v1/rider/orders/{id}/arrive/` | 到达店铺 |
| PATCH | `/api/v1/rider/orders/{id}/pickup/` | 已取餐 |
| PATCH | `/api/v1/rider/orders/{id}/deliver/` | 已送达 |
| POST | `/api/v1/rider/orders/{id}/exception/` | 上报异常 |

**POST /api/v1/rider/orders/{id}/exception/**
```
Request:
{
  "type": "contact_failed",        // address_error/item_missing/contact_failed/other
  "description": "客户电话无人接听，已等待5分钟"
}
```

### 2.9 配送员管理接口

| 方法 | URL | 说明 |
|------|-----|------|
| PATCH | `/api/v1/rider/status/` | 更新工作状态 |
| GET | `/api/v1/rider/earnings/` | 收入统计 |
| GET | `/api/v1/rider/orders/history/` | 历史配送记录 |
| POST | `/api/v1/rider/withdraw/` | 申请提现 |

**PATCH /api/v1/rider/status/**
```
Request:
{
  "work_status": "online"          // online / busy / offline
}
```

### 2.10 商家管理接口 (Merchant Portal)

| 方法 | URL | 说明 |
|------|-----|------|
| PUT | `/api/v1/merchant/profile/` | 更新店铺信息 |
| PATCH | `/api/v1/merchant/status/` | 开关店 |
| GET | `/api/v1/merchant/analytics/` | 经营数据看板 |
| POST/PUT/DELETE | `/api/v1/merchant/products/` | 商品管理 |
| POST/PUT/DELETE | `/api/v1/merchant/categories/` | 分类管理 |
| POST/PUT/DELETE | `/api/v1/merchant/promotions/` | 促销管理 |
| GET | `/api/v1/merchant/settlements/` | 结算记录 |
| POST | `/api/v1/merchant/products/batch/` | 批量上下架 |

### 2.11 管理员接口 (Admin)

| 方法 | URL | 说明 |
|------|-----|------|
| GET/POST | `/api/v1/admin/users/` | 用户管理 |
| PUT/PATCH | `/api/v1/admin/users/{id}/` | 编辑/封禁用户 |
| GET/POST | `/api/v1/admin/roles/` | 角色与权限管理 |
| GET | `/api/v1/admin/applications/` | 商家入驻审核列表 |
| PATCH | `/api/v1/admin/applications/{id}/review/` | 审核入驻申请 |
| GET | `/api/v1/admin/orders/` | 全平台订单监控 |
| PATCH | `/api/v1/admin/orders/{id}/intervene/` | 介入处理异常订单 |
| GET | `/api/v1/admin/analytics/` | 平台数据大盘 |
| POST/PUT/DELETE | `/api/v1/admin/banners/` | 轮播图管理 |
| POST/PUT/DELETE | `/api/v1/admin/announcements/` | 公告管理 |
| GET/PUT | `/api/v1/admin/config/` | 平台配置 |

## 3. WebSocket 推送

### 3.1 认证

WebSocket 连接通过 Query String 传递 JWT Token 进行认证：

```
ws://host:8000/ws/notifications/?token=<access_token>
```

Consumer 在 `connect()` 方法中验证 token：有效则接受连接并将用户加入对应 Channel Group；无效或过期则拒绝连接（code 4001）。

### 3.2 连接端点

```
ws://host:8000/ws/notifications/          # 通用通知 (客户端)
ws://host:8000/ws/merchant/orders/        # 商家新订单提醒
ws://host:8000/ws/rider/orders/           # 骑手派单/抢单
```

### 3.2 推送消息格式

```json
{
  "type": "new_order",              // 消息类型
  "data": {
    "order_id": 123,
    "order_no": "20240705...",
    "merchant_name": "老张川味火锅",
    "total_amount": "112.00",
    "created_at": "2024-07-05T15:30:00+08:00"
  },
  "timestamp": "2024-07-05T15:30:01+08:00"
}
```

## 4. 第三方对接接口

### 4.1 支付回调

`POST /api/v1/payments/callback/alipay/` (无需认证，通过签名验证)

### 4.2 短信发送

内部通过 Celery 任务异步调用第三方短信SDK，不直接暴露HTTP接口。
