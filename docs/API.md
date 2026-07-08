# ELM 平台 API 接口文档

> 本文档基于当前代码实际实现，仅包含已对外暴露的接口。  
> Base URL: `http://localhost:8000/api/v1`

> **接口消费端**：客户 / 商家 / 骑手三端微信小程序（`miniprogram/customer`、`miniprogram/merchant`、`miniprogram/rider`，Taro 4 + React）与管理后台 Web（`fronted/Manager`，React 19 + Vite）。
> `fronted/Customer`、`fronted/Merchant`、`fronted/Rider` 三个 Web 前端**已废弃**（功能由对应小程序取代，代码仅作参考保留）。后端接口本身不区分调用端，各端共用下列 API。

---

## 一、约定

### 响应格式

```json
{ "code": 0, "message": "success", "data": { ... } }
{ "code": 1001, "message": "错误描述", "data": null }
```

所有接口均返回 HTTP 200（部分创建接口返回 201），错误通过 `code` 区分。

### 错误码

| 范围 | 说明 |
|------|------|
| 0 | 成功 |
| 1001–1002 | 账号认证错误 |
| 2001–2003 | 用户/地址相关 |
| 3001–3005 | 商家/商品相关 |
| 4001–4003 | 订单相关 |
| 5001–5003 | 骑手/优惠券相关 |
| 6001–6002 | 评价相关 |
| 9001 | 参数错误 |
| 9999 | 系统繁忙 |

### 认证

需要认证的接口请在 Header 中携带：
```
Authorization: Bearer <access_token>
```

**IsAdmin** 权限：需要 `roles` 包含 `"admin"` 的登录用户。

---

## 二、账号模块 `/api/v1/auth/`

### 登录

```
POST /api/v1/auth/login/
```

**无需认证**

**请求**:
```json
{ "phone": "13800000001", "password": "customer" }
```

**响应** `data`:
```json
{
  "user_id": 1,
  "phone": "13800000001",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 7200,
  "roles": ["customer"]
}
```

**错误码**: 9001 参数错误 · 1001 密码错误/用户不存在 · 1002 账号已封禁

---

### 注册

```
POST /api/v1/auth/register/
```

**无需认证**

**请求**:
```json
{ "phone": "13800001001", "password": "123456", "role": "customer" }
```

`role` 可选值：`customer` | `merchant` | `rider`（默认 `customer`，**不可注册为 admin**）

**响应** `data`:
```json
{ "user_id": 2, "phone": "13800001001", "access_token": "...", "refresh_token": "..." }
```

**错误码**: 9001 参数错误/角色无效 · 2001 手机号已注册

---

### 当前用户信息

```
GET /api/v1/auth/me/
```

**需要认证**

**响应** `data`:
```json
{
  "id": 1, "phone": "13800000001", "email": "",
  "avatar": null, "status": "active",
  "roles": ["customer"], "date_joined": "2026-07-01T10:00:00+08:00"
}
```

---

## 三、商家模块

### 公开接口

#### 商家列表

```
GET /api/v1/merchants/
```

**无需认证**

**响应** `data`:
```json
{
  "items": [
    { "id": 1, "store_name": "麦当劳", "logo": "https://...", "phone": "021-1", "address": "...",
      "min_order": "15.00", "delivery_fee": "5.00", "status": "open",
      "rating": "4.80", "monthly_sales": 1520 }
  ],
  "total": 1
}
```

#### 商家详情

```
GET /api/v1/merchants/<id>/
```

**无需认证**

**响应** `data`: 同列表单项。

**错误码**: 3001 商家不存在

---

### 商家端接口（需登录 + 拥有 Merchant 档案）

#### 我的店铺

```
GET  /api/v1/merchant/store/
PATCH /api/v1/merchant/store/
```

**需要认证**

`PATCH` 请求体（所有字段可选）：
```json
{ "store_name": "新店名", "logo": "https://...", "phone": "...", "address": "...",
  "min_order": "20.00", "delivery_fee": "6.00" }
```

