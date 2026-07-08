# 03 - RBAC 权限设计

## 1. 权限模型概述

ELM 采用基于角色的访问控制（Role-Based Access Control, RBAC）模型，将系统权限分配给角色，用户通过拥有的角色获得相应权限。

**核心概念**:
- **User (用户)**: 系统账号，通过手机号 + 密码认证
- **Role (角色)**: 系统预定义的四种身份（客户、商家、骑手、管理员）
- **Permission (权限)**: 细粒度的操作许可（如 `create_order`, `manage_products`）
- **Resource (资源)**: 被保护的数据对象（订单、商品、用户）

**设计原则**:
- **最小权限原则**: 用户仅拥有完成工作所需的最小权限集
- **职责分离**: 同一用户不应同时拥有冲突的角色（如商家 + 骑手）
- **数据隔离**: 商家只能查看自己的订单，骑手只能查看分配给自己的订单
- **可扩展性**: 权限配置存储在数据库，支持动态调整

---

## 2. 角色定义

### 2.1 Customer (客户)

**职责**: 浏览商品、下单、评价

| 权限代码 | 权限描述 | 适用资源 |
|---------|---------|---------|
| `view_merchants` | 查看商家列表/详情 | Merchant |
| `view_products` | 查看商品列表/详情 | Product |
| `manage_addresses` | 管理收货地址 | Address |
| `create_order` | 创建订单 | Order |
| `view_own_orders` | 查看自己的订单 | Order |
| `cancel_order` | 取消订单 | Order |
| `request_refund` | 申请退款 | Order |
| `confirm_delivery` | 确认收货 | Order |
| `create_review` | 创建评价 | Review |
| `claim_coupon` | 领取优惠券 | Coupon |
| `view_own_coupons` | 查看我的优惠券 | UserCoupon |

**数据访问范围**:
- **Order**: 仅 `customer_id = current_user.id`
- **Address**: 仅 `user_id = current_user.id`
- **Review**: 可创建，仅能查看自己创建的

---

### 2.2 Merchant (商家)

**职责**: 管理店铺、商品、订单、营销活动

| 权限代码 | 权限描述 | 适用资源 |
|---------|---------|---------|
| `manage_store` | 管理店铺信息 | Merchant |
| `toggle_store_status` | 开关店 | Merchant |
| `manage_products` | 创建/编辑/删除商品 | Product |
| `toggle_product_status` | 上下架商品 | Product |
| `view_merchant_orders` | 查看店铺订单 | Order |
| `accept_order` | 接单 | Order |
| `reject_order` | 拒单 | Order |
| `confirm_prepared` | 确认出餐 | Order |
| `view_reviews` | 查看店铺评价 | Review |
| `reply_review` | 回复评价 | Review |
| `manage_campaigns` | 管理营销活动 | Campaign |
| `view_merchant_data` | 查看经营数据 | Statistics |

**数据访问范围**:
- **Merchant**: 仅 `user_id = current_user.id` 的店铺
- **Product**: 仅 `merchant_id = current_merchant.id`
- **Order**: 仅 `merchant_id = current_merchant.id`
- **Review**: 仅 `merchant_id = current_merchant.id`
- **Campaign**: 仅 `merchant_id = current_merchant.id`

**状态约束**:
- 店铺状态为 `pending` 或 `rejected` 时，无法接单和管理商品
- 店铺状态为 `closed` 时，无法接单

---

### 2.3 Rider (骑手)

**职责**: 接单、配送、上报异常

| 权限代码 | 权限描述 | 适用资源 |
|---------|---------|---------|
| `view_available_orders` | 查看可接单列表 | Order |
| `grab_order` | 抢单 | Order |
| `view_rider_orders` | 查看我的配送单 | Order |
| `update_delivery_status` | 更新配送状态 | Order |
| `report_exception` | 上报异常 | DeliveryException |
| `update_work_status` | 更新工作状态 | Rider |
| `view_rider_earnings` | 查看收入统计 | Statistics |
| `request_withdrawal` | 申请提现 | Withdrawal |

