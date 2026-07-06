# 01 - 数据库设计

## 1. 设计原则

- **范式优先**: 遵循第三范式，避免数据冗余
- **快照保留**: 订单相关的价格、商品名等信息保存快照，不受后续修改影响
- **软删除**: 重要数据（订单、用户）使用 `is_deleted` 标记，不物理删除
- **审计追踪**: 所有表包含 `created_at`、`updated_at` 时间戳
- **索引优化**: 外键、查询频繁的字段建立索引

## 2. 数据库表设计

### 2.1 用户与角色模块

#### 2.1.1 User (用户表)
基础账号表，继承 Django `AbstractUser`。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 用户ID |
| phone | CharField(11) | UNIQUE, NOT NULL | 手机号（登录名） |
| password | CharField(128) | NOT NULL | 密码哈希 |
| email | EmailField | NULL | 邮箱 |
| avatar | URLField | NULL | 头像 URL |
| status | CharField(20) | DEFAULT='active' | active/banned |
| last_login | DateTimeField | NULL | 最后登录时间 |
| created_at | DateTimeField | auto_now_add | 注册时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |
| is_deleted | BooleanField | DEFAULT=False | 软删除标记 |

**索引**: `phone`, `status`, `created_at`

#### 2.1.2 Role (角色表)
定义系统中的四种角色。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | AutoField | PK | 角色ID |
| name | CharField(50) | UNIQUE | customer/merchant/rider/admin |
| display_name | CharField(50) | NOT NULL | 显示名称（客户/商家/骑手/管理员） |
| description | TextField | NULL | 角色描述 |
| permissions | JSONField | DEFAULT=[] | 权限列表 |

**预置数据**:
```python
ROLES = [
    ('customer', '客户', ['view_products', 'create_order', 'create_review']),
    ('merchant', '商家', ['manage_store', 'manage_products', 'handle_orders']),
    ('rider', '骑手', ['view_tasks', 'update_delivery_status']),
    ('admin', '管理员', ['*'])  # 拥有所有权限
]
```

#### 2.1.3 UserRole (用户角色关联表)
多对多关系，一个用户可以拥有多个角色。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 关联ID |
| user_id | BigIntegerField | FK(User), NOT NULL | 用户ID |
| role_id | IntegerField | FK(Role), NOT NULL | 角色ID |
| created_at | DateTimeField | auto_now_add | 分配时间 |

**索引**: `user_id`, `role_id`  
**唯一约束**: (user_id, role_id)

---

### 2.2 商家与商品模块

#### 2.2.1 Merchant (商家信息表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 商家ID |
| user_id | BigIntegerField | FK(User), UNIQUE | 所属用户ID |
| store_name | CharField(100) | NOT NULL | 店铺名称 |
| logo | URLField | NULL | 店铺Logo |
| phone | CharField(20) | NOT NULL | 联系电话 |
| address | CharField(200) | NOT NULL | 详细地址 |
| latitude | DecimalField(10,7) | NULL | 纬度 |
| longitude | DecimalField(10,7) | NULL | 经度 |
| business_hours | JSONField | NULL | 营业时间 `{"start": "08:00", "end": "22:00"}` |
| min_order | DecimalField(10,2) | DEFAULT=0 | 起送金额 |
| delivery_fee | DecimalField(10,2) | DEFAULT=0 | 配送费 |
| notice | TextField | NULL | 店铺公告 |
| status | CharField(20) | DEFAULT='pending' | pending/open/closed/reviewing |
| rating | DecimalField(3,2) | DEFAULT=5.0 | 评分 (0-5) |
| monthly_sales | IntegerField | DEFAULT=0 | 月销量 |
| license_img | URLField | NULL | 营业执照图片 |
| food_permit_img | URLField | NULL | 食品许可证图片 |
| legal_person | CharField(50) | NULL | 法人姓名 |
| capital | CharField(50) | NULL | 注册资本 |
| approved_at | DateTimeField | NULL | 审核通过时间 |
| rejected_reason | TextField | NULL | 拒绝原因 |
| created_at | DateTimeField | auto_now_add | 申请时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |
| is_deleted | BooleanField | DEFAULT=False | 软删除 |

**索引**: `user_id`, `status`, `rating`, `(latitude, longitude)`