> `rating` / `monthly_sales` 为只读字段，无法通过此接口修改。

**响应** `data`: 商家完整字段。

**错误码**: 9001 参数错误 · 3001 商家不存在

---

#### 开关店

```
POST /api/v1/merchant/store/toggle/
```

**请求**: `{ "status": "open" }` 或 `{ "status": "closed" }`

**响应** `data`: 商家完整字段。

**错误码**: 9001 参数错误 · 3001 商家不存在

---

## 四、商品模块

### 公开接口

#### 商家商品列表（上架）

```
GET /api/v1/merchants/<merchant_id>/products/
```

**无需认证**

**查询参数**: `category`（分类名称过滤）

**响应** `data`:
```json
{
  "items": [
    { "id": 301, "name": "招牌牛肉面", "description": "...", "image": "https://...",
      "price": "28.00", "original_price": "32.00", "stock": 100,
      "status": "on", "sales_count": 142, "rating": "4.90",
      "specs": null,
      "category": { "id": 1, "name": "主食", "icon": "soup" } }
  ],
  "total": 1
}
```

#### 商品详情

```
GET /api/v1/products/<id>/
```

**无需认证**

**响应** `data`: 同列表单项。

**错误码**: 3002 商品不存在

#### 分类列表

```
GET /api/v1/categories/
```

**无需认证**

**响应** `data`: `[{ "id": 1, "name": "主食", "icon": "soup" }, ...]`

---

### 商家端接口

#### 我的商品列表（含下架）

```
GET  /api/v1/merchant/products/
POST /api/v1/merchant/products/
```

**需要认证**

`GET` 查询参数: `status`（`on` / `off`）

`POST` 请求体：
```json
{
  "name": "新商品", "price": "18.00", "stock": 50,
  "description": "...", "image": "https://...",
  "original_price": "20.00", "specs": null,
  "category_id": 1
}
```

> `price` 最小值 `0.01`，`stock` 最小值 `0`，`sales_count` / `rating` 为只读。

**响应** `data`: 商品完整字段（含 `category` 嵌套对象，创建返回 HTTP 201）。

**错误码**: 9001 参数错误 · 3001 商家不存在

#### 更新 / 删除商品

```
PATCH  /api/v1/merchant/products/<id>/
DELETE /api/v1/merchant/products/<id>/
```

**需要认证**

`PATCH` 请求体同创建，所有字段可选。

**响应** `data`: 更新后的商品字段 / `null`（删除）。

**错误码**: 9001 参数错误 · 3001 商家不存在 · 3002 商品不存在

#### 上下架商品

```
POST /api/v1/merchant/products/<id>/toggle/
```

**请求**: `{ "status": "on" }` 或 `{ "status": "off" }`

**响应** `data`: 商品完整字段。

**错误码**: 9001 参数错误 · 3001 商家不存在 · 3002 商品不存在

---

## 五、订单模块

### 订单对象字段

```json
{
  "id": 1, "order_no": "OD20260708123456789",
  "merchant_id": 1, "merchant_name": "麦当劳", "merchant_logo": "https://...",
  "rider_id": null,
  "address_snapshot": { "name": "张三", "phone": "138****", "address": "..." },
  "items_snapshot": [{ "product_id": 301, "name": "招牌牛肉面", "price": 28.0, "quantity": 2 }],
  "total_amount": "56.00", "delivery_fee": "5.00", "paid_amount": "61.00",
  "status": "pending", "note": "不要辣",
  "created_at": "2026-07-08T12:00:00+08:00",
  "paid_at": null, "accepted_at": null, "prepared_at": null,
  "picked_at": null, "delivered_at": null
}
```

**订单状态流转**:
```
pending → paid → accepted → preparing → ready → picked → delivered
         ↓        ↓
       cancelled cancelled
```

