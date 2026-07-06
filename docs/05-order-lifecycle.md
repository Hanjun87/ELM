# 05 - 订单生命周期状态机

## 1. 状态定义

订单状态使用字符串枚举，存储在 `Order.status` 字段中。

```python
class OrderStatus(models.TextChoices):
    PENDING_PAYMENT = 'pending_payment', '待支付'
    PENDING_ACCEPT  = 'pending_accept', '待接单'
    PREPARING       = 'preparing', '备餐中'
    PENDING_PICKUP  = 'pending_pickup', '待取餐'
    DELIVERING      = 'delivering', '配送中'
    COMPLETED       = 'completed', '已完成'
    CANCELLED       = 'cancelled', '已取消'
```

## 2. 状态流转图

```
                           ┌──────────────┐
                           │  用户提交订单  │
                           └──────┬───────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │    pending_payment      │
                     │        待支付            │
                     └─────┬──────────┬───────┘
                           │          │
              支付成功      │          │  15分钟超时 / 用户取消
                           │          │
                           ▼          ▼
               ┌─────────────────┐  ┌──────────────┐
               │  pending_accept │  │   cancelled   │
               │     待接单       │  │    已取消      │
               └───┬─────┬───────┘  └──────────────┘
                   │     │
          商家接单   │     │  商家拒单 / 30分钟超时
                   │     │
                   ▼     ▼
         ┌────────────┐ ┌──────────────┐
         │  preparing  │ │   cancelled   │
         │   备餐中     │ │    已取消      │
         └─────┬───────┘ └──────────────┘
               │
    商家通知取餐  │
               │
               ▼
      ┌──────────────────┐
      │  pending_pickup   │
      │     待取餐         │
      └────────┬──────────┘
               │
   骑手取餐确认 │
               │
               ▼
      ┌──────────────────┐
      │    delivering     │────────── 异常上报 ──→ 管理员介入
      │     配送中        │
      └────────┬──────────┘
               │
   骑手送达确认 │
               │
               ▼
      ┌──────────────────┐
      │    completed      │
      │     已完成         │
      └──────────────────┘
```

## 3. 状态转换表

| 当前状态 | 可转换目标 | 触发者 | 触发条件 |
|---------|-----------|--------|---------|
| `pending_payment` | `pending_accept` | 系统 | 支付成功回调 |
| `pending_payment` | `cancelled` | 客户/系统 | 用户主动取消 或 15分钟未支付 |
| `pending_accept` | `preparing` | 商家 | 商家点击接单 |
| `pending_accept` | `cancelled` | 商家/系统 | 商家拒单 或 30分钟超时未接单 |
| `preparing` | `pending_pickup` | 商家 | 商家点击备餐完成 |
| `pending_pickup` | `delivering` | 骑手 | 骑手取餐确认 |
| `delivering` | `completed` | 骑手 | 骑手送达确认 |
| `delivering` | `completed` | 系统 | 骑手已送达7天未确认，系统自动确认 |
| 任意非终态 | `cancelled` | 管理员 | 管理员介入处理异常订单 |

## 4. 事件驱动架构

### 4.1 架构模式

订单状态变更采用 **Django Signals + Celery 异步任务** 实现事件驱动：

```
状态变更发生 (Order.status save)
  │
  ├──→ post_save signal 触发
  │     ├──→ WebSocket 推送 → 通知相关方
  │     └──→ 记录状态变更日志 (OrderStatusLog)
  │
  └──→ post_save signal 触发
        └──→ Celery 任务
              ├──→ SMS 通知 (配送员取餐提醒等)
              ├──→ 启动超时监控 (待支付15分钟、待接单30分钟)
              └──→ 取消之前未到期的超时任务
```

### 4.2 超时处理机制

使用 Celery 的 `apply_async` + `countdown` 实现延迟任务：

```python
# tasks/order_tasks.py

@celery_app.task
@transaction.atomic
def auto_cancel_unpaid_order(order_id: int):
    """15分钟未支付自动取消"""
    order = Order.objects.select_for_update().get(id=order_id)
    if order.status == OrderStatus.PENDING_PAYMENT:
        order.status = OrderStatus.CANCELLED
        order.cancel_reason = '支付超时自动取消'
        order.cancelled_at = timezone.now()
        order.save()
        # 释放预占库存
        release_reserved_stock.delay(order_id)


@celery_app.task
@transaction.atomic
def auto_cancel_unaccepted_order(order_id: int):
    """30分钟未被接单自动取消"""
    order = Order.objects.select_for_update().get(id=order_id)
    if order.status == OrderStatus.PENDING_ACCEPT:
        order.status = OrderStatus.CANCELLED
        order.cancel_reason = '商家超时未接单'
        order.cancelled_at = timezone.now()
        order.save()
        # 自动退款
        auto_refund.delay(order_id)
```

### 4.3 关键业务规则

#### 下单时的库存预占

```
下单 → 预占库存 (stock -= quantity, reserved_stock += quantity)
  ├── 支付成功 → reserved_stock -= quantity (正式扣减)
  └── 超时/取消 → 释放预占 (stock += quantity, reserved_stock -= quantity)
```

这避免了高并发下的超卖问题。`stock` 是可用库存，`reserved_stock` 是已被预占但未支付的库存。

#### 取消退款规则

| 取消阶段 | 退款规则 | 责任方 |
|---------|---------|--------|
| `pending_payment` | 无需退款 | — |
| `pending_accept` | 全额退款 | 客户/商家/系统 |
| `preparing` | 全额退款 (可配置) | 客户/商家 |
| `pending_pickup` | 全额退款 (可配置) | 客户/商家 |
| `delivering` | 仅平台介入可退 | 管理员裁定 |
| `completed` | 不可取消，走售后退款流程 | — |

#### 配送员分配规则

```
1. 系统派单模式: 商家接单后 → 系统根据距离/评分/空闲状态自动分配骑手
2. 抢单模式: 商家备餐完成 → 订单进入抢单池 → 空闲骑手手动抢单
```

可通过平台配置切换派单模式。

## 5. 订单编号生成规则

```
格式: YYYYMMDDHHMMSS + 6位随机字符
示例: 20240705153000A1B2C3

生成逻辑:
- 前14位: 下单时间精确到秒
- 后6位: secrets.token_hex(3).upper()
- 唯一性保证: 数据库 UNIQUE 约束 + 冲突重试 (最多3次)
```

## 6. 订单状态变更日志

```python
class OrderStatusLog(models.Model):
    order = models.ForeignKey(Order, on_delete=CASCADE, related_name='status_logs')
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    operator = models.ForeignKey(User, on_delete=SET_NULL, null=True)
    operator_role = models.CharField(max_length=20)  # 操作者角色
    remark = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['order', 'created_at']),
        ]
```

每条状态变更都记录完整日志，用于：
- 订单轨迹追溯
- 异常排查
- 客服查证
- 配送时效分析
