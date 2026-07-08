# 05 - Django 模块划分设计

> **注意**: 本文档为架构设计蓝图，部分内容（Celery、派单算法、支付对接、WebSocket Consumer）尚未实现。  
> 已实现的模块和接口请参阅 [API.md](API.md) 和 [设计说明书.md](设计说明书.md)。

## 1. 项目结构

```
src/elm/
├── config/                    # 项目配置
│   ├── __init__.py
│   ├── settings.py           # Django 配置
│   ├── urls.py               # 根路由
│   ├── asgi.py               # ASGI 入口（WebSocket）
│   └── wsgi.py               # WSGI 入口
├── accounts/                  # 用户认证与授权
│   ├── models.py             # User, Role, UserRole
│   ├── serializers.py        # DRF 序列化器
│   ├── views.py              # 注册/登录/JWT
│   ├── permissions.py        # 权限检查装饰器
│   ├── backends.py           # 手机号认证后端
│   └── management/
│       └── commands/
│           └── init_roles.py # 初始化角色数据
├── merchants/                 # 商家管理
│   ├── models.py             # Merchant
│   ├── serializers.py
│   ├── views.py              # 商家CRUD、审核
│   └── tasks.py              # Celery 任务（结算）
├── products/                  # 商品管理
│   ├── models.py             # Product, Category
│   ├── serializers.py
│   └── views.py              # 商品CRUD、搜索
├── orders/                    # 订单核心
│   ├── models.py             # Order, OrderItem, OrderStatusLog
│   ├── serializers.py
│   ├── views.py              # 订单CRUD、状态流转
│   ├── state_machine.py      # 订单状态机
│   └── tasks.py              # 订单超时检查
├── riders/                    # 骑手管理
│   ├── models.py             # Rider, DeliveryException
│   ├── serializers.py
│   ├── views.py              # 骑手订单、异常上报
│   ├── dispatch.py           # 派单算法
│   └── tasks.py              # 定时更新骑手位置
├── payments/                  # 支付结算
│   ├── models.py             # Settlement, Withdrawal
│   ├── serializers.py
│   ├── views.py              # 支付回调、提现
│   ├── alipay.py             # 支付宝对接
│   └── wechat.py             # 微信支付对接
├── promotions/                # 营销活动
│   ├── models.py             # Coupon, UserCoupon, Campaign
│   ├── serializers.py
│   ├── views.py              # 优惠券领取、活动配置
│   └── calculator.py         # 优惠计算逻辑
├── reviews/                   # 评价系统
│   ├── models.py             # Review
│   ├── serializers.py
│   └── views.py              # 评价CRUD、回复
├── notifications/             # 消息推送
│   ├── consumers.py          # WebSocket 消费者
│   ├── routing.py            # WebSocket 路由
│   ├── models.py             # Notification
│   └── tasks.py              # 短信/推送任务
├── addresses/                 # 地址管理
│   ├── models.py             # Address
│   ├── serializers.py
│   └── views.py              # 地址CRUD
├── admin_panel/               # 管理后台
│   ├── views.py              # 数据看板、审核、配置
│   └── statistics.py         # 统计查询
├── common/                    # 公共模块
│   ├── models.py             # SystemConfig
│   ├── exceptions.py         # 自定义异常
│   ├── response.py           # 统一响应格式
│   ├── pagination.py         # 分页器
│   ├── middlewares.py        # 中间件（限流、日志）
│   └── utils.py              # 工具函数
└── uploads/                   # 文件上传
    ├── views.py              # 图片上传接口
    └── storage.py            # OSS/本地存储
```

---

## 2. App 模块详解

### 2.1 accounts (用户认证)

**职责**: 用户注册登录、JWT 认证、权限检查

**核心 Model**:
- `User`: 继承 `AbstractUser`，添加 `phone`, `avatar`, `status`
- `Role`: 角色表（customer/merchant/rider/admin）
- `UserRole`: 用户角色关联表

**核心 API**:
```python
POST /api/v1/auth/register/           # 注册
POST /api/v1/auth/login/              # 登录
POST /api/v1/auth/refresh/            # 刷新 token
POST /api/v1/auth/logout/             # 登出
POST /api/v1/auth/sms/send/           # 发送验证码
GET  /api/v1/users/me/                # 获取当前用户信息
PATCH /api/v1/users/me/               # 更新用户信息
```