| 状态 | 说明 |
|------|------|
| pending | 待支付 |
| paid | 已支付，待商家接单 |
| accepted | 商家已接单 |
| preparing | 备餐中 |
| ready | 出餐完成，待骑手取餐 |
| picked | 骑手已取餐，配送中 |
| delivered | 已送达 |
| finished | 订单已完成（客户确认） |
| cancelled | 已取消（支付前客户取消 / 商家拒单） |

---

### 客户端接口

#### 订单列表

```
GET /api/v1/orders/
```

**需要认证**

**查询参数**: `status`（订单状态过滤）

**响应** `data`: `{ "items": [订单对象, ...], "total": N }`

#### 订单详情

```
GET /api/v1/orders/<id>/
```

**需要认证**

**响应** `data`: 订单对象。

**错误码**: 4002 订单不存在

#### 创建订单

```
POST /api/v1/orders/create/
```

**需要认证**

**请求**:
```json
{
  "merchant_id": 1,
  "items": [
    { "product_id": 301, "quantity": 2 }
  ],
  "address_snapshot": {
    "name": "张三", "phone": "13800138000", "address": "朝阳区建国门外大街1号"
  },
  "note": "不要辣"
}
```

**响应** `data`: 订单对象（HTTP 201）。

**错误码**:
- 9001 参数错误（merchant_id/items 缺失，quantity 非正整数）
- 3001 商家不存在
- 3002 商品不存在（product_id 不属于该商家）
- 3003 `<商品名>` 已下架
- 3004 `<商品名>` 库存不足
- 3005 未达起送金额（total < merchant.min_order）
- 9999 系统繁忙，请重试

> 下单成功后商品 stock 原子扣减，sales_count 同步递增。取消/拒单后自动恢复。

#### 支付订单

```
POST /api/v1/orders/<id>/pay/
```

**需要认证**（仅限订单所属客户，且 status=pending）

**响应** `data`: 订单对象。

**错误码**: 4002 订单不存在或已支付

#### 取消订单

```
POST /api/v1/orders/<id>/cancel/
```

**需要认证**（仅限订单所属客户，且 status=pending/paid）

**响应** `data`: null

**错误码**: 4001 订单状态不允许取消 · 4002 订单不存在

---

### 商家端接口

#### 订单列表

```
GET /api/v1/merchant/orders/
```

**需要认证**

**查询参数**: `status`

**响应** `data`: `{ "items": [...], "total": N }`

**错误码**: 3001 商家不存在

#### 接单

```
POST /api/v1/merchant/orders/<id>/accept/
```

**需要认证**（status 必须为 paid）

**响应** `data`: 订单对象。

**错误码**: 3001 商家不存在 · 4002 订单不存在或状态不正确

#### 拒单

```
POST /api/v1/merchant/orders/<id>/reject/
```

**需要认证**（status 必须为 paid，拒单后自动恢复库存）

**响应** `data`: null

**错误码**: 3001 商家不存在 · 4002 订单不存在

#### 确认出餐（accepted → preparing）

```
POST /api/v1/merchant/orders/<id>/prepare/
```

**需要认证**（status 必须为 accepted）

**响应** `data`: 订单对象。

**错误码**: 3001 商家不存在 · 4002 订单不存在或状态不正确

#### 出餐完成（preparing → ready）

```
POST /api/v1/merchant/orders/<id>/ready/
```

**需要认证**（status 必须为 preparing，记录 prepared_at 时间戳）

**响应** `data`: 订单对象。

**错误码**: 3001 商家不存在 · 4002 订单不存在或状态不正确

---

### 骑手端接口

#### 可接单列表

```
GET /api/v1/rider/orders/available/
```

**需要认证 + rider 角色**（status=ready 且未分配骑手）

**响应** `data`: `{ "items": [...], "total": N }`

**错误码**: 5001 骑手信息不存在（无 rider 角色）

#### 我的配送单

```
GET /api/v1/rider/orders/mine/
```

**需要认证**

**查询参数**: `status`

**响应** `data`: `{ "items": [...], "total": N }`

