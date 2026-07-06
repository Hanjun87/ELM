# 02 - 数据库设计

## 1. 设计原则

- **命名规范**：表名使用小写蛇形命名 + 复数形式 (e.g., `users`, `order_items`)；字段名使用小写蛇形命名
- **主键**：统一使用 `id` (BigAutoField)，不使用复合主键
- **时间戳**：所有表统一 `created_at`, `updated_at`（审计必备）
- **外键**：使用 Django ORM 的 `ForeignKey`，数据库层添加真实外键约束 (生产环境视分库分表策略可降级为逻辑外键)
- **索引**：外键字段、高频查询字段、排序字段建立索引
- **软删除**：核心业务表添加 `is_deleted` 字段
- **金额**：`DecimalField(max_digits=10, decimal_places=2)`
- **经纬度**：`DecimalField(max_digits=9, decimal_places=6)`

## 2. ERD 总览

```
┌──────────┐     ┌───────────────┐     ┌────────────┐
│   Role   │────<│  User_Role    │>────│    User    │
└──────────┘     └───────────────┘     └────────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │ 1                 │ 1                 │ 1
                    ┌────▼────┐       ┌──────▼──────┐     ┌─────▼────┐
                    │ Merchant│       │    Rider     │     │ Address  │
                    └────┬────┘       └──────┬───────┘     └──────────┘
                         │ 1                 │ N
                    ┌────▼────┐       ┌──────▼───────┐
                    │ Product │       │   Order      │
                    └────┬────┘       └──┬───┬───┬───┘
                         │ 1             │   │   │
                    ┌────▼────┐     ┌────▼┐  │   └──────────┐
                    │OrderItem│     │Payment│  └──┐    ┌─────▼──────┐
                    └─────────┘     └──────┘     │    │ Complaint  │
                                           ┌─────▼──┐ └────────────┘
                                           │ Review │
                                           └────────┘
```

## 3. 建表详细设计

### 3.1 用户与认证模块 (users app)

#### users (自定义用户表，替代 Django 默认 User)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 用户ID |
| username | CharField(150) | UNIQUE, NOT NULL | 用户名 |
| phone | CharField(11) | UNIQUE, NOT NULL, INDEX | 手机号 |
| email | EmailField(254) | UNIQUE, NULLABLE | 邮箱 |
| password | CharField(128) | NOT NULL | 密码哈希 |
| avatar | ImageField | NULLABLE | 头像 |
| is_active | BooleanField | DEFAULT=True | 账号状态 |
| is_staff | BooleanField | DEFAULT=False | Django Admin权限 |
| last_login | DateTimeField | NULLABLE | 最后登录时间 |
| created_at | DateTimeField | auto_now_add | 注册时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |

索引：`phone_idx`, `email_idx`, `is_active_idx`

#### roles (角色表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 角色ID |
| name | CharField(50) | UNIQUE, NOT NULL | 角色名 (customer/merchant/rider/admin) |
| code | CharField(50) | UNIQUE, NOT NULL | 角色编码，程序中引用 |
| description | CharField(200) | NULLABLE | 描述 |
| created_at | DateTimeField | auto_now_add | 创建时间 |

#### user_roles (用户-角色关联表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| user | ForeignKey(User) | NOT NULL, CASCADE | |
| role | ForeignKey(Role) | NOT NULL, CASCADE | |
| created_at | DateTimeField | auto_now_add | 授权时间 |

约束：`UNIQUE (user_id, role_id)`

> 注意：UNIQUE 约束自动创建索引，无需额外的 `user_role_idx`。

#### user_addresses (收货地址表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| user | ForeignKey(User) | NOT NULL, CASCADE | |
| contact_name | CharField(50) | NOT NULL | 收件人姓名 |
| contact_phone | CharField(11) | NOT NULL | 收件人电话 |
| province | CharField(50) | NOT NULL | 省 |
| city | CharField(50) | NOT NULL | 市 |
| district | CharField(50) | NOT NULL | 区 |
| detail | CharField(255) | NOT NULL | 详细地址 |
| latitude | DecimalField(9,6) | NULLABLE | 纬度 |
| longitude | DecimalField(9,6) | NULLABLE | 经度 |
| is_default | BooleanField | DEFAULT=False | 是否默认地址 |
| is_deleted | BooleanField | DEFAULT=False | 软删除 |
| created_at | DateTimeField | auto_now_add | |
| updated_at | DateTimeField | auto_now | |