#### 2.2.2 Category (商品分类表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | AutoField | PK | 分类ID |
| name | CharField(50) | UNIQUE | 分类名称（主食/小食/饮品/甜点） |
| icon | CharField(50) | NULL | 图标名称 |
| sort_order | IntegerField | DEFAULT=0 | 排序权重 |
| is_active | BooleanField | DEFAULT=True | 是否启用 |

**预置数据**: `["主食", "小食", "饮品", "甜点", "热销"]`

#### 2.2.3 Product (商品表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 商品ID |
| merchant_id | BigIntegerField | FK(Merchant), NOT NULL | 所属商家ID |
| category_id | IntegerField | FK(Category), NULL | 所属分类ID |
| name | CharField(100) | NOT NULL | 商品名称 |
| description | TextField | NULL | 商品描述 |
| image | URLField | NULL | 商品主图 |
| price | DecimalField(10,2) | NOT NULL | 销售价格 |
| original_price | DecimalField(10,2) | NULL | 原价（用于显示折扣） |
| stock | IntegerField | DEFAULT=0 | 当前库存 |
| low_stock_threshold | IntegerField | DEFAULT=10 | 低库存预警阈值 |
| status | CharField(20) | DEFAULT='off' | on/off (上架/下架) |
| sales_count | IntegerField | DEFAULT=0 | 销量 |
| rating | DecimalField(3,2) | DEFAULT=5.0 | 评分 |
| specs | JSONField | NULL | 规格 `[{"name": "大份", "price_diff": 5}]` |
| created_at | DateTimeField | auto_now_add | 创建时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |
| is_deleted | BooleanField | DEFAULT=False | 软删除 |

**索引**: `merchant_id`, `category_id`, `status`, `sales_count`, `rating`

---

### 2.3 订单模块

#### 2.3.1 Order (订单主表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 订单ID |
| order_no | CharField(32) | UNIQUE, NOT NULL | 订单编号 |
| customer_id | BigIntegerField | FK(User), NOT NULL | 下单客户ID |
| merchant_id | BigIntegerField | FK(Merchant), NOT NULL | 所属商家ID |
| rider_id | BigIntegerField | FK(Rider), NULL | 配送员ID |
| address_snapshot | JSONField | NOT NULL | 收货地址快照 |
| items_snapshot | JSONField | NOT NULL | 订单明细快照 |
| total_amount | DecimalField(10,2) | NOT NULL | 订单总金额 |
| discount_amount | DecimalField(10,2) | DEFAULT=0 | 优惠金额 |
| delivery_fee | DecimalField(10,2) | DEFAULT=0 | 配送费 |
| paid_amount | DecimalField(10,2) | NOT NULL | 实付金额 |
| status | CharField(20) | DEFAULT='pending' | 订单状态（见下方枚举） |
| payment_method | CharField(20) | NULL | alipay/wechat/balance |
| payment_no | CharField(64) | NULL | 支付流水号 |
| note | TextField | NULL | 备注 |
| cancel_reason | TextField | NULL | 取消原因 |
| refund_reason | TextField | NULL | 退款原因 |
| refund_amount | DecimalField(10,2) | DEFAULT=0 | 退款金额 |
| created_at | DateTimeField | auto_now_add | 下单时间 |
| paid_at | DateTimeField | NULL | 支付时间 |
| accepted_at | DateTimeField | NULL | 商家接单时间 |
| prepared_at | DateTimeField | NULL | 出餐时间 |
| picked_at | DateTimeField | NULL | 骑手取餐时间 |
| delivered_at | DateTimeField | NULL | 送达时间 |
| finished_at | DateTimeField | NULL | 完成时间 |
| cancelled_at | DateTimeField | NULL | 取消时间 |
| estimated_delivery_at | DateTimeField | NULL | 预计送达时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |
| is_deleted | BooleanField | DEFAULT=False | 软删除 |

**订单状态枚举**:
```python
ORDER_STATUS = [
    ('pending', '待支付'),
    ('paid', '已支付'),
    ('accepted', '商家已接单'),
    ('preparing', '准备中'),
    ('ready', '待取餐'),
    ('picked', '配送中'),
    ('delivered', '已送达'),
    ('finished', '已完成'),
    ('cancelled', '已取消'),
    ('refunding', '退款中'),
    ('refunded', '已退款'),
]
```

