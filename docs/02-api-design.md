# 02 - API 接口设计

## 1. 设计约定

### 1.1 URL 命名规范

```
/api/v1/{resource}/                    # 资源集合
/api/v1/{resource}/{id}/               # 单个资源
/api/v1/{resource}/{id}/{action}/      # 资源上的动作(非CRUD)
```

**规则**:
- 资源名使用小写复数 (`/orders/`, `/products/`)
- 动作使用小写动词 (`/cancel/`, `/accept/`)
- 复合资源不超过两层嵌套 (`/merchants/{id}/products/`)
- 公开浏览接口使用资源复数 (`/merchants/`)
- 角色专属管理接口用单数前缀 (`/merchant/` 语义为"我的店铺"，`/rider/` 语义为"我的配送")
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

- **JWT Bearer Token**: `Authorization: Bearer <access_token>`
- **Access Token 有效期**: 2小时
- **Refresh Token 有效期**: 7天
- **Token 刷新接口**: `POST /api/v1/auth/refresh/`

### 1.4 分页参数

使用基于 `page` + `page_size` 的分页：
- 默认 `page=1`, `page_size=20`
- 最大 `page_size=100`

### 1.5 错误码分段

| 码段 | 模块 | 示例 |
|------|------|------|
| 0 | 成功 | — |
| 1000-1999 | 认证与授权 | 1001: token过期, 1003: 权限不足 |
| 2000-2999 | 用户 | 2001: 手机号已注册, 2002: 地址数量超限 |
| 3000-3999 | 商家与商品 | 3001: 店铺休息中, 3002: 商品已下架, 3003: 库存不足 |
| 4000-4999 | 订单 | 4001: 订单状态不允许此操作, 4002: 订单不存在 |
| 5000-5999 | 配送 | 5001: 配送员不可用, 5002: 转单失败 |
| 6000-6999 | 支付 | 6001: 支付失败, 6002: 退款金额超额 |
| 7000-7999 | 营销 | 7001: 优惠券已过期, 7002: 不满足使用条件 |
| 9000-9999 | 系统通用 | 9001: 参数校验失败, 9002: 服务异常 |

---

## 2. 接口清单

### 2.1 认证模块 (Auth)

#### 2.1.1 发送短信验证码
```
POST /api/v1/auth/sms/send/
```

**请求**:
```json
{
  "phone": "13800138000",
  "type": "register"  // register/login/reset_password
}
```

**响应**:
```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": {
    "expire_in": 300  // 秒
  }
}
```

#### 2.1.2 注册
```
POST /api/v1/auth/register/
```

**请求**:
```json
{
  "phone": "13800138000",
  "password": "password123",
  "sms_code": "123456",
  "role": "customer"  // customer/merchant/rider
}
```

**响应**:
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user_id": 1,
    "phone": "13800138000",
    "access_token": "eyJ0eXAiOiJKV1QiLCJh...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJh...",
    "expires_in": 7200
  }
}
```

#### 2.1.3 登录
```
POST /api/v1/auth/login/
```

**请求**:
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**: 同注册响应

#### 2.1.4 刷新 Token
```
POST /api/v1/auth/refresh/
```

**请求**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJh...",
    "expires_in": 7200
  }
}
```

#### 2.1.5 登出
```
POST /api/v1/auth/logout/
```

**请求**: 无 body（通过 token 识别用户）

**响应**:
```json
{
  "code": 0,
  "message": "登出成功",
  "data": null
}
```

---

### 2.2 用户模块 (Users)

#### 2.2.1 获取当前用户信息
```
GET /api/v1/users/me/
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "avatar": "https://...",
    "roles": ["customer"],
    "status": "active",
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

#### 2.2.2 更新用户信息
```
PATCH /api/v1/users/me/
```

**请求**:
```json
{
  "avatar": "https://...",
  "email": "user@example.com"
}
```

---

### 2.3 地址模块 (Addresses)

#### 2.3.1 获取地址列表
```
GET /api/v1/addresses/
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "tag": "家",
        "contact_name": "张三",
        "contact_phone": "138****0001",
        "province": "上海市",
        "city": "上海市",
        "district": "浦东新区",
        "address": "花园小区 3-201",
        "latitude": 31.2304,
        "longitude": 121.4737,
        "is_default": true
      }
    ],
    "total": 3
  }
}
```

#### 2.3.2 创建地址
```
POST /api/v1/addresses/
```

**请求**:
```json
{
  "tag": "公司",
  "contact_name": "张三",
  "contact_phone": "13800138000",
  "province": "上海市",
  "city": "上海市",
  "district": "浦东新区",
  "address": "科技园区 A座 1501",
  "latitude": 31.2304,
  "longitude": 121.4737,
  "is_default": false
}
```

#### 2.3.3 更新地址
```
PATCH /api/v1/addresses/{id}/
```

#### 2.3.4 删除地址
```
DELETE /api/v1/addresses/{id}/
```

#### 2.3.5 设置默认地址
```
POST /api/v1/addresses/{id}/set_default/
```

---

### 2.4 商家模块 (Merchants)

#### 2.4.1 获取商家列表（公开）
```
GET /api/v1/merchants/
```

**查询参数**:
- `latitude`: 用户纬度
- `longitude`: 用户经度
- `category`: 分类筛选
- `keyword`: 搜索关键词
- `sort`: 排序方式 (distance/rating/sales)

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "store_name": "麦当劳 (国贸商城店)",
        "logo": "https://...",
        "rating": 4.8,
        "monthly_sales": 1520,
        "min_order": 15.0,
        "delivery_fee": 5.0,
        "distance_km": 1.2,
        "business_hours": {"start": "08:00", "end": "22:00"},
        "status": "open"
      }
    ],
    "total": 42,
    "page": 1,
    "page_size": 20
  }
}
```