**关键代码**:
```python
# accounts/backends.py
class PhoneAuthBackend:
    """手机号 + 密码认证后端"""
    def authenticate(self, request, phone=None, password=None):
        try:
            user = User.objects.get(phone=phone)
            if user.check_password(password) and user.status == 'active':
                return user
        except User.DoesNotExist:
            return None

# accounts/permissions.py
def require_permission(permission: str):
    """权限检查装饰器"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_permission(permission):
                return JsonResponse({
                    'code': 1003,
                    'message': '权限不足',
                    'data': None
                }, status=403)
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
```

**依赖**:
- `djangorestframework-simplejwt` (JWT 认证)
- `django-redis` (token 黑名单)

---

### 2.2 merchants (商家管理)

**职责**: 商家入驻、店铺管理、商家审核

**核心 Model**:
- `Merchant`: 商家信息表

**核心 API**:
```python
# 公开接口
GET  /api/v1/merchants/                      # 商家列表（带搜索/筛选）
GET  /api/v1/merchants/{id}/                 # 商家详情

# 商家端
GET  /api/v1/merchant/store/                 # 我的店铺
PATCH /api/v1/merchant/store/                # 更新店铺信息
POST /api/v1/merchant/store/toggle/          # 开关店

# 管理端
GET  /api/v1/admin/merchants/applications/   # 商家申请列表
POST /api/v1/admin/merchants/{id}/approve/   # 审核通过
POST /api/v1/admin/merchants/{id}/reject/    # 审核拒绝
```

**关键逻辑**:
```python
# merchants/views.py
class MerchantListView(generics.ListAPIView):
    """商家列表（支持地理位置排序）"""
    serializer_class = MerchantSerializer
    
    def get_queryset(self):
        queryset = Merchant.objects.filter(status='open')
        
        # 地理位置筛选
        lat = self.request.query_params.get('latitude')
        lng = self.request.query_params.get('longitude')
        if lat and lng:
            # 使用 Haversine 公式计算距离
            queryset = queryset.annotate(
                distance=calculate_distance(lat, lng, 'latitude', 'longitude')
            ).order_by('distance')
        
        # 关键词搜索
        keyword = self.request.query_params.get('keyword')
        if keyword:
            queryset = queryset.filter(
                Q(store_name__icontains=keyword) |
                Q(notice__icontains=keyword)
            )
        
        return queryset
```

---

### 2.3 products (商品管理)

**职责**: 商品CRUD、分类管理、库存管理

**核心 Model**:
- `Product`: 商品表
- `Category`: 商品分类表

**核心 API**:
```python
# 公开接口
GET  /api/v1/merchants/{merchant_id}/products/  # 商家商品列表
GET  /api/v1/products/{id}/                      # 商品详情

# 商家端
GET    /api/v1/merchant/products/                # 我的商品列表
POST   /api/v1/merchant/products/                # 创建商品
PATCH  /api/v1/merchant/products/{id}/           # 更新商品
DELETE /api/v1/merchant/products/{id}/           # 删除商品
POST   /api/v1/merchant/products/{id}/toggle/    # 上下架
```

**关键逻辑**:
```python
# products/views.py
class ProductCreateView(generics.CreateAPIView):
    @require_permission('manage_products')
    def post(self, request):
        merchant = request.user.merchant
        data = request.data
        
        product = Product.objects.create(
            merchant=merchant,
            name=data['name'],
            price=data['price'],
            stock=data['stock'],
            # ...
        )
        
        return Response({
            'code': 0,
            'message': '商品创建成功',
            'data': ProductSerializer(product).data
        })
```

---

### 2.4 orders (订单核心)

**职责**: 订单创建、状态流转、订单查询

**核心 Model**:
- `Order`: 订单主表
- `OrderItem`: 订单明细表
- `OrderStatusLog`: 状态变更日志

**核心 API**:
```python
# 客户端
POST  /api/v1/orders/                    # 创建订单
GET   /api/v1/orders/                    # 订单列表
GET   /api/v1/orders/{id}/               # 订单详情
POST  /api/v1/orders/{id}/cancel/        # 取消订单
POST  /api/v1/orders/{id}/confirm/       # 确认收货
POST  /api/v1/orders/{id}/refund/        # 申请退款

# 商家端
GET   /api/v1/merchant/orders/           # 店铺订单列表
POST  /api/v1/merchant/orders/{id}/accept/   # 接单
POST  /api/v1/merchant/orders/{id}/reject/   # 拒单
POST  /api/v1/merchant/orders/{id}/prepare/  # 确认出餐

# 骑手端
GET   /api/v1/rider/orders/available/    # 可接单列表
POST  /api/v1/rider/orders/{id}/grab/    # 抢单
GET   /api/v1/rider/orders/mine/         # 我的配送单
POST  /api/v1/rider/orders/{id}/pickup/  # 取餐
POST  /api/v1/rider/orders/{id}/deliver/ # 送达
```

