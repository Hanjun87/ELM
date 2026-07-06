# 06 - 模块详细设计

## 1. 应用模块总览

```
┌─────────────────────────────────────────────────────────────┐
│                        Django Project                        │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  users   │merchants │  orders  │  riders  │   payments      │
│ 用户认证  │ 商家商品  │ 订单核心  │ 配送骑手  │   支付结算       │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│marketing │ reviews  │notifica- │  admin   │    common        │
│ 营销活动  │ 评价投诉  │  tions   │ _portal  │   公共基础        │
│          │          │ 消息推送  │ 管理后台  │                  │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
                          │
              ┌───────────┴───────────┐
              │    services/          │  ← 跨应用服务编排
              │    tasks/             │  ← Celery 异步任务
              │    utils/             │  ← 项目级工具
              └───────────────────────┘
```

## 2. 各应用详细设计

### 2.1 users (用户与认证)

```
apps/users/
├── __init__.py
├── models.py
│   ├── User (自定义用户模型)
│   ├── Role
│   ├── UserRole
│   └── UserAddress
├── serializers.py
│   ├── RegisterSerializer
│   ├── LoginSerializer
│   ├── UserSerializer
│   ├── AddressSerializer
│   └── PasswordChangeSerializer
├── views.py
│   ├── AuthViewSet (register, login, refresh, logout)
│   ├── UserViewSet (me, update_profile)
│   ├── AddressViewSet (CRUD)
│   └── PasswordViewSet
├── urls.py
├── services.py
│   ├── create_user_with_role()
│   ├── send_sms_code()
│   ├── verify_sms_code()
│   └── generate_tokens()
├── backends.py
│   └── PhoneOrUsernameBackend (支持手机号或用户名登录)
└── admin.py
```

**关键设计点：**
- User 模型在项目初期创建（`AUTH_USER_MODEL = 'users.User'`），避免后期迁移痛苦
- 手机号+用户名双通道登录通过自定义 `AuthenticationBackend` 实现
- 短信验证码存入 Redis（`sms:{type}:{phone}`），不存数据库
- JWT 签发使用 `rest_framework_simplejwt`，扩展其 `TokenObtainPairSerializer` 追加 roles

### 2.2 merchants (商家与商品)

```
apps/merchants/
├── __init__.py
├── models.py
│   ├── Merchant
│   ├── Category
│   ├── Product
│   ├── ProductSpec
│   └── ProductImage
├── serializers.py
│   ├── MerchantListSerializer (列表用，轻量)
│   ├── MerchantDetailSerializer (详情用，包含活动和商品)
│   ├── ProductSerializer
│   ├── ProductCreateSerializer
│   ├── CategorySerializer
│   └── ProductSpecSerializer
├── views.py
│   ├── MerchantPublicViewSet (公开浏览)
│   ├── MerchantManageViewSet (商家管理)
│   ├── ProductPublicViewSet
│   ├── ProductManageViewSet (商家管理商品)
│   ├── CategoryViewSet
│   └── AnalyticsView (商家数据看板)
├── urls.py
├── services.py
│   ├── search_merchants()          # 按距离/评分/分类/关键词搜索
│   ├── get_nearby_merchants()      # 附近商家 (需经纬度)
│   ├── batch_update_product_status()
│   └── get_analytics_data()
├── filters.py
│   ├── MerchantFilter
│   └── ProductFilter
└── admin.py
```

**关键设计点：**

**附近商家搜索算法：**
```python
def get_nearby_merchants(lat, lng, radius_meters=3000):
    """
    PostgreSQL + PostGIS 方案：
    SELECT * FROM merchants
    WHERE ST_DWithin(
        location::geography,
        ST_MakePoint(lng, lat)::geography,
        radius_meters
    )

    MySQL / 无 PostGIS 的降级方案 (Haversine):
    SELECT *, (
        6371000 * acos(
            cos(radians(lat)) * cos(radians(latitude))
            * cos(radians(longitude) - radians(lng))
            + sin(radians(lat)) * sin(radians(latitude))
        )
    ) AS distance
    FROM merchants
    HAVING distance < radius_meters
    ORDER BY distance
    """
```

**商家数据看板指标：**
- 今日营业额、订单量、客单价 (对比昨日环比)
- 近7天/30天趋势图
- 商品销量排行 Top10
- 转化率 (浏览→下单→支付)
- 评分分布、好评率