#### 2.4.2 获取商家详情（公开）
```
GET /api/v1/merchants/{id}/
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "store_name": "麦当劳 (国贸商城店)",
    "logo": "https://...",
    "phone": "021-12345678",
    "address": "浦东新区XX路XX号",
    "latitude": 31.2304,
    "longitude": 121.4737,
    "rating": 4.8,
    "monthly_sales": 1520,
    "min_order": 15.0,
    "delivery_fee": 5.0,
    "notice": "本店支持开发票",
    "business_hours": {"start": "08:00", "end": "22:00"},
    "status": "open"
  }
}
```

#### 2.4.3 获取我的店铺信息（商家）
```
GET /api/v1/merchant/store/
```

#### 2.4.4 更新店铺信息（商家）
```
PATCH /api/v1/merchant/store/
```

**请求**:
```json
{
  "store_name": "麦当劳 (国贸商城店)",
  "logo": "https://...",
  "notice": "本店今日休息",
  "business_hours": {"start": "09:00", "end": "21:00"}
}
```

#### 2.4.5 开关店（商家）
```
POST /api/v1/merchant/store/toggle/
```

**请求**:
```json
{
  "status": "open"  // open/closed
}
```

---

### 2.5 商品模块 (Products)

#### 2.5.1 获取商家商品列表（公开）
```
GET /api/v1/merchants/{merchant_id}/products/
```

**查询参数**:
- `category`: 分类ID
- `status`: on/off (商家端查看时可传 off)

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 301,
        "name": "招牌红烧牛肉面",
        "description": "精选牛肉，汤底浓郁",
        "image": "https://...",
        "price": 28.0,
        "original_price": 32.0,
        "stock": 999,
        "status": "on",
        "sales_count": 1200,
        "rating": 4.9,
        "category": {"id": 1, "name": "主食"},
        "specs": [
          {"name": "小份", "price_diff": 0},
          {"name": "大份", "price_diff": 5}
        ]
      }
    ],
    "total": 15
  }
}
```

#### 2.5.2 获取商品详情（公开）
```
GET /api/v1/products/{id}/
```

#### 2.5.3 创建商品（商家）
```
POST /api/v1/merchant/products/
```

**请求**:
```json
{
  "name": "招牌红烧牛肉面",
  "description": "精选牛肉，汤底浓郁",
  "image": "https://...",
  "category_id": 1,
  "price": 28.0,
  "original_price": 32.0,
  "stock": 100,
  "specs": [
    {"name": "小份", "price_diff": 0},
    {"name": "大份", "price_diff": 5}
  ]
}
```

#### 2.5.4 更新商品（商家）
```
PATCH /api/v1/merchant/products/{id}/
```

#### 2.5.5 上下架商品（商家）
```
POST /api/v1/merchant/products/{id}/toggle/
```

**请求**:
```json
{
  "status": "on"  // on/off
}
```

#### 2.5.6 删除商品（商家）
```
DELETE /api/v1/merchant/products/{id}/
```

---

### 2.6 订单模块 (Orders)

#### 2.6.1 创建订单（客户）
```
POST /api/v1/orders/
```

**请求**:
```json
{
  "merchant_id": 1,
  "address_id": 1,
  "items": [
    {
      "product_id": 301,
      "spec": "大份",
      "quantity": 2
    }
  ],
  "coupon_id": 5,
  "note": "不要洋葱",
  "payment_method": "alipay"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "订单创建成功",
  "data": {
    "order_id": 20260706001,
    "order_no": "OD20260706001",
    "total_amount": 66.0,
    "discount_amount": 5.0,
    "delivery_fee": 5.0,
    "paid_amount": 66.0,
    "payment_url": "https://...",  // 支付跳转URL
    "status": "pending"
  }
}
```

#### 2.6.2 获取订单列表（客户）
```
GET /api/v1/orders/
```

**查询参数**:
- `status`: 订单状态筛选

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 20260706001,
        "order_no": "OD20260706001",
        "merchant": {
          "id": 1,
          "name": "麦当劳 (国贸商城店)",
          "logo": "https://..."
        },
        "items": [
          {
            "product_name": "招牌红烧牛肉面",
            "spec": "大份",
            "quantity": 2,
            "unit_price": 33.0,
            "subtotal": 66.0
          }
        ],
        "total_amount": 66.0,
        "paid_amount": 66.0,
        "status": "delivering",
        "rider": {
          "name": "王师傅",
          "phone": "139****1234"
        },
        "created_at": "2026-07-06T12:30:00Z",
        "estimated_delivery_at": "2026-07-06T13:15:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "page_size": 20
  }
}
```

