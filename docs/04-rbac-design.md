# 04 - 权限与认证设计

## 1. 认证体系

### 1.1 整体架构

```
┌──────────────────────────────────────────────────────┐
│                    认证层 (Auth)                       │
│  ┌─────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ JWT 签发/验证 │  │ 手机验证码  │  │ 密码登录       │  │
│  └─────────────┘  └────────────┘  └───────────────┘  │
├──────────────────────────────────────────────────────┤
│                    授权层 (RBAC)                      │
│  ┌──────────┐    ┌──────────────┐    ┌────────────┐  │
│  │   User   │───<│  User_Role   │>───│    Role     │  │
│  └──────────┘    └──────────────┘    └────────────┘  │
│                                            │          │
│                               ┌────────────┴──────┐   │
│                               │   Permissions      │  │
│                               │  (Django + 自定义)  │  │
│                               └───────────────────┘   │
├──────────────────────────────────────────────────────┤
│                 权限校验层 (DRF Permission)            │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ 角色守卫    │  │ 菜单权限      │  │ 按钮权限     │  │
│  │ RoleGuard  │  │ MenuAccess   │  │ BtnAccess   │  │
│  └────────────┘  └──────────────┘  └─────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 1.2 JWT Token 设计

#### Access Token Payload

```json
{
  "sub": 1,                          // user_id
  "username": "zhangsan",
  "roles": ["customer"],             // 角色编码列表，快速鉴权
  "iat": 1720166400,                 // 签发时间
  "exp": 1720173600,                 // 过期时间 (2小时后)
  "jti": "abc123..."                 // token唯一ID，用于黑名单
}
```

#### Refresh Token

- 存储在 Redis 中，key: `refresh_token:{token_hash}`，TTL 7天自动过期
- Value 存储 JSON: `{"user_id": 1, "device": "iOS", "created_at": "..."}`
- 支持主动登出（`DEL refresh_token:{token_hash}`）
- 支持多设备登录，各自持有独立 refresh token
- 每次 refresh 轮换：旧 refresh token 删除，签发新 token

#### Token 刷新流程

```
1. 客户端检测到 Access Token 即将过期 (前端拦截器判断 401)
2. 用 Refresh Token 调用 /api/v1/auth/refresh/
3. 服务端验证 Refresh Token 有效后，签发新 Access Token
4. 如果 Refresh Token 也过期，要求用户重新登录
```

### 1.3 手机验证码注册/登录

```
注册流程:
  发送验证码 → 验证码存入Redis (5分钟有效，key: sms:register:{phone})
  → 用户提交注册 → 验证码校验 → 创建User + 分配customer角色 → 签发Token

登录流程 (密码模式为主，验证码为补充):
  输入手机号+密码 → 验证 → 签发Token
  或: 输入手机号+验证码 → 验证 → 签发Token (快捷登录)
```

## 2. RBAC 权限模型

### 2.1 核心概念

| 概念 | Django对应 | 说明 |
|------|-----------|------|
| 用户 (User) | 自定义 User Model | 一个用户可拥有多个角色 |
| 角色 (Role) | Group (扩展) | customer, merchant, rider, admin |
| 权限 (Permission) | Permission (扩展) | 细粒度的操作权限（增删改查） |
| 菜单权限 | 自定义 Menu 模型 | 前端路由/导航控制 |
| 按钮权限 | 自定义 Button 模型 | 页面内操作按钮控制 |

### 2.2 权限粒度

系统采用**三级权限**控制：

```
Level 1: 角色级  — 区分客户/商家/配送员/管理员
Level 2: 菜单级  — 控制角色能看到哪些页面/功能模块
Level 3: 按钮级  — 控制页面内具体操作按钮（审核通过、封禁用户等）
```

- **客户/商家/配送员**：Level 1 角色级 + Level 2 菜单级即可满足，按钮级需求极少
- **管理员**：需要完整的三级权限，因为平台内部需要区分超级管理员、运营、客服、财务等子角色

### 2.3 数据库模型扩展

```python
# 基于 Django 的内置 Permission 模型扩展

# Role 模型 (Group 的包装/扩展)
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50, unique=True)  # 程序引用标识
    description = models.CharField(max_length=200)
    permissions = models.ManyToManyField(Permission, blank=True)
    menus = models.ManyToManyField('Menu', blank=True)

# 菜单模型 (管理后台导航)
class Menu(models.Model):
    name = models.CharField(max_length=50)
    path = models.CharField(max_length=200)      # 前端路由
    icon = models.CharField(max_length=50)       # 图标标识
    parent = models.ForeignKey('self', null=True, on_delete=CASCADE)
    sort_order = models.IntegerField(default=0)
    is_visible = models.BooleanField(default=True)

# 按钮权限 (管理后台操作按钮)
class Button(models.Model):
    name = models.CharField(max_length=50)        # 按钮名称
    code = models.CharField(max_length=100)       # 按钮标识，如 "user.ban", "merchant.approve"
    menu = models.ForeignKey(Menu, on_delete=CASCADE)

# 角色-按钮多对多
class RoleButton(models.Model):
    role = models.ForeignKey(Role, on_delete=CASCADE)
    button = models.ForeignKey(Button, on_delete=CASCADE)