**关键逻辑**:
```python
# orders/state_machine.py
class OrderStateMachine:
    @classmethod
    @transaction.atomic
    def transition(cls, order, to_status, operator, note=None):
        """状态流转"""
        if not cls.can_transition(order.status, to_status):
            raise ValidationError('订单状态不允许此操作')
        
        from_status = order.status
        order.status = to_status
        order.save()
        
        # 记录日志
        OrderStatusLog.objects.create(
            order=order,
            from_status=from_status,
            to_status=to_status,
            operator_id=operator.id
        )
        
        # 触发后置动作
        cls._post_actions(order, to_status)

# orders/tasks.py
@shared_task
def check_pending_orders():
    """检查待支付订单超时"""
    timeout = timezone.now() - timedelta(minutes=30)
    pending_orders = Order.objects.filter(
        status='pending',
        created_at__lt=timeout
    )
    for order in pending_orders:
        OrderStateMachine.transition(order, 'cancelled', system_user)
```

---

### 2.5 riders (骑手管理)

**职责**: 骑手信息管理、派单、配送异常

**核心 Model**:
- `Rider`: 骑手信息表
- `DeliveryException`: 配送异常表

**核心 API**:
```python
GET  /api/v1/rider/profile/                      # 骑手信息
POST /api/v1/rider/status/                       # 更新工作状态
POST /api/v1/rider/orders/{id}/report_exception/ # 上报异常
GET  /api/v1/rider/earnings/                     # 收入统计
POST /api/v1/rider/withdraw/                     # 申请提现
```

**派单算法**:
```python
# riders/dispatch.py
def auto_assign_rider(order):
    """智能派单"""
    available_riders = Rider.objects.filter(
        work_status__in=['idle', 'busy']
    )
    
    scores = []
    for rider in available_riders:
        distance = calculate_distance(
            rider.current_latitude, rider.current_longitude,
            order.merchant.latitude, order.merchant.longitude
        )
        
        score = (
            max(0, 100 - distance * 10) * 0.5 +  # 距离分
            rider.rating * 20 * 0.3 +             # 评分分
            (100 - rider.current_orders * 30) * 0.2  # 忙碌度分
        )
        scores.append((rider, score))
    
    if scores:
        best_rider = max(scores, key=lambda x: x[1])[0]
        order.rider = best_rider
        order.save()
        notify_rider(best_rider, order)
        return best_rider
    
    return None
```

---

### 2.6 payments (支付结算)

**职责**: 支付对接、结算、提现

**核心 Model**:
- `Settlement`: 商家结算记录
- `Withdrawal`: 骑手提现记录

**核心 API**:
```python
POST /api/v1/payments/alipay/callback/   # 支付宝回调
POST /api/v1/payments/wechat/callback/   # 微信回调
GET  /api/v1/admin/settlements/          # 结算记录
POST /api/v1/admin/settlements/{id}/pay/ # 确认结算
```

**支付对接**:
```python
# payments/alipay.py
from alipay import AliPay

class AlipayService:
    def __init__(self):
        self.alipay = AliPay(
            appid=settings.ALIPAY_APP_ID,
            app_private_key_path=settings.ALIPAY_PRIVATE_KEY_PATH,
            alipay_public_key_path=settings.ALIPAY_PUBLIC_KEY_PATH,
            sign_type='RSA2'
        )
    
    def create_order(self, order):
        """创建支付订单"""
        return self.alipay.api_alipay_trade_page_pay(
            subject=f'订单 {order.order_no}',
            out_trade_no=order.order_no,
            total_amount=str(order.paid_amount),
            return_url=settings.ALIPAY_RETURN_URL,
            notify_url=settings.ALIPAY_NOTIFY_URL
        )
    
    def verify_callback(self, data):
        """验证回调签名"""
        signature = data.pop('sign')
        return self.alipay.verify(data, signature)
```

**结算逻辑**:
```python
# payments/tasks.py
@shared_task
def generate_weekly_settlement():
    """生成周结算记录（每周一凌晨执行）"""
    last_week_start = timezone.now() - timedelta(days=7)
    last_week_end = timezone.now()
    
    merchants = Merchant.objects.filter(status='open')
    for merchant in merchants:
        orders = Order.objects.filter(
            merchant=merchant,
            status='finished',
            finished_at__gte=last_week_start,
            finished_at__lt=last_week_end
        )
        
        total_revenue = sum(o.paid_amount for o in orders)
        commission = total_revenue * 0.1  # 10% 佣金
        
        Settlement.objects.create(
            merchant=merchant,
            period_start=last_week_start.date(),
            period_end=last_week_end.date(),
            order_count=orders.count(),
            total_revenue=total_revenue,
            commission_amount=commission,
            net_amount=total_revenue - commission,
            status='pending'
        )
```