#### 2.6.3 获取订单详情
```
GET /api/v1/orders/{id}/
```

#### 2.6.4 取消订单（客户）
```
POST /api/v1/orders/{id}/cancel/
```

**请求**:
```json
{
  "reason": "下错了"
}
```

#### 2.6.5 申请退款（客户）
```
POST /api/v1/orders/{id}/refund/
```

**请求**:
```json
{
  "reason": "商品有问题",
  "images": ["https://...", "https://..."]
}
```

#### 2.6.6 确认收货（客户）
```
POST /api/v1/orders/{id}/confirm/
```

#### 2.6.7 催单（客户）
```
POST /api/v1/orders/{id}/urge/
```

---

### 2.7 商家订单管理

#### 2.7.1 获取订单列表（商家）
```
GET /api/v1/merchant/orders/
```

**查询参数**:
- `status`: pending/accepted/preparing/ready

#### 2.7.2 接单（商家）
```
POST /api/v1/merchant/orders/{id}/accept/
```

#### 2.7.3 拒单（商家）
```
POST /api/v1/merchant/orders/{id}/reject/
```

**请求**:
```json
{
  "reason": "今日食材用完"
}
```

#### 2.7.4 确认出餐（商家）
```
POST /api/v1/merchant/orders/{id}/prepare/
```

---

### 2.8 骑手订单管理

#### 2.8.1 获取可接单列表（骑手）
```
GET /api/v1/rider/orders/available/
```