索引：`user_addr_idx (user_id, is_deleted)`

### 3.2 商家与商品模块 (merchants app)

#### merchants (商家信息表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 商家ID |
| user | OneToOneField(User) | NOT NULL, CASCADE | 关联登录账号 |
| name | CharField(100) | NOT NULL | 店铺名称 |
| logo | ImageField | NULLABLE | 店铺Logo |
| phone | CharField(20) | NOT NULL | 联系电话 |
| address | CharField(255) | NOT NULL | 店铺地址 |
| latitude | DecimalField(9,6) | NOT NULL | 纬度 |
| longitude | DecimalField(9,6) | NOT NULL | 经度 |
| region | CharField(100) | NOT NULL, DEFAULT='' | 所属配送区域 |
| business_hours | JSONField | DEFAULT=dict | `{"mon":{"open":"08:00","close":"22:00"}, ...}` |
| min_order_amount | DecimalField(10,2) | DEFAULT=0.00 | 起送金额 |
| delivery_fee | DecimalField(10,2) | DEFAULT=0.00 | 配送费 |
| delivery_radius | IntegerField | DEFAULT=3000 | 配送范围(米) |
| notice | CharField(500) | NULLABLE | 店铺公告 |
| status | CharField(20) | DEFAULT='closed' | open(营业中)/closed(休息中)/pending(审核中) |
| is_deleted | BooleanField | DEFAULT=False | |
| created_at | DateTimeField | auto_now_add | |
| updated_at | DateTimeField | auto_now | |

索引：`merchant_status_idx (status, is_deleted)`, `merchant_geo_idx (latitude, longitude)` (若使用PostGIS则为GiST索引)

#### categories (商品分类表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| merchant | ForeignKey(Merchant) | NOT NULL, CASCADE | 所属商家 |
| name | CharField(100) | NOT NULL | 分类名称 |
| icon | CharField(255) | NULLABLE | 分类图标URL |
| sort_order | IntegerField | DEFAULT=0 | 排序权重，值越大越靠前 |
| is_deleted | BooleanField | DEFAULT=False | |
| created_at | DateTimeField | auto_now_add | |

约束：`UNIQUE (merchant_id, name)` (同一商家下分类名唯一)
索引：`cat_merchant_idx (merchant_id, sort_order)`

#### products (商品表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| merchant | ForeignKey(Merchant) | NOT NULL, CASCADE | 所属商家 |
| category | ForeignKey(Category) | NOT NULL, PROTECT | 所属分类 |
| name | CharField(200) | NOT NULL | 商品名称 |
| description | TextField | NULLABLE | 商品描述 |
| image | ImageField | NOT NULL | 商品主图 |
| price | DecimalField(10,2) | NOT NULL | 销售价格 |
| original_price | DecimalField(10,2) | NULLABLE | 原价 (划线价) |
| stock | IntegerField | DEFAULT=0 | 可用库存 |
| reserved_stock | IntegerField | DEFAULT=0 | 预占库存 (下单未支付) |
| sales_count | IntegerField | DEFAULT=0 | 累计销量 |
| status | CharField(10) | DEFAULT='off' | on(上架)/off(下架) |
| is_recommended | BooleanField | DEFAULT=False | 是否推荐 |
| sort_order | IntegerField | DEFAULT=0 | 排序权重 |
| is_deleted | BooleanField | DEFAULT=False | |
| created_at | DateTimeField | auto_now_add | |
| updated_at | DateTimeField | auto_now | |

索引：`prod_merchant_idx (merchant_id, status, is_deleted)`, `prod_category_idx (category_id)`, `prod_name_idx (name)` (全文索引用于搜索)

#### product_specs (商品规格表，支持多规格如“大小份”、“辣度”)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| product | ForeignKey(Product) | NOT NULL, CASCADE | |
| name | CharField(100) | NOT NULL | 规格名 (e.g., "大份", "微辣") |
| price_modifier | DecimalField(10,2) | DEFAULT=0.00 | 价格修正 (可为负数) |
| stock | IntegerField | DEFAULT=0 | 规格独立库存 |
| is_deleted | BooleanField | DEFAULT=False | |
| created_at | DateTimeField | auto_now_add | |