---

### 2.7 promotions (营销活动)

**职责**: 优惠券、营销活动、价格计算

**核心 Model**:
- `Coupon`: 优惠券表
- `UserCoupon`: 用户优惠券关联
- `Campaign`: 营销活动表

**核心 API**:
```python
GET  /api/v1/coupons/available/          # 可领取优惠券
POST /api/v1/coupons/{id}/claim/         # 领取优惠券
GET  /api/v1/coupons/mine/               # 我的优惠券
POST /api/v1/merchant/campaigns/         # 创建活动
```

**价格计算**:
```python
# promotions/calculator.py
class PriceCalculator:
    @staticmethod
    def calculate_order_price(order, coupon_id=None):
        """计算订单价格"""
        # 商品总价
        items_total = sum(
            item.unit_price * item.quantity 
            for item in order.items
        )
        
        # 营销活动优惠
        campaign_discount = 0
        active_campaigns = Campaign.objects.filter(
            merchant=order.merchant,
            status='active',
            start_at__lte=timezone.now(),
            end_at__gte=timezone.now()
        )
        for campaign in active_campaigns:
            if campaign.type == 'full_reduction':
                rules = campaign.rules
                if items_total >= rules['min_spend']:
                    campaign_discount = rules['discount']
        
        # 优惠券优惠
        coupon_discount = 0
        if coupon_id:
            user_coupon = UserCoupon.objects.get(
                id=coupon_id,
                user=order.customer,
                status='unused'
            )
            coupon = user_coupon.coupon
            if items_total >= coupon.min_spend:
                if coupon.type == 'reduction':
                    coupon_discount = coupon.reduction_amount
                elif coupon.type == 'discount':
                    coupon_discount = items_total * (1 - coupon.discount_rate / 100)
        
        # 配送费
        delivery_fee = order.merchant.delivery_fee
        
        # 实付金额
        paid_amount = items_total - campaign_discount - coupon_discount + delivery_fee
        
        return {
            'items_total': items_total,
            'campaign_discount': campaign_discount,
            'coupon_discount': coupon_discount,
            'delivery_fee': delivery_fee,
            'paid_amount': max(0, paid_amount)
        }
```

---

### 2.8 reviews (评价系统)

**职责**: 订单评价、商家回复

**核心 Model**:
- `Review`: 评价表

**核心 API**:
```python
POST /api/v1/reviews/                         # 创建评价
GET  /api/v1/merchants/{id}/reviews/          # 商家评价列表
POST /api/v1/merchant/reviews/{id}/reply/     # 回复评价
```

---

### 2.9 notifications (消息推送)

**职责**: WebSocket 实时通知、短信推送

**WebSocket 配置**:
```python
# notifications/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
]

# notifications/consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # 从 query 参数获取 token
        token = self.scope['query_string'].decode().split('=')[1]
        user = verify_jwt_token(token)
        
        if not user:
            await self.close()
            return
        
        self.user = user
        self.group_name = f'user_{user.id}'
        
        # 加入用户组
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def notify(self, event):
        """接收来自 group_send 的消息"""
        await self.send_json(event['data'])

# 发送通知
from channels.layers import get_channel_layer

def send_notification(user_id, notification_type, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'user_{user_id}',
        {
            'type': 'notify',
            'data': {
                'type': notification_type,
                'data': data
            }
        }
    )
```

---

### 2.10 addresses (地址管理)

**职责**: 收货地址CRUD

**核心 Model**:
- `Address`: 地址表

**核心 API**:
```python
GET    /api/v1/addresses/             # 地址列表
POST   /api/v1/addresses/             # 创建地址
PATCH  /api/v1/addresses/{id}/        # 更新地址
DELETE /api/v1/addresses/{id}/        # 删除地址
POST   /api/v1/addresses/{id}/set_default/  # 设置默认
```

---

### 2.11 admin_panel (管理后台)

**职责**: 数据看板、用户管理、审核、系统配置

**核心 API**:
```python
GET  /api/v1/admin/dashboard/                # 数据看板
GET  /api/v1/admin/users/                    # 用户列表
POST /api/v1/admin/users/{id}/ban/           # 封禁用户
GET  /api/v1/admin/merchants/applications/   # 商家审核
GET  /api/v1/admin/config/                   # 系统配置
PATCH /api/v1/admin/config/                  # 更新配置
```