**错误码**: 5001 骑手信息不存在

#### 抢单

```
POST /api/v1/rider/orders/<id>/grab/
```

**需要认证**（status=ready + rider_id IS NULL，使用行锁防止并发抢单）

**响应** `data`: 订单对象。

**错误码**: 5001 骑手信息不存在 · 4002 订单不存在或已被抢

#### 确认取餐（ready → picked）

```
POST /api/v1/rider/orders/<id>/pickup/
```

**需要认证**（status=ready，且订单 rider 为当前骑手）

**响应** `data`: 订单对象。

**错误码**: 5001 骑手信息不存在 · 4002 订单不存在

#### 确认送达（picked → delivered）

```
POST /api/v1/rider/orders/<id>/deliver/
```

**需要认证**（status=picked，且订单 rider 为当前骑手）

**响应** `data`: 订单对象。

**错误码**: 5001 骑手信息不存在 · 4002 订单不存在

---

## 六、地址模块

### 地址列表 / 创建

```
GET  /api/v1/addresses/
POST /api/v1/addresses/
```

**需要认证**

`POST` 请求体:
```json
{
  "tag": "家", "contact_name": "张三", "contact_phone": "13800138000",
  "address": "朝阳区建国门外大街1号", "is_default": false
}
```

`GET` 响应 `data`: `{ "items": [地址对象, ...], "total": N }`

`POST` 响应 `data`: 地址对象（HTTP 201）。

**地址对象字段**: `{ id, tag, contact_name, contact_phone, address, is_default, created_at }`

**错误码**: 9001 参数错误

### 地址详情 / 更新 / 删除

```
GET    /api/v1/addresses/<id>/
PATCH  /api/v1/addresses/<id>/
DELETE /api/v1/addresses/<id>/
```

**需要认证**

`PATCH` 请求体: 所有字段可选。

**错误码**: 9001 参数错误 · 2003 地址不存在

### 设为默认地址

```
POST /api/v1/addresses/<id>/set_default/
```

**需要认证**（原子操作，先清除其他默认，再设置当前）

**响应** `data`: null

**错误码**: 2003 地址不存在

---

## 七、优惠券模块

### 优惠券列表

```
GET /api/v1/coupons/
```

**无需认证**

**查询参数**: `merchant_id`（按商家过滤）

**响应** `data`: `{ "items": [优惠券对象, ...], "total": N }`

**优惠券对象字段**: `{ id, name, discount_amount, min_spend, valid_until, merchant_name, is_active }`

### 优惠券详情

```
GET /api/v1/coupons/<id>/
```

**无需认证**

**错误码**: 5001 优惠券不存在

### 领取优惠券

```
POST /api/v1/coupons/<id>/claim/
```

**需要认证**

**响应** `data`: `{ id, coupon: {优惠券字段}, status: "unused", used_at: null, created_at: ... }`

**错误码**: 5001 优惠券不存在 · 5002 已领取过 · 5003 优惠券已过期

### 我的优惠券

```
GET /api/v1/user/coupons/
```

**需要认证**

**查询参数**: `status`（`unused` / `used` / `expired`）

**响应** `data`: `{ "items": [...], "total": N }`

---

## 八、骑手模块

### 我的骑手信息

```
GET   /api/v1/riders/me/
PATCH /api/v1/riders/me/
```

**需要认证**

**响应** `data`:
```json
{
  "id": 1, "real_name": "王师傅", "phone": "139...",
  "station": "中关村配送站",
  "work_status": "idle",
  "balance": "186.50", "total_orders": 820,
  "rating": "4.99", "created_at": "..."
}
```

`PATCH` 可更新字段: `real_name`, `phone`, `station`, `work_status`（`balance`/`total_orders`/`rating` 只读）

**错误码**: 9001 参数错误 · 5001 骑手信息不存在

### 更新工作状态

```
POST /api/v1/riders/me/status/
```

**需要认证**

**请求**: `{ "work_status": "idle" }`

