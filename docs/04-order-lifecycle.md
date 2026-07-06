# 04 - 订单生命周期设计

## 1. 订单状态机

### 1.1 状态枚举

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

### 1.2 状态流转图

```
                    ┌─────────────┐
                    │   pending   │ 待支付
                    │  (创建订单)  │
                    └──────┬──────┘
                           │
                  ┌────────┴─────────┐
                  │ 支付成功          │ 超时/取消
                  ▼                  ▼
           ┌──────────┐        ┌──────────┐
           │   paid   │        │cancelled │
           │ (已支付)  │        │ (已取消)  │
           └─────┬────┘        └──────────┘
                 │
        ┌────────┴─────────┐
        │ 商家接单          │ 商家拒单
        ▼                  ▼
 ┌──────────┐        ┌──────────┐
 │ accepted │        │cancelled │
 │(商家接单) │        │ (已取消)  │
 └─────┬────┘        └──────────┘
       │
       │ 商家确认出餐
       ▼
 ┌──────────┐
 │preparing │
 │ (准备中)  │
 └─────┬────┘
       │
       │ 出餐完成
       ▼
 ┌──────────┐
 │  ready   │
 │ (待取餐)  │
 └─────┬────┘
       │
       │ 骑手取餐
       ▼
 ┌──────────┐
 │  picked  │
 │ (配送中)  │
 └─────┬────┘
       │
       │ 骑手送达
       ▼
 ┌──────────┐
 │delivered │
 │ (已送达)  │
 └─────┬────┘
       │
       │ 7天后自动确认/客户手动确认
       ▼
 ┌──────────┐
 │ finished │
 │ (已完成)  │
 └──────────┘

特殊流程（退款）:
任意状态 ──申请退款──> refunding (退款中) ──审核通过──> refunded (已退款)
```

---

## 2. 状态流转规则

### 2.1 pending → paid (支付)

**触发条件**:
- 客户完成支付（支付宝/微信/余额）
- 支付接口返回成功

**操作主体**: 系统（支付回调）

**前置条件**:
- 订单状态为 `pending`
- 订单创建时间 < 30分钟（超时自动取消）

**后置动作**:
- 扣减商品库存
- 记录 `paid_at` 时间戳
- 通过 WebSocket 推送新订单通知给商家
- 发送短信通知客户"支付成功"

**失败回滚**:
- 支付失败 → 保持 `pending`，客户可重新支付
- 库存不足 → 自动退款，状态变为 `cancelled`

---

### 2.2 paid → accepted (商家接单)

**触发条件**:
- 商家点击"接单"按钮
- 或开启自动接单功能（配置项）

**操作主体**: 商家

**前置条件**:
- 订单状态为 `paid`
- 商家店铺状态为 `open`

**后置动作**:
- 记录 `accepted_at` 时间戳
- 通过 WebSocket 推送"商家已接单"通知给客户
- 计算预计送达时间 `estimated_delivery_at`

**超时处理**:
- 商家 5 分钟未接单 → 自动取消订单，退款给客户
- 记录商家超时次数，影响店铺评分

---

### 2.3 paid → cancelled (商家拒单)

**触发条件**:
- 商家点击"拒单"按钮

**操作主体**: 商家

**前置条件**:
- 订单状态为 `paid`
- 必须填写拒单原因（如"今日食材用完"）

**后置动作**:
- 记录 `cancelled_at` 和 `cancel_reason`
- 自动退款给客户
- 恢复商品库存
- 推送取消通知给客户
- 记录商家拒单次数（频繁拒单会影响店铺排名）

---

### 2.4 accepted → preparing (确认出餐)

**触发条件**:
- 商家点击"确认出餐"按钮

**操作主体**: 商家

**前置条件**:
- 订单状态为 `accepted`

**后置动作**:
- 记录 `prepared_at` 时间戳
- 状态自动变为 `preparing`

---

### 2.5 preparing → ready (出餐完成)

**触发条件**:
- 商家点击"出餐完成"按钮
- 或系统根据预估出餐时间自动触发

**操作主体**: 商家/系统

**前置条件**:
- 订单状态为 `preparing`

**后置动作**:
- 订单进入待取餐队列
- **触发骑手派单逻辑**（见下方派单算法）
- 推送"等待骑手取餐"通知给客户

---

### 2.6 ready → picked (骑手取餐)

**触发条件**:
- 骑手到达商家后点击"取餐"按钮

**操作主体**: 骑手

**前置条件**:
- 订单状态为 `ready`
- 骑手已抢单/被分配此订单
- 骑手工作状态为 `idle` 或 `delivering`