索引：`spec_product_idx (product_id, is_deleted)`

#### product_images (商品图片表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| product | ForeignKey(Product) | NOT NULL, CASCADE | |
| image_url | URLField | NOT NULL | 图片URL |
| sort_order | IntegerField | DEFAULT=0 | |

### 3.3 配送员模块 (riders app)

#### riders (配送员信息表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| user | OneToOneField(User) | NOT NULL, CASCADE | 关联登录账号 |
| real_name | CharField(50) | NOT NULL | 真实姓名 |
| id_card | CharField(18) | NOT NULL | 身份证号 |
| phone | CharField(11) | NOT NULL | 联系电话 |
| region | CharField(100) | NOT NULL | 所属站点/区域 |
| work_status | CharField(20) | DEFAULT='offline' | online(空闲)/busy(配送中)/offline(休息) |
| balance | DecimalField(10,2) | DEFAULT=0.00 | 账户余额(可提现) |
| total_orders | IntegerField | DEFAULT=0 | 累计完成单量 |
| total_income | DecimalField(10,2) | DEFAULT=0.00 | 累计收入 |
| rating | DecimalField(3,2) | DEFAULT=5.00 | 评分 (1.00-5.00) |
| is_verified | BooleanField | DEFAULT=False | 是否通过审核 |
| is_deleted | BooleanField | DEFAULT=False | |
| created_at | DateTimeField | auto_now_add | |
| updated_at | DateTimeField | auto_now | |

索引：`rider_work_idx (work_status, is_deleted)`, `rider_region_idx (region)`

### 3.4 订单核心模块 (orders app)

#### orders (订单主表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| order_no | CharField(32) | UNIQUE, NOT NULL | 订单编号 (时间戳+随机数生成) |
| customer | ForeignKey(User) | NOT NULL, CASCADE, related_name='orders' | 下单客户 |
| merchant | ForeignKey(Merchant) | NOT NULL, PROTECT | 所属商家 |
| rider | ForeignKey(Rider) | NULLABLE, SET_NULL | 配送员 |
| address_snapshot | JSONField | NOT NULL | 收货地址快照 `{name, phone, province, city, district, detail, lat, lng}` |
| total_amount | DecimalField(10,2) | NOT NULL | 订单总金额(商品合计) |
| delivery_fee | DecimalField(10,2) | DEFAULT=0.00 | 配送费 |
| discount_amount | DecimalField(10,2) | DEFAULT=0.00 | 优惠金额 |
| paid_amount | DecimalField(10,2) | NOT NULL | 实付金额 = total_amount + delivery_fee - discount_amount |
| note | CharField(255) | NULLABLE | 订单备注 |
| status | CharField(20) | DEFAULT='pending_payment' | 见状态机文档 (DB层应添加CHECK约束) |
| cancel_reason | CharField(255) | NULLABLE | 取消原因 |
| expected_delivery_at | DateTimeField | NULLABLE | 预计送达时间 |
| paid_at | DateTimeField | NULLABLE | 支付时间 |
| accepted_at | DateTimeField | NULLABLE | 商家接单时间 |
| ready_at | DateTimeField | NULLABLE | 备餐完成时间 |
| picked_up_at | DateTimeField | NULLABLE | 骑手取餐时间 |
| delivered_at | DateTimeField | NULLABLE | 送达时间 |
| cancelled_at | DateTimeField | NULLABLE | 取消时间 |
| created_at | DateTimeField | auto_now_add | 下单时间 |
| updated_at | DateTimeField | auto_now | |

索引：
- `order_no_idx (order_no)` UNIQUE
- `order_customer_idx (customer_id, status, created_at)`
- `order_merchant_idx (merchant_id, status, created_at)`
- `order_rider_idx (rider_id, status)`
- `order_status_idx (status, created_at)`

> 注意：订单不设 `is_deleted` 字段，使用状态过滤实现"软删除"——已完成/已取消的订单通过 `status` 控制列表可见性，数据不可物理删除。