**数据访问范围**:
- **Order**: 
  - 查看可接单列表时: `status = 'ready'` 且 `rider_id IS NULL`
  - 查看我的配送单时: `rider_id = current_rider.id`
- **Rider**: 仅 `user_id = current_user.id`
- **DeliveryException**: 仅 `rider_id = current_rider.id`
- **Withdrawal**: 仅 `rider_id = current_rider.id`

**状态约束**:
- 工作状态为 `offline` 时，无法抢单
- 工作状态为 `delivering` 时，无法抢新单（需先完成当前订单）

---

### 2.4 Admin (管理员)

**职责**: 平台管理、审核、财务结算、系统配置

| 权限代码 | 权限描述 | 适用资源 |
|---------|---------|---------|
| `view_all_users` | 查看所有用户 | User |
| `ban_user` | 封禁用户 | User |
| `unban_user` | 解封用户 | User |
| `view_merchant_applications` | 查看商家申请 | Merchant |
| `approve_merchant` | 审核通过商家 | Merchant |
| `reject_merchant` | 拒绝商家申请 | Merchant |
| `view_all_orders` | 查看所有订单 | Order |
| `view_settlements` | 查看结算记录 | Settlement |
| `pay_settlement` | 确认结算支付 | Settlement |
| `manage_system_config` | 管理系统配置 | SystemConfig |
| `view_dashboard` | 查看数据看板 | Statistics |
| `handle_reports` | 处理举报 | Report |

**数据访问范围**:
- **无限制**: 管理员可查看所有数据

**特殊权限**:
- 管理员拥有通配符权限 `*`，代表所有权限

---

## 3. 权限继承与组合

### 3.1 权限继承
不支持权限继承（四个角色平级，无上下级关系）。

### 3.2 多角色组合
一个用户可以拥有多个角色，权限取并集。

**示例**:
```python
user = User.objects.get(id=1)
user.roles = ['customer', 'merchant']  # 既是客户，也是商家

# 权限判断
user.has_permission('create_order')      # True (customer)
user.has_permission('manage_products')   # True (merchant)
```

**冲突角色检测**:
系统应阻止以下角色组合：
- `merchant` + `rider` (商家不能同时是骑手，避免利益冲突)
- `admin` + 其他角色 (管理员应独立账号)

---

## 4. 权限检查机制

### 4.1 装饰器检查（Django View）

```python
from functools import wraps
from rest_framework.response import Response

def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_permission(permission):
                return Response(
                    {'code': 1003, 'message': '权限不足', 'data': None},
                    status=403
                )
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

# 使用示例
@require_permission('manage_products')
def create_product(request):
    # 只有商家可以访问
    pass
```

### 4.2 对象级权限检查

```python
def check_object_permission(user, action, obj):
    """
    检查用户对特定对象的操作权限
    """
    if action == 'view_order':
        # 客户只能查看自己的订单
        if user.has_role('customer') and obj.customer_id == user.id:
            return True
        # 商家只能查看自己店铺的订单
        if user.has_role('merchant') and obj.merchant_id == user.merchant.id:
            return True
        # 骑手只能查看分配给自己的订单
        if user.has_role('rider') and obj.rider_id == user.rider.id:
            return True
        # 管理员可查看所有订单
        if user.has_role('admin'):
            return True
        return False
    
    # 其他对象权限检查...
    return False
```

### 4.3 QuerySet 过滤（数据隔离）

```python
class OrderViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        
        if user.has_role('customer'):
            return Order.objects.filter(customer_id=user.id)
        
        elif user.has_role('merchant'):
            return Order.objects.filter(merchant_id=user.merchant.id)
        
        elif user.has_role('rider'):
            return Order.objects.filter(rider_id=user.rider.id)
        
        elif user.has_role('admin'):
            return Order.objects.all()
        
        return Order.objects.none()
```