### 2.3 orders (订单核心)

```
apps/orders/
├── __init__.py
├── models.py
│   ├── Order
│   ├── OrderItem
│   ├── CartItem
│   └── OrderStatusLog
├── serializers.py
│   ├── OrderCreateSerializer
│   ├── OrderListSerializer
│   ├── OrderDetailSerializer
│   ├── CartItemSerializer
│   └── OrderStatusSerializer
├── views.py
│   ├── CartViewSet
│   ├── CustomerOrderViewSet
│   ├── MerchantOrderViewSet
│   └── RiderOrderViewSet
├── urls.py
├── services.py
│   ├── create_order_from_cart()
│   ├── cancel_order()
│   ├── accept_order()
│   ├── complete_order()
│   └── validate_order()
├── signals.py
│   ├── on_order_status_change()   → 推送通知 + 启动/取消超时任务
│   └── on_order_created()         → 预占库存 + 启动支付超时
├── state_machine.py
│   ├── can_transition()
│   ├── ALLOWED_TRANSITIONS        # 状态转换字典
│   └── transition()
└── admin.py
```

**状态机核心实现：**

```python
# apps/orders/state_machine.py

ALLOWED_TRANSITIONS = {
    OrderStatus.PENDING_PAYMENT: [OrderStatus.PENDING_ACCEPT, OrderStatus.CANCELLED],
    OrderStatus.PENDING_ACCEPT:  [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    OrderStatus.PREPARING:       [OrderStatus.PENDING_PICKUP, OrderStatus.CANCELLED],
    OrderStatus.PENDING_PICKUP:  [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
    OrderStatus.DELIVERING:      [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    OrderStatus.COMPLETED:       [],
    OrderStatus.CANCELLED:       [],
}

# admin 角色可强制从任意非终态取消
ADMIN_CANCELLABLE = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PENDING_ACCEPT,
    OrderStatus.PREPARING,
    OrderStatus.PENDING_PICKUP,
    OrderStatus.DELIVERING,
]


def can_transition(order: Order, target: OrderStatus, operator_role: str) -> bool:
    if target == OrderStatus.CANCELLED and operator_role == 'admin':
        return order.status in ADMIN_CANCELLABLE
    return target in ALLOWED_TRANSITIONS.get(order.status, [])


def transition(order: Order, target: OrderStatus, operator: User, remark: str = ''):
    if not can_transition(order, target, operator.roles.first().code):
        raise InvalidTransitionError(
            f"Cannot transition from {order.status} to {target}"
        )
    old_status = order.status
    order.status = target
    order.save(update_fields=['status', 'updated_at'])
    OrderStatusLog.objects.create(
        order=order,
        from_status=old_status,
        to_status=target,
        operator=operator,
        operator_role=operator.roles.first().code,
        remark=remark,
    )
```

**下单服务编排：**