**后置动作**:
- 记录 `picked_at` 时间戳
- 骑手工作状态变为 `delivering`
- 推送"骑手已取餐，正在配送"通知给客户
- 显示骑手实时位置（WebSocket 推送）

---

### 2.7 picked → delivered (送达)

**触发条件**:
- 骑手到达客户地址后点击"送达"按钮

**操作主体**: 骑手

**前置条件**:
- 订单状态为 `picked`
- 骑手位置与客户地址距离 < 100米（GPS验证，可配置）

**后置动作**:
- 记录 `delivered_at` 时间戳
- 推送"订单已送达"通知给客户
- 骑手工作状态变为 `idle`
- 计算骑手配送费收入

**超时处理**:
- 超过预计送达时间 30 分钟 → 标记为"配送超时"
- 记录骑手超时次数，影响评分

---

### 2.8 delivered → finished (完成)

**触发条件**:
- 客户点击"确认收货"
- 或送达后 7 天自动确认（系统定时任务）

**操作主体**: 客户/系统

**前置条件**:
- 订单状态为 `delivered`

**后置动作**:
- 记录 `finished_at` 时间戳
- 资金结算：
  - 扣除平台佣金（10%）
  - 商家收入进入待结算账户
  - 骑手配送费立即到账
- 推送"请评价订单"通知给客户
- 更新商家/骑手月销量统计

---

### 2.9 任意状态 → refunding (申请退款)

**触发条件**:
- 客户点击"申请退款"按钮

**操作主体**: 客户

**前置条件**:
- 订单状态为 `paid`, `accepted`, `preparing`, `ready`, `picked`, `delivered`
- `finished` 或 `refunded` 状态不可退款

**退款规则**:
| 订单状态 | 退款比例 | 审核方式 |
|---------|---------|---------|
| paid (未接单) | 100% | 自动通过 |
| accepted/preparing | 100% | 商家审核 |
| ready/picked | 50% | 商家审核 |
| delivered | 0% (仅可售后投诉) | 平台客服介入 |

**后置动作**:
- 记录退款原因和图片证明
- 推送退款申请通知给商家/平台
- 创建退款工单

---

### 2.10 refunding → refunded (退款完成)

**触发条件**:
- 商家/平台审核通过
- 或系统自动审核（paid 状态）

**操作主体**: 商家/管理员/系统

**前置条件**:
- 订单状态为 `refunding`

**后置动作**:
- 调用支付接口退款
- 记录 `refund_amount` 和退款流水号
- 恢复商品库存（如果商品未制作）
- 推送"退款成功"通知给客户
- 骑手如已取餐，扣除配送费

---

## 3. 骑手派单算法

### 3.1 派单时机
订单状态变为 `ready` (出餐完成) 时触发派单。

### 3.2 派单模式

#### 模式 1: 系统自动派单（推荐）
```python
def auto_assign_rider(order):
    """
    智能派单算法
    """
    # 1. 筛选可用骑手
    available_riders = Rider.objects.filter(
        work_status__in=['idle', 'busy'],  # 空闲或忙碌但未满载
        current_latitude__isnull=False,
        current_longitude__isnull=False
    )
    
    # 2. 计算每个骑手的匹配分数
    scores = []
    for rider in available_riders:
        # 距离分（距离越近分数越高）
        distance = calculate_distance(
            rider.current_latitude, rider.current_longitude,
            order.merchant.latitude, order.merchant.longitude
        )
        distance_score = max(0, 100 - distance * 10)  # 每公里扣10分
        
        # 评分分（好评率越高分数越高）
        rating_score = rider.rating * 20
        
        # 忙碌度分（当前配送订单越少分数越高）
        busy_orders = Order.objects.filter(
            rider=rider,
            status__in=['picked', 'ready']
        ).count()
        busy_score = max(0, 100 - busy_orders * 30)
        
        # 综合分数
        total_score = distance_score * 0.5 + rating_score * 0.3 + busy_score * 0.2
        scores.append((rider, total_score))
    
    # 3. 选择分数最高的骑手
    if scores:
        best_rider = max(scores, key=lambda x: x[1])[0]
        order.rider = best_rider
        order.save()
        
        # 推送派单通知
        send_websocket_notification(best_rider, 'order_assigned', order)
        return best_rider
    
    return None
```

#### 模式 2: 骑手大厅抢单
```python
# 订单进入抢单大厅
order.status = 'ready'
order.rider = None  # 未分配骑手
order.save()

# 骑手查看可抢单列表
GET /api/v1/rider/orders/available/

# 骑手抢单（先到先得）
POST /api/v1/rider/orders/{id}/grab/
```