```

### 2.4 权限校验中间件链

DRF 的请求处理管道中，权限校验分层执行：

```
1. IsAuthenticated       → 验证 JWT Token 有效性
2. RolePermission        → 根据 URL 和方法检查用户角色是否允许访问
3. MenuPermission        → (管理后台专用) 检查是否有菜单访问权
4. ButtonPermission      → (管理后台专用) 检查是否有按钮操作权
5. ObjectPermission      → (业务校验) 检查操作者是否为资源所有者
```

### 2.5 DRF Permission 实现示例

```python
# apps/common/permissions.py

from rest_framework.permissions import BasePermission

class RolePermission(BasePermission):
    """角色级权限"""
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles  # e.g., ['admin', 'merchant']

    def has_permission(self, request, view):
        user_roles = request.user.roles.values_list('code', flat=True)
        return any(role in self.allowed_roles for role in user_roles)


class IsResourceOwner(BasePermission):
    """资源所有权校验 —— 只能操作自己的订单/地址等"""
    def has_object_permission(self, request, view, obj):
        # Order 使用 customer 字段指向 User；UserAddress 使用 user 字段
        owner = getattr(obj, 'customer', None) or getattr(obj, 'user', None)
        return owner == request.user


class IsMerchantOwner(BasePermission):
    """商家只能操作自己店铺的资源"""
    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'merchant'):
            return obj.merchant_id == request.user.merchant.id
        return False
```

### 2.6 ViewSet 中的权限配置

```python
# apps/orders/views.py

from rest_framework.viewsets import ModelViewSet
from apps.common.permissions import RolePermission, IsResourceOwner

class OrderViewSet(ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action == 'create':
            # 只有客户可以下单
            return [RolePermission(['customer'])]
        elif self.action in ['list', 'retrieve']:
            # 客户看自己订单，商家看自己店铺订单，骑手看自己配送订单
            return [RolePermission(['customer', 'merchant', 'rider', 'admin'])]
        elif self.action == 'cancel':
            return [RolePermission(['customer', 'admin']), IsResourceOwner()]
        return [RolePermission(['admin'])]
```

## 3. 角色-接口权限映射表

| URL前缀 | 客户 | 商家 | 骑手 | 管理员 | 说明 |
|---------|:---:|:---:|:---:|:---:|------|
| `/auth/*` | ✓ | ✓ | ✓ | ✓ | 所有角色可访问 |
| `/users/me` | ✓ | ✓ | ✓ | ✓ | 个人资料 |
| `/users/addresses/*` | ✓ | ✗ | ✗ | ✗ | 仅客户管理地址 |
| `/merchants/` (GET) | ✓ | ✗ | ✗ | ✓ | 公开浏览 |
| `/merchant/profile` | ✗ | ✓ | ✗ | ✗ | 商家编辑 |
| `/merchant/orders/*` | ✗ | ✓ | ✗ | ✗ | 商家接单 |
| `/merchant/products/*` | ✗ | ✓ | ✗ | ✗ | 商品管理 |
| `/cart/*` | ✓ | ✗ | ✗ | ✗ | |
| `/orders/` (客户) | ✓ | ✗ | ✗ | ✓ | |
| `/rider/orders/*` | ✗ | ✗ | ✓ | ✗ | |
| `/rider/status` | ✗ | ✗ | ✓ | ✗ | |
| `/admin/*` | ✗ | ✗ | ✗ | ✓ | 管理后台 |

## 4. 商家入驻审核流

```
用户注册 (customer角色)
  ↓
申请成为商家
  ↓
提交资质材料 (营业执照、许可证)
  ↓
管理员审核 ──驳回──→ 通知用户，重新提交
  ↓ 通过
自动创建 Merchant 记录
  ↓
给 User 追加 merchant 角色
  ↓
商家登录后进入商家管理后台
```

## 5. 安全措施

### 5.1 Token 安全
- Access Token 短期有效 (2小时)，Refresh Token 长期有效 (7天)
- Refresh Token 使用 HTTP-Only Cookie 或安全存储
- 服务端维护 Token 黑名单 (登出后即时失效)
- 检测到异常IP登录时自动使所有 Token 失效

### 5.2 接口安全
- 敏感操作 (提现、修改支付密码) 需二次验证 (短信验证码)
- 登录失败5次锁定15分钟
- 订单金额在后端重新计算，不信任前端提交的金额
- 外部回调接口通过签名验证 (支付回调、SMS回调)

### 5.3 数据安全
- 密码使用 Django `make_password` (PBKDF2 + SHA256)
- 身份证号加密存储 (AES-256)
- 手机号脱敏返回 (`138****0001`)
- 生产环境强制 HTTPS

### 5.4 频率限制 (Rate Limiting / Throttling)

使用 DRF 内置 Throttling 机制，按端点类型分级：

| 端点类型 | 限制策略 | 说明 |
|---------|---------|------|
| 认证接口 (`/auth/login/`, `/auth/sms/send/`) | 5次/分钟/IP | 防暴力破解 + 短信滥发 |
| 短信发送 (`/auth/sms/send/`) | 1次/分钟/手机号 | 防止短信轰炸 |
| 下单接口 (`POST /orders/`) | 10次/分钟/用户 | 防恶意下单 |
| 支付回调 | 不限 | 依赖第三方签名验证 |
| 公开浏览 (`GET /merchants/`, `/products/`) | 100次/分钟/IP | 防爬虫 |
| 通用 API | 1000次/小时/用户 | 正常使用保护 |

```python
# config/settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '1000/hour',
        'anon': '100/day',
        'auth': '5/min',
        'sms': '1/min',
        'order': '10/min',
    },
}
```