```python
# services/order_service.py

@transaction.atomic
def create_order_from_cart(user, address_id, coupon_id=None, note=''):
    # 1. 获取购物车并验证
    cart_items = CartItem.objects.select_related('product', 'product__merchant').filter(user=user)
    if not cart_items.exists():
        raise EmptyCartError()

    # 2. 验证同一商家 (购物车只能含一个商家的商品)
    merchant_ids = cart_items.values_list('product__merchant_id', flat=True).distinct()
    if len(merchant_ids) > 1:
        raise MixedMerchantError()

    merchant = Merchant.objects.get(id=merchant_ids[0])
    if merchant.status != 'open':
        raise MerchantClosedError()

    # 3. 验证地址
    address = UserAddress.objects.get(id=address_id, user=user)

    # 4. 逐项验证商品状态、库存，计算金额
    total_amount = 0
    for item in cart_items:
        if item.product.status != 'on':
            raise ProductOffShelfError(item.product.name)
        if item.product.stock < item.quantity:
            raise InsufficientStockError(item.product.name)
        total_amount += (item.product.price + (item.spec.price_modifier if item.spec else 0)) * item.quantity

    delivery_fee = merchant.delivery_fee
    if total_amount < merchant.min_order_amount:
        raise MinOrderAmountError(
            f"差 ¥{merchant.min_order_amount - total_amount} 满足起送价 ¥{merchant.min_order_amount}"
        )

    # 5. 计算优惠
    discount = 0
    if coupon_id:
        discount = calculate_coupon_discount(coupon_id, total_amount)

    paid_amount = total_amount + delivery_fee - discount

    # 6. 创建订单 + 订单明细 (商品快照)
    order = Order.objects.create(
        order_no=generate_order_no(),
        customer=user,
        merchant=merchant,
        address_snapshot=address_snapshot(address),
        total_amount=total_amount,
        delivery_fee=delivery_fee,
        discount_amount=discount,
        paid_amount=paid_amount,
        note=note,
    )

    for item in cart_items:
        unit_price = item.product.price + (item.spec.price_modifier if item.spec else 0)
        subtotal = unit_price * item.quantity
        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_name=item.product.name,
            product_image=item.product.image.url,
            spec_name=item.spec.name if item.spec else None,
            unit_price=unit_price,
            quantity=item.quantity,
            subtotal=subtotal,
        )
        # 预占库存
        item.product.stock -= item.quantity
        item.product.reserved_stock += item.quantity
        item.product.save(update_fields=['stock', 'reserved_stock'])

    # 7. 清空购物车
    cart_items.delete()

    # 8. 启动支付超时监控 (15分钟)
    # transaction.on_commit 确保事务提交成功后才投递Celery任务，防止幽灵任务
    transaction.on_commit(
        lambda: auto_cancel_unpaid_order.apply_async((order.id,), countdown=15 * 60)
    )

    return order
```

### 2.4 riders (配送骑手)

```
apps/riders/
├── __init__.py
├── models.py
│   ├── Rider
│   └── RiderLocationLog (位置轨迹，用于实时追踪)
├── serializers.py
│   ├── RiderSerializer
│   ├── RiderStatusSerializer
│   └── WithdrawalSerializer
├── views.py
│   ├── RiderOrderViewSet (配送订单流)
│   ├── RiderStatusView
│   ├── RiderEarningsView
│   └── WithdrawalView
├── urls.py
├── services.py
│   ├── dispatch_rider()       # 系统派单算法
│   ├── grab_order()           # 抢单
│   └── calculate_earnings()
└── admin.py
```

**派单/抢单策略：**

```python
# services/dispatch_service.py

def find_best_rider(order, strategy='nearest'):
    """
    派单策略：
    1. 筛选配送范围内且状态为 online 的骑手
    2. 按策略排序：
       - nearest: 距离商家最近
       - balanced: 综合距离 + 当前负载均衡
       - rating: 综合评分优先
    3. 返回最优骑手，推送派单通知
    """
    candidates = Rider.objects.filter(
        work_status='online',
        region=order.merchant.region,
    )

    if strategy == 'nearest':
        # 需要骑手实时位置 (RiderLocationLog)
        # Haversine 公式通过 Django RawSQL 或 PostGIS ST_Distance 实现
        from django.db.models import RawSQL
        candidates = candidates.annotate(
            distance=RawSQL(
                "6371000 * acos(cos(radians(%s)) * cos(radians(latitude)) "
                "* cos(radians(longitude) - radians(%s)) "
                "+ sin(radians(%s)) * sin(radians(latitude)))",
                (order.merchant.latitude, order.merchant.longitude, order.merchant.latitude)
            )
        ).order_by('distance')
    elif strategy == 'balanced':
        candidates = candidates.annotate(
            active_orders=Count('order_set', filter=Q(order_set__status__in=['delivering']))
        ).order_by('active_orders', 'distance')

    return candidates.first()


def push_new_order_to_pool(order):
    """
    抢单模式：将订单推入抢单池
    - 使用 Redis Set 存储待抢订单ID: rider:order_pool
    - 通过 WebSocket 广播给区域内所有空闲骑手
    """
    redis_client.sadd('rider:order_pool', order.id)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"rider_region_{order.merchant.region}",
        {
            'type': 'new_grab_order',
            'order_id': order.id,
            'merchant_name': order.merchant.name,
            'distance': '...',
            'amount': str(order.paid_amount),
            'created_at': order.created_at.isoformat(),
        }
    )
```

### 2.5 payments (支付结算)