### 3.3 派单失败处理
- 5 分钟内无骑手接单 → 提高配送费（加价 2 元），重新派单
- 10 分钟内仍无骑手 → 通知客户"配送压力大"，询问是否愿意等待
- 15 分钟内仍无骑手 → 自动取消订单，全额退款

---

## 4. 异常流程处理

### 4.1 配送异常

#### 4.1.1 商家缺货
```
picked (配送中) 
  → 骑手上报"商家缺货" 
  → 联系客户确认（换菜品 / 退款）
  → 客户选择退款 
  → refunding
```

**处理流程**:
1. 骑手点击"上报异常" → 选择"商家缺货" → 拍照上传证明
2. 系统自动联系客户（电话/消息）
3. 客户确认退款 → 订单变为 `refunding`
4. 平台审核通过 → 退款，骑手仍获得配送费

#### 4.1.2 客户联系不上
```
picked (配送中)
  → 骑手上报"联系不上客户"
  → 系统尝试拨打客户电话
  → 仍无响应
  → 骑手等待 10 分钟
  → 订单标记为"异常完成"，食物留在门口/保安处
  → delivered
```

#### 4.1.3 地址错误
```
picked (配送中)
  → 骑手上报"地址有误"
  → 系统联系客户获取正确地址
  → 客户提供新地址
  → 计算额外距离，客户支付额外配送费
  → 继续配送
```

### 4.2 支付异常

#### 4.2.1 支付超时
```
pending (待支付)
  → 30分钟未支付
  → 自动取消
  → cancelled
```

#### 4.2.2 支付失败后库存不足
```
pending (待支付)
  → 客户支付成功
  → 扣减库存失败（其他客户已购买）
  → 自动退款
  → cancelled (取消原因: 库存不足)
```

---

## 5. 权限控制矩阵

| 操作 | Customer | Merchant | Rider | Admin |
|------|----------|----------|-------|-------|
| 创建订单 | ✅ | ❌ | ❌ | ✅ |
| 支付订单 | ✅ | ❌ | ❌ | ✅ |
| 取消订单(pending) | ✅ | ❌ | ❌ | ✅ |
| 接单(paid) | ❌ | ✅ | ❌ | ✅ |
| 拒单(paid) | ❌ | ✅ | ❌ | ✅ |
| 确认出餐(accepted) | ❌ | ✅ | ❌ | ✅ |
| 抢单(ready) | ❌ | ❌ | ✅ | ✅ |
| 取餐(ready) | ❌ | ❌ | ✅ | ✅ |
| 送达(picked) | ❌ | ❌ | ✅ | ✅ |
| 确认收货(delivered) | ✅ | ❌ | ❌ | ✅ |
| 申请退款 | ✅ | ❌ | ❌ | ✅ |
| 审核退款 | ❌ | ✅ (部分) | ❌ | ✅ |
| 上报异常 | ❌ | ❌ | ✅ | ✅ |

---

## 6. 时间约束

| 阶段 | 超时阈值 | 超时后果 |
|------|---------|---------|
| 待支付 | 30 分钟 | 自动取消 |
| 待接单 | 5 分钟 | 自动取消，退款 |
| 准备中 | 20 分钟 (可配置) | 推送催单提醒给商家 |
| 待取餐 | 5 分钟 | 提高配送费重新派单 |
| 配送中 | 30 分钟 (基于预估时间) | 标记超时，影响骑手评分 |
| 已送达 | 7 天 | 自动确认收货 |

---

## 7. 数据统计

### 7.1 订单维度
- 订单总数、完成率、取消率、退款率
- 平均客单价、平均配送时间
- 不同时段订单分布

### 7.2 商家维度
- 接单率（接单数 / 总订单数）
- 超时率（超时订单数 / 总订单数）
- 拒单率（拒单数 / 总订单数）

### 7.3 骑手维度
- 准时率（准时送达数 / 总配送数）
- 日均配送单量
- 异常率（异常订单数 / 总配送数）

---

## 8. 状态变更日志

每次状态变更记录到独立日志表：

```python
class OrderStatusLog(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    operator_id = models.BigIntegerField()  # 操作人ID
    operator_role = models.CharField(max_length=20)  # customer/merchant/rider/system
    note = models.TextField(null=True)  # 备注（如拒单原因）
    created_at = models.DateTimeField(auto_now_add=True)
```

**用途**:
- 审计追踪（谁在什么时间改变了订单状态）
- 纠纷处理（回溯订单流转历史）
- 性能分析（各环节耗时统计）

---

## 9. WebSocket 实时通知事件