#### order_status_logs (订单状态变更日志)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| order | ForeignKey(Order) | NOT NULL, CASCADE | |
| from_status | CharField(20) | NOT NULL | 旧状态 |
| to_status | CharField(20) | NOT NULL | 新状态 |
| operator | ForeignKey(User) | NULLABLE, SET_NULL | 操作人 |
| operator_role | CharField(20) | NOT NULL | 操作者角色 |
| remark | CharField(500) | NULLABLE | 备注 |
| created_at | DateTimeField | auto_now_add | |

索引：`osl_order_idx (order_id, created_at)`

#### order_items (订单明细表，商品快照)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| order | ForeignKey(Order) | NOT NULL, CASCADE | |
| product | ForeignKey(Product) | NOT NULL, PROTECT | 原始商品引用 |
| product_name | CharField(200) | NOT NULL | 商品名称快照 |
| product_image | URLField | NOT NULL | 商品图片快照 |
| spec_name | CharField(100) | NULLABLE | 规格名称快照 |
| unit_price | DecimalField(10,2) | NOT NULL | 购买时单价 |
| quantity | IntegerField | NOT NULL | 购买数量 |
| subtotal | DecimalField(10,2) | NOT NULL | 小计 = unit_price × quantity |

索引：`oi_order_idx (order_id)`

#### cart_items (购物车表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| user | ForeignKey(User) | NOT NULL, CASCADE | |
| product | ForeignKey(Product) | NOT NULL, CASCADE | |
| spec | ForeignKey(ProductSpec) | NULLABLE, SET_NULL | 选择的规格 |
| quantity | IntegerField | DEFAULT=1 | 数量 |
| created_at | DateTimeField | auto_now_add | |
| updated_at | DateTimeField | auto_now | |

约束：`UNIQUE (user_id, product_id, spec_id)` 同一用户对同一商品同一规格只保留一条

> **注意**：`spec_id` 为 NULL 时（无规格商品），标准 UNIQUE 约束无效（`NULL != NULL`）。
> 使用 conditional unique index 解决：
> ```sql
> CREATE UNIQUE INDEX cart_unique_no_spec ON cart_items (user_id, product_id) WHERE spec_id IS NULL;
> ```
> Django 中通过 `Meta.constraints` + `UniqueConstraint(condition=Q(spec_id__isnull=True))` 实现。

### 3.5 支付结算模块 (payments app)

#### payments (支付记录表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| order | OneToOneField(Order) | NOT NULL, CASCADE | 关联订单 |
| user | ForeignKey(User) | NOT NULL | 支付人 |
| amount | DecimalField(10,2) | NOT NULL | 支付金额 |
| method | CharField(20) | NOT NULL | alipay/wechat/balance |
| transaction_id | CharField(100) | NULLABLE | 第三方支付流水号 |
| status | CharField(20) | DEFAULT='pending' | pending/success/failed/refunded |
| paid_at | DateTimeField | NULLABLE | 支付成功时间 |
| created_at | DateTimeField | auto_now_add | |
| updated_at | DateTimeField | auto_now | |

索引：`payment_order_idx (order_id)`, `payment_txn_idx (transaction_id)`

#### refunds (退款记录表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| order | ForeignKey(Order) | NOT NULL, CASCADE | |
| user | ForeignKey(User) | NOT NULL | 申请人 |
| amount | DecimalField(10,2) | NOT NULL | 退款金额 |
| reason | CharField(500) | NOT NULL | 退款原因 |
| status | CharField(20) | DEFAULT='pending' | pending/approved/rejected/completed |
| handler | ForeignKey(User) | NULLABLE, SET_NULL | 处理人(管理员) |
| reject_reason | CharField(500) | NULLABLE | 拒绝原因 |
| resolved_at | DateTimeField | NULLABLE | 处理时间 |
| created_at | DateTimeField | auto_now_add | |

#### merchant_settlements (商家结算单)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| merchant | ForeignKey(Merchant) | NOT NULL | |
| period_start | DateField | NOT NULL | 结算周期开始 |
| period_end | DateField | NOT NULL | 结算周期结束 |
| total_orders | IntegerField | NOT NULL | 订单数 |
| total_amount | DecimalField(10,2) | NOT NULL | 营业额 |
| commission_rate | DecimalField(5,4) | NOT NULL | 平台抽成比例 (e.g., 0.0500=5%) |
| commission | DecimalField(10,2) | NOT NULL | 平台抽成金额 |
| net_amount | DecimalField(10,2) | NOT NULL | 结算金额 |
| status | CharField(20) | DEFAULT='pending' | pending/paid |
| paid_at | DateTimeField | NULLABLE | 打款时间 |
| created_at | DateTimeField | auto_now_add | |