---

## 5. 权限表设计实现

### 5.1 User Model 扩展

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone = models.CharField(max_length=11, unique=True)
    status = models.CharField(max_length=20, default='active')
    
    def get_roles(self):
        """获取用户所有角色"""
        return [ur.role.name for ur in self.user_roles.all()]
    
    def has_role(self, role_name: str) -> bool:
        """判断用户是否拥有某个角色"""
        return role_name in self.get_roles()
    
    def has_permission(self, permission: str) -> bool:
        """判断用户是否拥有某个权限"""
        if self.has_role('admin'):
            return True  # 管理员拥有所有权限
        
        user_permissions = set()
        for role in self.user_roles.select_related('role').all():
            user_permissions.update(role.role.permissions)
        
        return permission in user_permissions
```

### 5.2 Role Model

```python
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    permissions = models.JSONField(default=list)
    
    class Meta:
        db_table = 'role'
```

### 5.3 UserRole Model

```python
class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_role'
        unique_together = ('user', 'role')
```

---

## 6. 初始权限数据

### 6.1 角色权限配置

```python
ROLE_PERMISSIONS = {
    'customer': [
        'view_merchants',
        'view_products',
        'manage_addresses',
        'create_order',
        'view_own_orders',
        'cancel_order',
        'request_refund',
        'confirm_delivery',
        'create_review',
        'claim_coupon',
        'view_own_coupons',
    ],
    'merchant': [
        'manage_store',
        'toggle_store_status',
        'manage_products',
        'toggle_product_status',
        'view_merchant_orders',
        'accept_order',
        'reject_order',
        'confirm_prepared',
        'view_reviews',
        'reply_review',
        'manage_campaigns',
        'view_merchant_data',
    ],
    'rider': [
        'view_available_orders',
        'grab_order',
        'view_rider_orders',
        'update_delivery_status',
        'report_exception',
        'update_work_status',
        'view_rider_earnings',
        'request_withdrawal',
    ],
    'admin': ['*'],  # 所有权限
}
```

### 6.2 数据初始化脚本

```python
# management/commands/init_roles.py
from django.core.management.base import BaseCommand
from accounts.models import Role