| 事件类型 | 触发时机 | 接收方 |
|---------|---------|--------|
| `new_order` | paid → 系统推送 | 商家 |
| `order_accepted` | paid → accepted | 客户 |
| `order_cancelled` | → cancelled | 客户 + 商家 |
| `order_preparing` | accepted → preparing | 客户 |
| `order_ready` | preparing → ready | 骑手（派单通知） |
| `order_assigned` | 系统派单 | 骑手 |
| `order_picked` | ready → picked | 客户 + 商家 |
| `rider_location_update` | 骑手位置变化 | 客户（每 10 秒推送） |
| `order_delivered` | picked → delivered | 客户 + 商家 |
| `order_finished` | delivered → finished | 商家 + 骑手 |
| `refund_requested` | → refunding | 商家 + 管理员 |
| `refund_approved` | refunding → refunded | 客户 |

---

## 10. 前端状态展示

### 10.1 客户端订单状态映射

| 后端状态 | 前端显示 | 操作按钮 |
|---------|---------|---------|
| pending | 待支付 | [立即支付] [取消订单] |
| paid | 等待商家接单 | [取消订单] |
| accepted | 商家已接单 | [联系商家] |
| preparing | 正在备餐 | [催单] |
| ready | 等待骑手取餐 | [联系商家] |
| picked | 配送中 | [查看位置] [联系骑手] |
| delivered | 已送达 | [确认收货] [申请退款] |
| finished | 已完成 | [再来一单] [评价] |
| cancelled | 已取消 | — |
| refunded | 已退款 | — |

### 10.2 商家端订单状态映射

| 后端状态 | 前端显示 | 操作按钮 |
|---------|---------|---------|
| paid | 待接单 | [接单] [拒单] |
| accepted | 已接单 | [确认出餐] |
| preparing | 备餐中 | [出餐完成] |
| ready | 等待骑手 | — |
| picked | 配送中 | — |
| delivered | 已送达 | — |
| finished | 已完成 | — |

### 10.3 骑手端订单状态映射

| 后端状态 | 前端显示 | 操作按钮 |
|---------|---------|---------|
| ready | 待取餐 | [抢单] |
| picked (已分配) | 配送中 | [到店] [取餐] [送达] [上报异常] |
| delivered | 已送达 | — |
| finished | 已完成 | — |

---

## 11. 状态机实现示例

```python
from django.db import transaction
from django.core.exceptions import ValidationError

class OrderStateMachine:
    """订单状态机"""
    
    TRANSITIONS = {
        'pending': ['paid', 'cancelled'],
        'paid': ['accepted', 'cancelled'],
        'accepted': ['preparing', 'cancelled'],
        'preparing': ['ready'],
        'ready': ['picked'],
        'picked': ['delivered'],
        'delivered': ['finished', 'refunding'],
        'finished': [],
        'cancelled': [],
        'refunding': ['refunded'],
        'refunded': [],
    }
    
    @classmethod
    def can_transition(cls, from_status, to_status):
        """检查状态是否可以流转"""
        return to_status in cls.TRANSITIONS.get(from_status, [])
    
    @classmethod
    @transaction.atomic
    def transition(cls, order, to_status, operator, note=None):
        """执行状态流转"""
        if not cls.can_transition(order.status, to_status):
            raise ValidationError(
                f'订单状态不能从 {order.status} 变更为 {to_status}'
            )
        
        from_status = order.status
        order.status = to_status
        
        # 更新相应的时间戳
        if to_status == 'paid':
            order.paid_at = timezone.now()
        elif to_status == 'accepted':
            order.accepted_at = timezone.now()
        # ... 其他状态的时间戳更新
        
        order.save()
        
        # 记录状态变更日志
        OrderStatusLog.objects.create(
            order=order,
            from_status=from_status,
            to_status=to_status,
            operator_id=operator.id,
            operator_role=get_user_role(operator),
            note=note
        )
        
        # 触发后置动作
        cls._post_transition_actions(order, from_status, to_status)
    
    @classmethod
    def _post_transition_actions(cls, order, from_status, to_status):
        """状态流转后的后置动作"""
        if to_status == 'paid':
            # 扣减库存
            deduct_inventory(order)
            # 推送通知给商家
            notify_merchant_new_order(order)
        
        elif to_status == 'accepted':
            # 推送通知给客户
            notify_customer_order_accepted(order)
        
        elif to_status == 'ready':
            # 触发派单
            auto_assign_rider(order)
        
        # ... 其他状态的后置动作
```

---

## 12. 相关文档

- [数据库设计](./01-database-design.md) - Order 表结构
- [API 接口设计](./02-api-design.md) - 订单相关接口
- [RBAC 权限设计](./03-rbac-design.md) - 订单操作权限