#### rider_withdrawals (骑手提现记录)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| rider | ForeignKey(Rider) | NOT NULL | |
| amount | DecimalField(10,2) | NOT NULL | 提现金额 |
| account_info | CharField(255) | NOT NULL | 提现账户信息 |
| status | CharField(20) | DEFAULT='pending' | pending/success/failed |
| created_at | DateTimeField | auto_now_add | |
| resolved_at | DateTimeField | NULLABLE | |

### 3.6 营销模块 (marketing app)

#### coupons (优惠券模板表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| merchant | ForeignKey(Merchant) | NULLABLE, CASCADE | NULL表示平台券 |
| name | CharField(100) | NOT NULL | 优惠券名称 |
| type | CharField(20) | NOT NULL | full_reduction(满减)/discount(折扣)/free_delivery(免配送费) |
| condition_amount | DecimalField(10,2) | DEFAULT=0.00 | 使用门槛金额 |
| discount_amount | DecimalField(10,2) | NULLABLE | 满减金额 (type=full_reduction 时使用) |
| discount_rate | DecimalField(3,2) | NULLABLE | 折扣率 (type=discount 时使用，0.85=85折) |
| valid_days | IntegerField | NOT NULL | 领券后有效天数 |
| total_count | IntegerField | NOT NULL | 发行总量 |
| used_count | IntegerField | DEFAULT=0 | 已领取数量 |
| per_user_limit | IntegerField | DEFAULT=1 | 每人限领数量 |
| is_active | BooleanField | DEFAULT=True | 是否启用 |
| start_at | DateTimeField | NOT NULL | 活动开始时间 |
| end_at | DateTimeField | NOT NULL | 活动结束时间 |
| created_at | DateTimeField | auto_now_add | |

#### user_coupons (用户领券记录)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| user | ForeignKey(User) | NOT NULL, CASCADE | |
| coupon | ForeignKey(Coupon) | NOT NULL, CASCADE | |
| status | CharField(20) | DEFAULT='unused' | unused/used/expired |
| order | ForeignKey(Order) | NULLABLE, SET_NULL | 使用订单 |
| received_at | DateTimeField | auto_now_add | |
| used_at | DateTimeField | NULLABLE | |
| expired_at | DateTimeField | NOT NULL | 过期时间 |

#### promotions (促销活动表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| merchant | ForeignKey(Merchant) | NOT NULL, CASCADE | |
| type | CharField(20) | NOT NULL | full_reduction(满减)/new_customer(新客立减)/discount(折扣) |
| name | CharField(100) | NOT NULL | |
| rules | JSONField | NOT NULL | 活动规则 `{"steps":[{"min":20,"discount":5},{"min":50,"discount":12}]}` |
| priority | IntegerField | DEFAULT=0 | 优先级，多活动叠加时排序 |
| is_active | BooleanField | DEFAULT=True | |
| start_at | DateTimeField | NOT NULL | |
| end_at | DateTimeField | NOT NULL | |
| created_at | DateTimeField | auto_now_add | |

### 3.7 评价投诉模块 (reviews app)

#### reviews (订单评价表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| order | OneToOneField(Order) | NOT NULL, CASCADE | 一个订单一条评价 |
| user | ForeignKey(User) | NOT NULL | 评价人 |
| merchant | ForeignKey(Merchant) | NOT NULL | |
| rating | IntegerField | NOT NULL | 评分 (1-5 星) |
| content | TextField | NULLABLE | 评价内容 |
| images | JSONField | DEFAULT=list | 评价图片URL列表 |
| is_anonymous | BooleanField | DEFAULT=False | 匿名评价 |
| reply_content | TextField | NULLABLE | 商家回复 |
| replied_at | DateTimeField | NULLABLE | |
| created_at | DateTimeField | auto_now_add | |

索引：`review_merchant_idx (merchant_id, created_at)`