**索引**: `order_no`, `customer_id`, `merchant_id`, `rider_id`, `status`, `created_at`

#### 2.3.2 OrderItem (订单明细表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 明细ID |
| order_id | BigIntegerField | FK(Order), NOT NULL | 所属订单ID |
| product_id | BigIntegerField | FK(Product), NULL | 商品ID（可能已删除） |
| product_name | CharField(100) | NOT NULL | 商品名称快照 |
| product_image | URLField | NULL | 商品图片快照 |
| spec | CharField(100) | NULL | 规格快照 |
| unit_price | DecimalField(10,2) | NOT NULL | 单价快照 |
| quantity | IntegerField | NOT NULL | 购买数量 |
| subtotal | DecimalField(10,2) | NOT NULL | 小计 |
| created_at | DateTimeField | auto_now_add | 创建时间 |

**索引**: `order_id`, `product_id`

---

### 2.4 配送员模块

#### 2.4.1 Rider (配送员信息表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 配送员ID |
| user_id | BigIntegerField | FK(User), UNIQUE | 所属用户ID |
| real_name | CharField(50) | NOT NULL | 真实姓名 |
| id_card | CharField(18) | UNIQUE | 身份证号 |
| phone | CharField(20) | NOT NULL | 联系电话 |
| station | CharField(100) | NULL | 所属站点/区域 |
| work_status | CharField(20) | DEFAULT='offline' | offline/idle/busy/delivering |
| balance | DecimalField(10,2) | DEFAULT=0 | 账户余额 |
| total_orders | IntegerField | DEFAULT=0 | 总配送单量 |
| rating | DecimalField(3,2) | DEFAULT=5.0 | 好评率 |
| current_latitude | DecimalField(10,7) | NULL | 当前纬度 |
| current_longitude | DecimalField(10,7) | NULL | 当前经度 |
| created_at | DateTimeField | auto_now_add | 注册时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |
| is_deleted | BooleanField | DEFAULT=False | 软删除 |

**工作状态枚举**:
```python
WORK_STATUS = [
    ('offline', '离线'),
    ('idle', '空闲'),
    ('busy', '忙碌'),
    ('delivering', '配送中'),
]
```

**索引**: `user_id`, `work_status`, `(current_latitude, current_longitude)`

#### 2.4.2 DeliveryException (配送异常表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 异常ID |
| order_id | BigIntegerField | FK(Order), NOT NULL | 订单ID |
| rider_id | BigIntegerField | FK(Rider), NOT NULL | 骑手ID |
| exception_type | CharField(50) | NOT NULL | out_of_stock/wrong_address/unreachable |
| description | TextField | NOT NULL | 异常描述 |
| images | JSONField | NULL | 证明图片 URLs |
| status | CharField(20) | DEFAULT='pending' | pending/resolved |
| resolved_at | DateTimeField | NULL | 处理时间 |
| created_at | DateTimeField | auto_now_add | 上报时间 |

**索引**: `order_id`, `rider_id`, `status`

---

### 2.5 地址模块

#### 2.5.1 Address (收货地址表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 地址ID |
| user_id | BigIntegerField | FK(User), NOT NULL | 所属用户ID |
| tag | CharField(20) | NULL | 标签（家/公司/学校） |
| contact_name | CharField(50) | NOT NULL | 收件人姓名 |
| contact_phone | CharField(20) | NOT NULL | 联系电话 |
| province | CharField(50) | NOT NULL | 省 |
| city | CharField(50) | NOT NULL | 市 |
| district | CharField(50) | NOT NULL | 区 |
| address | CharField(200) | NOT NULL | 详细地址 |
| latitude | DecimalField(10,7) | NULL | 纬度 |
| longitude | DecimalField(10,7) | NULL | 经度 |
| is_default | BooleanField | DEFAULT=False | 是否默认地址 |
| created_at | DateTimeField | auto_now_add | 创建时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |
| is_deleted | BooleanField | DEFAULT=False | 软删除 |

**索引**: `user_id`, `is_default`

---

### 2.6 营销模块