`work_status` 可选值: `offline` | `idle` | `busy` | `delivering`

**响应** `data`: 骑手完整字段。

**错误码**: 9001 参数错误（无效状态值）· 5001 骑手信息不存在

---

## 九、评价模块

### 商家评价列表

```
GET /api/v1/merchants/<merchant_id>/reviews/
```

**无需认证**

**响应** `data`: `{ "items": [评价对象, ...], "total": N }`

**评价对象字段**: `{ id, order, customer_phone, merchant, rating, content, images, reply, replied_at, created_at }`

### 提交评价

```
POST /api/v1/reviews/create/
```

**需要认证**（订单必须属于当前用户，且 status 为 `delivered` 或 `finished`）

**请求**:
```json
{ "order": 1, "rating": 5, "content": "好吃！", "images": null }
```

**响应** `data`: 评价对象（HTTP 201）。

**错误码**:
- 9001 参数错误（order 缺失或 rating 不在 1-5）
- 4002 订单不存在
- 4003 订单尚未完成，无法评价
- 6001 该订单已评价

### 商家回复评价

```
POST /api/v1/reviews/<id>/reply/
```

**需要认证**（仅限评价所属商家）

**请求**: `{ "reply": "感谢您的支持！" }`

**响应** `data`: 评价对象。

**错误码**: 9001 参数错误 · 3001 商家不存在 · 6002 评价不存在

---

## 十、管理后台（IsAdmin 权限）

### 数据看板

```
GET /api/v1/admin/dashboard/
```

**响应** `data`:
```json
{
  "gmv": 7861.0,
  "order_count": 19,
  "merchant_count": 21,
  "user_count": 44,
  "cancelled_count": 0
}
```

### 用户列表

```
GET /api/v1/admin/users/
```

**查询参数**: `role`（角色名过滤）· `status`（`active` / `banned`）

**响应** `data`: `{ "items": [{id, phone, email, avatar, status, roles, date_joined}], "total": N }`

### 封禁 / 解封用户

```
POST /api/v1/admin/users/<id>/ban/
POST /api/v1/admin/users/<id>/unban/
```

**响应** `data`: 用户完整字段。

**错误码**: 1001 用户不存在

### 商家列表（管理端）

```
GET /api/v1/admin/merchants/
```

**查询参数**: `status`（`open` / `closed`）

**响应** `data`: `{ "items": [商家完整字段, ...], "total": N }`

### 更新商家状态

```
POST /api/v1/admin/merchants/<id>/status/
```

**请求**: `{ "status": "open" }` 或 `{ "status": "closed" }`

**响应** `data`: 商家完整字段。

**错误码**: 9001 参数错误 · 3001 商家不存在

---

## 十一、文件上传

### 上传图片

```
POST /api/v1/uploads/
```

**需要认证**

**请求**: `multipart/form-data`，字段名 `file`

**约束**: 类型限 `image/jpeg` / `image/png` / `image/webp` / `image/gif`；大小 ≤ 5 MB

**响应** `data`:
```json
{ "id": 1, "url": "http://localhost:8000/media/uploads/2026/07/xxx.png", "content_type": "image/png", "created_at": "..." }
```

**错误码**: 9001 未提供文件 · 9002 不支持的文件类型 · 9003 文件过大

---

## 十二、未实现的接口

以下功能在代码仓库中**无可用 HTTP 端点**（模型/设计文档存在，但视图/URL 均未实现）：

| 功能 | 说明 |
|------|------|
| 支付记录 | `payments` app 无模型、无视图 |
| 消息通知 | `notifications` app 无模型、无视图 |
| 退款流程 | Order 状态枚举含 `refunding/refunded`，但无对应端点 |
| 商品审核 | 设计文档有 `/admin/products/` 接口，未实现 |
| 骑手收益统计 | 无 analytics 模型，无端点 |
| WebSocket 实时推送 | Channels 已配置（`InMemoryChannelLayer`），无 Consumer 实现 |