```
apps/payments/
├── __init__.py
├── models.py
│   ├── Payment
│   ├── Refund
│   ├── MerchantSettlement
│   └── RiderWithdrawal
├── serializers.py
├── views.py
│   ├── PaymentCallbackView (第三方回调)
│   ├── RefundViewSet
│   └── SettlementViewSet
├── urls.py
├── gateways/
│   ├── __init__.py
│   ├── base.py              # 抽象支付网关
│   ├── alipay.py            # 支付宝实现
│   └── wechat.py            # 微信支付实现
├── services.py
│   ├── create_payment()
│   ├── handle_callback()
│   ├── process_refund()
│   └── run_settlement()     # 定时结算
└── admin.py
```

**支付网关抽象：**

```python
# apps/payments/gateways/base.py

from abc import ABC, abstractmethod

class BasePaymentGateway(ABC):
    @abstractmethod
    def create_order(self, order_no, amount, subject, notify_url):
        """创建支付订单，返回支付链接或支付参数"""
        ...

    @abstractmethod
    def verify_callback(self, request_data):
        """验证回调签名，返回 (is_valid, order_no, transaction_id, amount)"""
        ...

    @abstractmethod
    def refund(self, transaction_id, amount, refund_no, reason):
        """发起退款"""
        ...

    @abstractmethod
    def query(self, order_no):
        """查询支付状态"""
        ...
```

### 2.6 marketing (营销活动)

```
apps/marketing/
├── __init__.py
├── models.py
│   ├── Coupon
│   ├── UserCoupon
│   └── Promotion
├── serializers.py
├── views.py
│   ├── CouponViewSet
│   ├── PromotionViewSet (商家管理)
│   └── UserCouponView (我的优惠券)
├── urls.py
├── services.py
│   ├── calculate_coupon_discount()
│   ├── calculate_promotion_discount()
│   ├── issue_newcomer_coupons()    # 新用户注册发券
│   └── auto_expire_coupons()       # 定时过期
└── admin.py
```

**优惠计算规则：**

优惠叠加顺序：`商家折扣 → 满减 → 平台优惠券`，可叠加但总数有限制。

```python
def calculate_order_discount(merchant_id, original_amount, coupon_id=None, is_new_customer=False):
    """统一优惠计算入口"""
    discounts = []

    # 1. 匹配促销活动 (满减、新客立减)
    promotions = Promotion.objects.filter(
        merchant_id=merchant_id,
        is_active=True,
        start_at__lte=timezone.now(),
        end_at__gte=timezone.now(),
    )
    for promo in promotions:
        promo_discount = apply_promotion(promo, original_amount, is_new_customer)
        if promo_discount:
            discounts.append(promo_discount)

    # 2. 应用优惠券
    if coupon_id:
        coupon = UserCoupon.objects.select_related('coupon').get(
            id=coupon_id, status='unused'
        )
        coupon_discount = apply_coupon(coupon.coupon, original_amount)
        if coupon_discount:
            discounts.append(coupon_discount)

    # 3. 总额限制 (优惠后金额不得低于0.01)
    total_discount = sum(discounts)
    if original_amount - total_discount < 0.01:
        total_discount = original_amount - 0.01

    return total_discount
```

### 2.7 reviews (评价投诉)

```
apps/reviews/
├── __init__.py
├── models.py
│   ├── Review
│   └── Complaint
├── serializers.py
├── views.py
│   ├── ReviewViewSet
│   └── ComplaintViewSet
├── urls.py
└── admin.py
```

### 2.8 notifications (消息推送)

```
apps/notifications/
├── __init__.py
├── models.py
│   └── Notification
├── serializers.py
├── views.py
├── urls.py
├── consumers.py       # WebSocket Consumer
├── services.py
│   ├── push_notification()
│   ├── push_ws()
│   ├── send_sms()
│   └── send_push_to_device()   # App 推送 (APNs/FCM)
└── routing.py         # WebSocket 路由
```

**推送优先级：**

| 优先级 | 渠道 | 适用场景 |
|-------|------|---------|
| 高 | WebSocket + SMS | 新订单通知、骑手派单、异常告警 |
| 中 | WebSocket + 站内信 | 订单状态更新、退款进度、催单 |
| 低 | 站内信 | 促销活动、评价邀请、系统公告 |

### 2.9 admin_portal (管理后台)

