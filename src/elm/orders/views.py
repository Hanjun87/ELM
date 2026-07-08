from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import models, transaction, IntegrityError
from django.utils import timezone
from merchants.models import Merchant
from products.models import Product
from .models import Order
from .serializers import OrderSerializer
import random


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    """订单列表"""
    orders = Order.objects.filter(customer=request.user).order_by('-created_at')
    
    # 状态过滤
    status = request.query_params.get('status')
    if status:
        orders = orders.filter(status=status)
    
    serializer = OrderSerializer(orders, many=True)
    return Response({
        'code': 0,
        'message': 'success',
        'data': {
            'items': serializer.data,
            'total': orders.count()
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    """订单详情"""
    try:
        order = Order.objects.get(pk=pk, customer=request.user)
        serializer = OrderSerializer(order)
        return Response({
            'code': 0,
            'message': 'success',
            'data': serializer.data
        })
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_create(request):
    """创建订单"""
    merchant_id = request.data.get('merchant_id')
    items = request.data.get('items', [])
    address_snapshot = request.data.get('address_snapshot', {})
    note = request.data.get('note', '')

    if not merchant_id or not items:
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    try:
        merchant = Merchant.objects.get(pk=merchant_id)
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    # 校验每个下单项，数量必须为正整数
    quantities = {}
    for item in items:
        product_id = item.get('product_id')
        quantity = item.get('quantity')
        if not product_id or not isinstance(quantity, int) or quantity <= 0:
            return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)
        quantities[product_id] = quantities.get(product_id, 0) + quantity

    try:
        with transaction.atomic():
            # 加锁避免并发下单导致超卖
            products = Product.objects.select_for_update().filter(
                pk__in=quantities.keys(), merchant=merchant
            )
            products_by_id = {p.id: p for p in products}

            if len(products_by_id) != len(quantities):
                return Response({'code': 3002, 'message': '商品不存在', 'data': None}, status=404)

            items_snapshot = []
            total_amount = 0
            for product_id, quantity in quantities.items():
                product = products_by_id[product_id]
                if product.status != 'on':
                    return Response({'code': 3003, 'message': f'{product.name} 已下架', 'data': None}, status=400)
                if product.stock < quantity:
                    return Response({'code': 3004, 'message': f'{product.name} 库存不足', 'data': None}, status=400)

                product.stock -= quantity
                product.sales_count += quantity
                product.save(update_fields=['stock', 'sales_count'])

                total_amount += float(product.price) * quantity
                items_snapshot.append({
                    'product_id': product.id,
                    'name': product.name,
                    'price': float(product.price),
                    'quantity': quantity,
                })

            delivery_fee = float(merchant.delivery_fee)
            paid_amount = total_amount + delivery_fee

            if total_amount < float(merchant.min_order):
                return Response({'code': 3005, 'message': f'未达起送金额 ¥{merchant.min_order}', 'data': None}, status=400)

            for attempt in range(3):
                order_no = f"OD{timezone.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"
                try:
                    order = Order.objects.create(
                        order_no=order_no,
                        customer=request.user,
                        merchant=merchant,
                        address_snapshot=address_snapshot,
                        items_snapshot=items_snapshot,
                        total_amount=total_amount,
                        delivery_fee=delivery_fee,
                        paid_amount=paid_amount,
                        status='pending',
                        note=note
                    )
                    break
                except IntegrityError:
                    if attempt == 2:
                        raise
            else:
                return Response({'code': 9999, 'message': '系统繁忙，请重试', 'data': None}, status=500)
    except (TypeError, ValueError, IntegrityError):
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    serializer = OrderSerializer(order)
    return Response({
        'code': 0,
        'message': '订单创建成功',
        'data': serializer.data
    }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_pay(request, pk):
    """支付订单"""
    try:
        order = Order.objects.get(pk=pk, customer=request.user, status='pending')
        order.status = 'paid'
        order.paid_at = timezone.now()
        order.save()
        return Response({'code': 0, 'message': '支付成功', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_cancel(request, pk):
    """取消订单"""
    try:
        order = Order.objects.get(pk=pk, customer=request.user)
        if order.status not in ['pending', 'paid']:
            return Response({'code': 4001, 'message': '订单状态不允许取消', 'data': None}, status=400)
        with transaction.atomic():
            order.status = 'cancelled'
            order.save()
            _restore_stock(order)
        return Response({'code': 0, 'message': '取消成功', 'data': None})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)


def _restore_stock(order):
    """取消/拒单时恢复商品库存并回滚销量"""
    for item in order.items_snapshot:
        qty = item.get('quantity', 0)
        if qty > 0:
            Product.objects.filter(pk=item.get('product_id')).update(
                stock=models.F('stock') + qty,
                sales_count=models.F('sales_count') - qty,
            )


# Merchant 端接口
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def merchant_orders(request):
    """商家订单列表"""
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    orders = Order.objects.filter(merchant=merchant).order_by('-created_at')

    status = request.query_params.get('status')
    if status:
        orders = orders.filter(status=status)

    serializer = OrderSerializer(orders, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': orders.count()}})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merchant_accept_order(request, pk):
    """商家接单"""
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)
    try:
        order = Order.objects.get(pk=pk, merchant=merchant, status='paid')
        order.status = 'accepted'
        order.accepted_at = timezone.now()
        order.save()
        return Response({'code': 0, 'message': '接单成功', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在或状态不正确', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merchant_reject_order(request, pk):
    """商家拒单"""
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)
    try:
        order = Order.objects.get(pk=pk, merchant=merchant, status='paid')
        with transaction.atomic():
            order.status = 'cancelled'
            order.save()
            _restore_stock(order)
        return Response({'code': 0, 'message': '已拒单', 'data': None})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merchant_prepare_order(request, pk):
    """商家确认出餐（accepted -> preparing）"""
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)
    try:
        order = Order.objects.get(pk=pk, merchant=merchant, status='accepted')
        order.status = 'preparing'
        order.save()
        return Response({'code': 0, 'message': '已确认出餐', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在或状态不正确', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merchant_ready_order(request, pk):
    """商家出餐完成（preparing -> ready）"""
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)
    try:
        order = Order.objects.get(pk=pk, merchant=merchant, status='preparing')
        order.status = 'ready'
        order.prepared_at = timezone.now()
        order.save()
        return Response({'code': 0, 'message': '出餐完成', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在或状态不正确', 'data': None}, status=404)


# Rider 端接口
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rider_available_orders(request):
    """骑手可接单列表"""
    if not request.user.has_role('rider'):
        return Response({'code': 5001, 'message': '骑手信息不存在', 'data': None}, status=404)
    orders = Order.objects.filter(status='ready', rider__isnull=True).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': orders.count()}})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rider_my_orders(request):
    """骑手我的配送单"""
    from riders.models import Rider
    try:
        rider = request.user.rider
    except Rider.DoesNotExist:
        return Response({'code': 5001, 'message': '骑手信息不存在', 'data': None}, status=404)

    orders = Order.objects.filter(rider=rider).order_by('-created_at')

    status_param = request.query_params.get('status')
    if status_param:
        orders = orders.filter(status=status_param)

    serializer = OrderSerializer(orders, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': orders.count()}})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rider_grab_order(request, pk):
    """骑手抢单"""
    from riders.models import Rider
    try:
        rider = request.user.rider
    except Rider.DoesNotExist:
        return Response({'code': 5001, 'message': '骑手信息不存在', 'data': None}, status=404)
    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=pk, status='ready', rider__isnull=True)
            order.rider = rider
            order.save(update_fields=['rider'])
        return Response({'code': 0, 'message': '抢单成功', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在或已被抢', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rider_pickup_order(request, pk):
    """骑手取餐"""
    from riders.models import Rider
    try:
        rider = request.user.rider
    except Rider.DoesNotExist:
        return Response({'code': 5001, 'message': '骑手信息不存在', 'data': None}, status=404)
    try:
        order = Order.objects.get(pk=pk, rider=rider, status='ready')
        order.status = 'picked'
        order.picked_at = timezone.now()
        order.save()
        return Response({'code': 0, 'message': '已取餐', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rider_deliver_order(request, pk):
    """骑手送达"""
    from riders.models import Rider
    try:
        rider = request.user.rider
    except Rider.DoesNotExist:
        return Response({'code': 5001, 'message': '骑手信息不存在', 'data': None}, status=404)
    try:
        order = Order.objects.get(pk=pk, rider=rider, status='picked')
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()
        return Response({'code': 0, 'message': '已送达', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)