#### 2.6.1 Coupon (优惠券表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 优惠券ID |
| merchant_id | BigIntegerField | FK(Merchant), NULL | 商家ID（NULL=平台券） |
| name | CharField(100) | NOT NULL | 优惠券名称 |
| type | CharField(20) | NOT NULL | discount/reduction/free_delivery |
| condition | CharField(200) | NULL | 使用条件描述 |
| discount_rate | IntegerField | NULL | 折扣率（如 80 表示 8折） |
| reduction_amount | DecimalField(10,2) | NULL | 减免金额 |
| min_spend | DecimalField(10,2) | DEFAULT=0 | 最低消费 |
| max_discount | DecimalField(10,2) | NULL | 最高优惠金额 |
| total_count | IntegerField | DEFAULT=0 | 总发放量 |
| remaining_count | IntegerField | DEFAULT=0 | 剩余量 |
| per_user_limit | IntegerField | DEFAULT=1 | 每人限领数量 |
| valid_from | DateTimeField | NOT NULL | 有效期开始 |
| valid_until | DateTimeField | NOT NULL | 有效期结束 |
| status | CharField(20) | DEFAULT='active' | active/inactive |
| created_at | DateTimeField | auto_now_add | 创建时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |

**索引**: `merchant_id`, `status`, `valid_until`

#### 2.6.2 UserCoupon (用户优惠券关联表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 记录ID |
| user_id | BigIntegerField | FK(User), NOT NULL | 用户ID |
| coupon_id | BigIntegerField | FK(Coupon), NOT NULL | 优惠券ID |
| order_id | BigIntegerField | FK(Order), NULL | 使用的订单ID |
| status | CharField(20) | DEFAULT='unused' | unused/used/expired |
| used_at | DateTimeField | NULL | 使用时间 |
| created_at | DateTimeField | auto_now_add | 领取时间 |

**索引**: `user_id`, `coupon_id`, `status`

#### 2.6.3 Campaign (营销活动表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 活动ID |
| merchant_id | BigIntegerField | FK(Merchant), NOT NULL | 商家ID |
| name | CharField(100) | NOT NULL | 活动名称 |
| type | CharField(20) | NOT NULL | full_reduction/discount/new_customer |
| rules | JSONField | NOT NULL | 规则配置 |
| scope | CharField(100) | NULL | 适用范围 |
| start_at | DateTimeField | NOT NULL | 开始时间 |
| end_at | DateTimeField | NOT NULL | 结束时间 |
| status | CharField(20) | DEFAULT='active' | active/ended |
| created_at | DateTimeField | auto_now_add | 创建时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |

**索引**: `merchant_id`, `status`, `start_at`, `end_at`

---

### 2.7 评价模块

#### 2.7.1 Review (评价表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 评价ID |
| order_id | BigIntegerField | FK(Order), UNIQUE | 订单ID |
| customer_id | BigIntegerField | FK(User), NOT NULL | 客户ID |
| merchant_id | BigIntegerField | FK(Merchant), NOT NULL | 商家ID |
| rider_id | BigIntegerField | FK(Rider), NULL | 骑手ID |
| food_rating | IntegerField | NOT NULL | 食物评分 (1-5) |
| delivery_rating | IntegerField | NULL | 配送评分 (1-5) |
| content | TextField | NULL | 评价内容 |
| images | JSONField | NULL | 评价图片 URLs |
| reply | TextField | NULL | 商家回复 |
| replied_at | DateTimeField | NULL | 回复时间 |
| is_anonymous | BooleanField | DEFAULT=False | 是否匿名 |
| created_at | DateTimeField | auto_now_add | 评价时间 |
| updated_at | DateTimeField | auto_now | 更新时间 |

**索引**: `order_id`, `customer_id`, `merchant_id`, `rider_id`, `created_at`

---

### 2.8 财务模块

#### 2.8.1 Settlement (结算记录表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 结算ID |
| merchant_id | BigIntegerField | FK(Merchant), NOT NULL | 商家ID |
| period_start | DateField | NOT NULL | 结算周期开始 |
| period_end | DateField | NOT NULL | 结算周期结束 |
| order_count | IntegerField | DEFAULT=0 | 订单数 |
| total_revenue | DecimalField(10,2) | DEFAULT=0 | 总营业额 |
| commission_amount | DecimalField(10,2) | DEFAULT=0 | 平台佣金 |
| net_amount | DecimalField(10,2) | DEFAULT=0 | 净收入 |
| status | CharField(20) | DEFAULT='pending' | pending/paid |
| paid_at | DateTimeField | NULL | 支付时间 |
| created_at | DateTimeField | auto_now_add | 创建时间 |