```
apps/admin_portal/
├── __init__.py
├── models.py
│   ├── Banner
│   ├── Announcement
│   ├── PlatformConfig
│   ├── Menu
│   └── Button
├── serializers.py
├── views.py
│   ├── UserManageViewSet
│   ├── MerchantAuditViewSet
│   ├── OrderMonitorViewSet
│   ├── AnalyticsView
│   ├── BannerViewSet
│   ├── ConfigViewSet
│   └── RolePermissionViewSet
├── urls.py
├── services.py
│   ├── get_platform_analytics()
│   └── review_merchant_application()
└── admin.py
```

**平台数据大盘指标：**

| 指标 | 计算方式 | 更新频率 |
|------|---------|---------|
| GMV | SUM(paid_amount) WHERE status IN (completed, delivering) | 实时 |
| 订单量 | COUNT(orders) | 实时 |
| DAU | COUNT(DISTINCT user_id) FROM login_logs WHERE date=today | 每日 |
| 订单热力图 | GROUP BY region | 每小时 |
| 配送超时率 | COUNT(actual > expected) / COUNT(all) | 每日 |
| 客单价 | GMV / 订单量 | 实时 |
| 商家入驻率 | COUNT(new merchants) / period | 每日 |
| 退款率 | COUNT(refunds) / COUNT(orders) | 每日 |

## 3. 跨应用服务编排层 (services/)

### 3.1 下单完整流程

```
services/order_service.py::create_order_from_cart()
  └── 见 2.3 节代码

services/dispatch_service.py::assign_rider(order)
  └── 商家接单后 → 根据策略分配骑手

services/payment_service.py::handle_payment_success(order, txn_id)
  └── 支付成功回调 → 更新订单状态 → 通知商家
```

### 3.2 结算批处理

```python
# tasks/settlement_tasks.py

@celery_app.task
def run_merchant_settlement():
    """
    每周一凌晨2点执行：
    1. 查询上周所有已完成订单
    2. 按商家汇总
    3. 根据平台抽成比例计算佣金
    4. 生成结算单
    5. 通知商家
    """
    ...

@celery_app.task
def auto_pay_settlement():
    """
    每月1号执行：
    对已确认的结算单发起自动打款 (对接企业付款接口)
    """
    ...
```

## 4. Celery 任务清单

| 任务 | 触发方式 | 说明 |
|------|---------|------|
| `auto_cancel_unpaid_order` | 下单后 countdown 15分钟 | 未支付自动取消 |
| `auto_cancel_unaccepted_order` | 支付成功后 countdown 30分钟 | 未接单自动取消 |
| `auto_refund` | 订单取消后 | 自动发起退款 |
| `release_reserved_stock` | 订单取消后 | 释放预占库存 |
| `auto_confirm_receipt` | 送达后 countdown 7天 | 超时自动确认完成 |
| `run_merchant_settlement` | Crontab: 每周一 2:00 | 商家结算 |
| `auto_pay_settlement` | Crontab: 每月1日 10:00 | 自动打款 |
| `auto_expire_coupons` | Crontab: 每日 0:00 | 过期优惠券 |
| `send_sms_async` | 事件触发 | 异步发短信 |
| `generate_daily_report` | Crontab: 每日 1:00 | 日报生成 |
| `sync_order_to_es` | 事件触发 | 订单同步到 Elasticsearch (搜索用) |

## 5. 项目启动顺序

```bash
# 1. 创建 Django 项目配置
uv run django-admin startproject config .

# 2. 创建各应用
uv run manage.py startapp common apps/common
uv run manage.py startapp users apps/users
uv run manage.py startapp merchants apps/merchants
uv run manage.py startapp orders apps/orders
uv run manage.py startapp riders apps/riders
uv run manage.py startapp payments apps/payments
uv run manage.py startapp marketing apps/marketing
uv run manage.py startapp reviews apps/reviews
uv run manage.py startapp notifications apps/notifications
uv run manage.py startapp admin_portal apps/admin_portal

# 3. 创建 services/ 和 tasks/ 目录结构
mkdir -p services tasks

# 4. 配置 settings/base.py
#    - 注册所有 app + 第三方库
#    - 配置 AUTH_USER_MODEL = 'users.User'
#    - 配置 DATABASES, CACHES, CELERY
#    - 配置 JWT (SIMPLE_JWT)
#    - 配置 DRF (REST_FRAMEWORK)
```