class Command(BaseCommand):
    help = 'Initialize system roles'
    
    def handle(self, *args, **kwargs):
        roles_data = [
            ('customer', '客户', ROLE_PERMISSIONS['customer']),
            ('merchant', '商家', ROLE_PERMISSIONS['merchant']),
            ('rider', '骑手', ROLE_PERMISSIONS['rider']),
            ('admin', '管理员', ROLE_PERMISSIONS['admin']),
        ]
        
        for name, display_name, permissions in roles_data:
            Role.objects.update_or_create(
                name=name,
                defaults={
                    'display_name': display_name,
                    'permissions': permissions
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Roles initialized successfully'))
```

---

## 7. API 权限矩阵

| API 端点 | Customer | Merchant | Rider | Admin |
|---------|----------|----------|-------|-------|
| `POST /api/v1/auth/register/` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/auth/login/` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/merchants/` | ✅ | ✅ | ❌ | ✅ |
| `GET /api/v1/merchants/{id}/products/` | ✅ | ✅ | ❌ | ✅ |
| `POST /api/v1/orders/` | ✅ | ❌ | ❌ | ✅ |
| `GET /api/v1/orders/` | ✅ (own) | ❌ | ❌ | ✅ (all) |
| `POST /api/v1/orders/{id}/cancel/` | ✅ (own) | ❌ | ❌ | ✅ |
| `GET /api/v1/merchant/orders/` | ❌ | ✅ (own) | ❌ | ✅ |
| `POST /api/v1/merchant/orders/{id}/accept/` | ❌ | ✅ (own) | ❌ | ✅ |
| `POST /api/v1/merchant/products/` | ❌ | ✅ | ❌ | ✅ |
| `GET /api/v1/rider/orders/available/` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/v1/rider/orders/{id}/grab/` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/v1/rider/orders/{id}/deliver/` | ❌ | ❌ | ✅ (own) | ✅ |
| `GET /api/v1/admin/dashboard/` | ❌ | ❌ | ❌ | ✅ |
| `POST /api/v1/admin/users/{id}/ban/` | ❌ | ❌ | ❌ | ✅ |

---

## 8. 安全最佳实践

### 8.1 JWT Token 携带角色信息

```python
def generate_jwt_token(user):
    payload = {
        'user_id': user.id,
        'roles': user.get_roles(),
        'exp': datetime.utcnow() + timedelta(hours=2),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
```

### 8.2 防止权限提升攻击

```python
# ❌ 错误示例：允许用户指定角色
@api_view(['POST'])
def register(request):
    role = request.data.get('role')  # 用户可以传入 'admin'
    user = User.objects.create(...)
    UserRole.objects.create(user=user, role_id=role)  # 危险！

# ✅ 正确示例：白名单验证
ALLOWED_REGISTER_ROLES = ['customer', 'merchant', 'rider']

@api_view(['POST'])
def register(request):
    role = request.data.get('role')
    if role not in ALLOWED_REGISTER_ROLES:
        return Response({'code': 9001, 'message': '无效的角色'})
    # ...
```

### 8.3 敏感操作二次验证

```python
@api_view(['POST'])
@require_permission('ban_user')
def ban_user(request, user_id):
    # 封禁用户前验证操作密码
    operation_password = request.data.get('operation_password')
    if not verify_operation_password(request.user, operation_password):
        return Response({'code': 1002, 'message': '操作密码错误'})
    
    target_user = User.objects.get(id=user_id)
    target_user.status = 'banned'
    target_user.save()
    # ...
```

### 8.4 审计日志

```python
class PermissionLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.BigIntegerField(null=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    success = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

# 记录所有敏感操作
def log_permission_action(user, action, resource_type, resource_id, success):
    PermissionLog.objects.create(
        user=user,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT'),
        success=success
    )
```

---

## 9. 权限测试

### 9.1 单元测试示例

```python
from django.test import TestCase
from accounts.models import User, Role, UserRole

class RBACTestCase(TestCase):
    def setUp(self):
        # 创建角色
        self.customer_role = Role.objects.create(
            name='customer',
            permissions=['view_merchants', 'create_order']
        )
        
        # 创建用户
        self.user = User.objects.create(phone='13800138000')
        UserRole.objects.create(user=self.user, role=self.customer_role)
    
    def test_customer_has_view_merchants_permission(self):
        self.assertTrue(self.user.has_permission('view_merchants'))
    
    def test_customer_no_manage_products_permission(self):
        self.assertFalse(self.user.has_permission('manage_products'))
    
    def test_admin_has_all_permissions(self):
        admin_role = Role.objects.create(name='admin', permissions=['*'])
        admin_user = User.objects.create(phone='13900139000')
        UserRole.objects.create(user=admin_user, role=admin_role)
        
        self.assertTrue(admin_user.has_permission('any_permission'))
```

---

## 10. 权限演进路线

### Phase 1 (当前): 基于角色的静态权限
- 四种预定义角色
- 权限存储在 `Role.permissions` JSON 字段
- 通过代码硬编码权限检查

### Phase 2 (未来): 动态权限配置
- 管理员可在后台界面动态添加/删除权限
- 权限独立成表 `Permission(id, code, name, resource)`
- 角色-权限多对多关联

### Phase 3 (扩展): 细粒度权限
- 支持字段级权限（如商家只能修改自己的 `store_name`，不能修改 `rating`）
- 支持条件权限（如"仅在营业时间内可接单"）

---

## 11. 相关文档

- [数据库设计](./设计说明书.md) - User, Role, UserRole 表结构
- [API 接口文档](./API.md) - 各接口的权限要求
- [订单生命周期](./04-order-lifecycle.md) - 订单状态变更的权限控制