**查询参数**:
- `latitude`: 当前纬度
- `longitude`: 当前经度

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 20260706001,
        "order_no": "OD20260706001",
        "type": "蜂鸟专送",
        "merchant": {
          "name": "麦当劳 (国贸商城店)",
          "address": "浦东新区XX路XX号",
          "latitude": 31.2304,
          "longitude": 121.4737
        },
        "customer_address": "浦东新区花园小区 3-201",
        "distance_km": 2.4,
        "delivery_fee": 8.5,
        "estimated_duration": 30,
        "created_at": "2026-07-06T12:30:00Z"
      }
    ],
    "total": 8
  }
}
```

#### 2.8.2 抢单（骑手）
```
POST /api/v1/rider/orders/{id}/grab/
```

#### 2.8.3 获取我的配送单（骑手）
```
GET /api/v1/rider/orders/mine/
```

**查询参数**:
- `status`: pickup/delivering/completed

#### 2.8.4 到店（骑手）
```
POST /api/v1/rider/orders/{id}/arrive/
```

#### 2.8.5 取餐（骑手）
```
POST /api/v1/rider/orders/{id}/pickup/
```

#### 2.8.6 送达（骑手）
```
POST /api/v1/rider/orders/{id}/deliver/
```

#### 2.8.7 上报异常（骑手）
```
POST /api/v1/rider/orders/{id}/report_exception/
```

**请求**:
```json
{
  "exception_type": "out_of_stock",  // out_of_stock/wrong_address/unreachable
  "description": "商家缺货，客户要求退款",
  "images": ["https://..."]
}
```

#### 2.8.8 更新工作状态（骑手）
```
POST /api/v1/rider/status/
```

**请求**:
```json
{
  "status": "idle",  // offline/idle/busy/delivering
  "latitude": 31.2304,
  "longitude": 121.4737
}
```

---

### 2.9 评价模块 (Reviews)

#### 2.9.1 创建评价（客户）
```
POST /api/v1/reviews/
```

**请求**:
```json
{
  "order_id": 20260706001,
  "food_rating": 5,
  "delivery_rating": 4,
  "content": "牛肉很大块，汤底浓郁",
  "images": ["https://..."],
  "is_anonymous": false
}
```

#### 2.9.2 获取商家评价列表（公开）
```
GET /api/v1/merchants/{merchant_id}/reviews/
```

#### 2.9.3 商家回复评价
```
POST /api/v1/merchant/reviews/{id}/reply/
```

**请求**:
```json
{
  "reply": "感谢您的好评，欢迎再次光临！"
}
```

---

### 2.10 优惠券模块 (Coupons)

#### 2.10.1 获取可领取优惠券列表（客户）
```
GET /api/v1/coupons/available/
```

**查询参数**:
- `merchant_id`: 指定商家（可选）

#### 2.10.2 领取优惠券（客户）
```
POST /api/v1/coupons/{id}/claim/
```

#### 2.10.3 获取我的优惠券（客户）
```
GET /api/v1/coupons/mine/
```

**查询参数**:
- `status`: unused/used/expired

---

### 2.11 营销活动模块 (Campaigns)

#### 2.11.1 创建活动（商家）
```
POST /api/v1/merchant/campaigns/
```

**请求**:
```json
{
  "name": "满30减5",
  "type": "full_reduction",
  "rules": {
    "min_spend": 30,
    "discount": 5
  },
  "scope": "全部商品",
  "start_at": "2026-07-01T00:00:00Z",
  "end_at": "2026-07-31T23:59:59Z"
}
```

#### 2.11.2 获取活动列表（商家）
```
GET /api/v1/merchant/campaigns/
```

#### 2.11.3 更新活动（商家）
```
PATCH /api/v1/merchant/campaigns/{id}/
```

#### 2.11.4 结束活动（商家）
```
POST /api/v1/merchant/campaigns/{id}/end/
```

---

### 2.12 管理后台模块 (Admin)

#### 2.12.1 数据看板
```
GET /api/v1/admin/dashboard/
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "gmv": 1285600.0,
    "gmv_change": 12.5,
    "order_count": 45670,
    "order_count_change": 8.9,
    "dau": 89012,
    "dau_change": 5.2,
    "new_merchants": 128,
    "refund_rate": 2.3,
    "delivery_timeout_rate": 4.1
  }
}
```

#### 2.12.2 用户管理
```
GET /api/v1/admin/users/
POST /api/v1/admin/users/{id}/ban/     # 封禁
POST /api/v1/admin/users/{id}/unban/   # 解封
```

#### 2.12.3 商家审核
```
GET /api/v1/admin/merchants/applications/
POST /api/v1/admin/merchants/applications/{id}/approve/
POST /api/v1/admin/merchants/applications/{id}/reject/
```

**请求（拒绝）**:
```json
{
  "reason": "营业执照不清晰"
}
```

#### 2.12.4 结算管理
```
GET /api/v1/admin/settlements/
POST /api/v1/admin/settlements/{id}/pay/
```

#### 2.12.5 系统配置
```
GET /api/v1/admin/config/
PATCH /api/v1/admin/config/
```

**请求**:
```json
{
  "commission_rate": 10,
  "min_withdraw": 100,
  "delivery_timeout": 30
}
```

---

## 3. WebSocket 实时通知

### 3.1 连接
```
ws://localhost:8000/ws/notifications/?token=<access_token>
```

### 3.2 消息格式

#### 3.2.1 新订单通知（商家）
```json
{
  "type": "new_order",
  "data": {
    "order_id": 20260706001,
    "order_no": "OD20260706001",
    "customer_name": "张三",
    "items_count": 3,
    "total_amount": 66.0,
    "note": "不要洋葱",
    "created_at": "2026-07-06T12:30:00Z"
  }
}
```

#### 3.2.2 派单通知（骑手）
```json
{
  "type": "order_assigned",
  "data": {
    "order_id": 20260706001,
    "merchant_name": "麦当劳 (国贸商城店)",
    "merchant_address": "浦东新区XX路XX号",
    "customer_address": "浦东新区花园小区 3-201",
    "delivery_fee": 8.5
  }
}
```

#### 3.2.3 订单状态更新（客户）
```json
{
  "type": "order_status_changed",
  "data": {
    "order_id": 20260706001,
    "status": "delivering",
    "rider": {
      "name": "王师傅",
      "phone": "139****1234"
    }
  }
}
```

---

## 4. 通用规范

### 4.1 时间格式
- 统一使用 ISO 8601: `2026-07-06T12:30:00Z` (UTC)

### 4.2 金额格式
- 统一使用 Decimal，保留两位小数
- 单位：元

### 4.3 图片上传
```
POST /api/v1/upload/image/
Content-Type: multipart/form-data

file: <binary>
```

**响应**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/images/xxx.jpg"
  }
}
```

### 4.4 限流
- 短信验证码: 1次/60秒，10次/天
- 登录接口: 5次/分钟
- 创建订单: 10次/分钟
- 其他接口: 100次/分钟

### 4.5 CORS
- 允许来源: 前端四个应用的域名
- 允许方法: GET, POST, PATCH, DELETE, OPTIONS
- 允许头: Authorization, Content-Type