**索引**: `merchant_id`, `status`, `period_end`

#### 2.8.2 Withdrawal (提现记录表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BigAutoField | PK | 提现ID |
| rider_id | BigIntegerField | FK(Rider), NOT NULL | 骑手ID |
| amount | DecimalField(10,2) | NOT NULL | 提现金额 |
| bank_account | CharField(50) | NOT NULL | 银行卡号 |
| bank_name | CharField(50) | NOT NULL | 银行名称 |
| status | CharField(20) | DEFAULT='pending' | pending/processing/success/failed |
| processed_at | DateTimeField | NULL | 处理时间 |
| failed_reason | TextField | NULL | 失败原因 |
| created_at | DateTimeField | auto_now_add | 申请时间 |

**索引**: `rider_id`, `status`, `created_at`

---

### 2.9 系统配置模块

#### 2.9.1 SystemConfig (系统配置表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | AutoField | PK | 配置ID |
| key | CharField(100) | UNIQUE | 配置键 |
| value | TextField | NOT NULL | 配置值（JSON） |
| description | CharField(200) | NULL | 配置说明 |
| updated_at | DateTimeField | auto_now | 更新时间 |

**预置配置**:
```python
{
    'commission_rate': 10,              # 平台佣金比例 (%)
    'min_withdraw': 100,                 # 最低提现金额
    'delivery_timeout': 30,              # 配送超时阈值 (分钟)
    'auto_confirm_days': 7,              # 订单自动确认天数
    'max_addresses_per_user': 10,        # 每个用户最多保存地址数
}
```

---

## 3. 数据库索引策略

### 3.1 核心索引
```sql
-- 用户表
CREATE INDEX idx_user_phone ON user(phone);
CREATE INDEX idx_user_status ON user(status);

-- 订单表
CREATE INDEX idx_order_customer ON "order"(customer_id, created_at DESC);
CREATE INDEX idx_order_merchant ON "order"(merchant_id, status);
CREATE INDEX idx_order_rider ON "order"(rider_id, status);
CREATE INDEX idx_order_status_created ON "order"(status, created_at DESC);

-- 商品表
CREATE INDEX idx_product_merchant_status ON product(merchant_id, status);
CREATE INDEX idx_product_category ON product(category_id, sales_count DESC);

-- 地理位置索引 (PostgreSQL)
CREATE INDEX idx_merchant_location ON merchant USING GIST(ll_to_earth(latitude, longitude));
CREATE INDEX idx_rider_location ON rider USING GIST(ll_to_earth(current_latitude, current_longitude));
```

## 4. 数据迁移计划

### 4.1 Phase 1: 基础表 (Week 1)
- User, Role, UserRole
- Merchant, Category, Product
- Address

### 4.2 Phase 2: 订单表 (Week 2)
- Order, OrderItem
- Rider, DeliveryException

### 4.3 Phase 3: 营销与评价 (Week 3)
- Coupon, UserCoupon, Campaign
- Review

### 4.4 Phase 4: 财务与配置 (Week 4)
- Settlement, Withdrawal
- SystemConfig

## 5. 数据安全

### 5.1 敏感字段加密
- `User.password`: bcrypt 哈希
- `Rider.id_card`: AES-256 加密存储
- `Withdrawal.bank_account`: 前端显示时部分脱敏

### 5.2 访问控制
- ORM 层面强制租户隔离（商家只能查看自己的订单）
- 使用 Django Row-Level Security

### 5.3 备份策略
- 全量备份: 每日凌晨 2:00
- 增量备份: 每 4 小时
- 异地备份: 保留 30 天

## 6. 性能优化建议

- **读写分离**: 主库写，从库读
- **缓存策略**: 商品列表、商家信息缓存 Redis (TTL 5min)
- **分表策略**: Order 表按年份分表（order_2026, order_2027）
- **归档策略**: 6 个月前的订单归档到冷存储