---

### 2.12 common (公共模块)

**公共组件**:

```python
# common/response.py
class APIResponse:
    @staticmethod
    def success(data=None, message='success'):
        return Response({
            'code': 0,
            'message': message,
            'data': data
        })
    
    @staticmethod
    def error(code, message, data=None):
        return Response({
            'code': code,
            'message': message,
            'data': data
        })

# common/exceptions.py
class BusinessException(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message

# common/middlewares.py
class RateLimitMiddleware:
    """限流中间件"""
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 实现限流逻辑
        pass
```

---

## 3. 依赖关系图

```
accounts (基础)
   ↑
   ├── merchants → products
   ├── riders
   └── addresses
        ↑
        └── orders ← products
             ↑        ↑
             ├────────┴─ promotions
             ├─ payments
             ├─ reviews
             └─ notifications

admin_panel → 依赖所有模块
common → 被所有模块依赖
```

**依赖原则**:
- **单向依赖**: 避免循环依赖
- **低耦合**: 模块间通过 signal/event 通信
- **高内聚**: 相关功能聚合在同一 app

---

## 4. Celery 异步任务

### 4.1 任务配置

```python
# config/celery.py
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('elm')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# 定时任务
app.conf.beat_schedule = {
    'check-pending-orders': {
        'task': 'orders.tasks.check_pending_orders',
        'schedule': 60.0,  # 每 60 秒
    },
    'generate-weekly-settlement': {
        'task': 'payments.tasks.generate_weekly_settlement',
        'schedule': crontab(day_of_week=1, hour=0, minute=0),  # 每周一凌晨
    },
}
```

### 4.2 常见任务

| 任务 | 频率 | 模块 |
|------|------|------|
| 检查待支付订单超时 | 每分钟 | orders |
| 检查商家接单超时 | 每分钟 | orders |
| 生成周结算记录 | 每周一 | payments |
| 发送短信验证码 | 实时 | notifications |
| 更新骑手位置 | 每 10 秒 | riders |

---

## 5. 数据库迁移策略

### 5.1 迁移顺序

```bash
# 1. 基础表
python manage.py makemigrations accounts
python manage.py migrate accounts

# 2. 业务表
python manage.py makemigrations merchants products addresses
python manage.py migrate merchants products addresses

# 3. 订单表
python manage.py makemigrations orders riders
python manage.py migrate orders riders

# 4. 其他表
python manage.py makemigrations promotions reviews payments notifications
python manage.py migrate promotions reviews payments notifications
```

### 5.2 初始化数据

```bash
python manage.py init_roles           # 初始化角色
python manage.py loaddata categories  # 加载商品分类
```

---

## 6. 测试策略

### 6.1 单元测试

```python
# orders/tests/test_state_machine.py
class OrderStateMachineTestCase(TestCase):
    def test_paid_to_accepted(self):
        order = Order.objects.create(status='paid', ...)
        merchant = Merchant.objects.create(...)
        
        OrderStateMachine.transition(order, 'accepted', merchant.user)
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'accepted')
        self.assertIsNotNone(order.accepted_at)
```

### 6.2 集成测试

```python
# orders/tests/test_api.py
class OrderAPITestCase(APITestCase):
    def test_create_order(self):
        self.client.force_authenticate(user=self.customer)
        
        response = self.client.post('/api/v1/orders/', {
            'merchant_id': 1,
            'address_id': 1,
            'items': [{'product_id': 1, 'quantity': 2}]
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['code'], 0)
```

---

## 7. 部署清单

### 7.1 环境变量

```bash
# .env
SECRET_KEY=django-secret-key
DEBUG=False
ALLOWED_HOSTS=api.elm.com

DATABASE_URL=postgresql://user:pass@localhost:5432/elm
REDIS_URL=redis://localhost:6379/0

ALIPAY_APP_ID=xxx
ALIPAY_PRIVATE_KEY_PATH=/path/to/key
```

### 7.2 启动命令

```bash
# Web 服务器
daphne config.asgi:application --port 8000 --bind 0.0.0.0

# Celery Worker
celery -A config worker -l info

# Celery Beat (定时任务)
celery -A config beat -l info
```

---

## 8. 相关文档

- [数据库设计](./设计说明书.md)
- [API 接口文档](./API.md)
- [RBAC 权限设计](./03-rbac-design.md)
- [订单生命周期](./04-order-lifecycle.md)