#### complaints (投诉/售后表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| order | ForeignKey(Order) | NOT NULL, CASCADE | |
| user | ForeignKey(User) | NOT NULL | 投诉人 |
| type | CharField(20) | NOT NULL | 类型: refund_only(仅退款)/refund_return(退货退款)/complaint(投诉) |
| description | TextField | NOT NULL | 问题描述 |
| images | JSONField | DEFAULT=list | 凭证图片 |
| status | CharField(20) | DEFAULT='pending' | pending/processing/resolved/rejected |
| handler | ForeignKey(User) | NULLABLE, SET_NULL | 处理人(管理员) |
| result | TextField | NULLABLE | 处理结果 |
| created_at | DateTimeField | auto_now_add | |
| resolved_at | DateTimeField | NULLABLE | |

### 3.8 通知模块 (notifications app)

#### notifications (站内通知表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| user | ForeignKey(User) | NOT NULL, CASCADE | |
| type | CharField(30) | NOT NULL | order_update/promotion/system/chat |
| title | CharField(200) | NOT NULL | |
| content | TextField | NOT NULL | |
| is_read | BooleanField | DEFAULT=False | |
| related_order | ForeignKey(Order) | NULLABLE, SET_NULL | 关联订单 |
| created_at | DateTimeField | auto_now_add | |

索引：`notif_user_idx (user_id, is_read, created_at)`

### 3.9 管理后台模块 (admin_portal app)

#### merchant_applications (商家入驻申请表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| user | ForeignKey(User) | NOT NULL | 申请人 |
| name | CharField(100) | NOT NULL | 店铺名称 |
| address | CharField(255) | NOT NULL | 店铺地址 |
| business_license | URLField | NOT NULL | 营业执照URL |
| food_license | URLField | NOT NULL | 食品经营许可证URL |
| status | CharField(20) | DEFAULT='pending' | pending/approved/rejected |
| reviewed_by | ForeignKey(User) | NULLABLE, SET_NULL | 审核人 |
| reject_reason | CharField(500) | NULLABLE | 驳回原因 |
| created_at | DateTimeField | auto_now_add | |
| reviewed_at | DateTimeField | NULLABLE | |

#### banners (轮播图/广告位)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| title | CharField(100) | NOT NULL | |
| image_url | URLField | NOT NULL | |
| link_url | URLField | NULLABLE | 点击跳转链接 |
| sort_order | IntegerField | DEFAULT=0 | |
| is_active | BooleanField | DEFAULT=True | |
| created_at | DateTimeField | auto_now_add | |

#### platform_config (平台配置)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | |
| key | CharField(100) | UNIQUE, NOT NULL | 配置键 (e.g., "commission_rate", "delivery_timeout") |
| value | TextField | NOT NULL | 配置值 |
| description | CharField(200) | NULLABLE | |
| updated_at | DateTimeField | auto_now | |

## 4. 数据库迁移策略

### 4.1 初始环境

1. 先运行 `python manage.py migrate` 迁移 Django 内置 app（`auth`, `contenttypes`, `sessions`, `admin` 等）
2. 再按以下顺序创建业务 app 迁移：

### 4.2 业务迁移顺序

由于应用之间存在外键依赖，迁移的创建和部署顺序如下：

1. `users` (User 基础模型，无依赖)
2. `merchants` (依赖 User)
3. `riders` (依赖 User)
4. `orders` (依赖 User, Merchant, Rider)
5. `payments` (依赖 Order)
6. `marketing` (依赖 Merchant, User)
7. `reviews` (依赖 Order)
8. `notifications` (依赖 User, Order)
9. `admin_portal` (依赖 User)

使用 `python manage.py makemigrations <app>` 逐应用创建迁移，确保依赖链正确。

### 4.2 生产环境迁移

- 所有迁移文件纳入版本控制
- 使用 `python manage.py migrate --plan` 预览迁移
- 大表添加字段使用 `AddField` + `null=True` 两步走（先加字段允许NULL，回填数据，再改为NOT NULL）
- 禁止直接 `RENAME COLUMN` 除非确认无线上依赖
- 添加索引使用 `CREATE INDEX CONCURRENTLY`（需在迁移中手动写 `RunSQL`）

### 4.3 初始数据 (fixture)

`fixtures/initial_data.json` 包含：
- 4个角色：customer, merchant, rider, admin
- 默认权限组
- 一个超级管理员账号 (首次部署时通过管理命令创建真实密码)
