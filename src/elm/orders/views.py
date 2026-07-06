from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
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
    from merchants.models import Merchant
    
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
    
    # 计算金额
    total_amount = sum(float(item.get('price', 0)) * int(item.get('quantity', 1)) for item in items)
    delivery_fee = float(merchant.delivery_fee)
    paid_amount = total_amount + delivery_fee
    
    # 生成订单号
    order_no = f"OD{timezone.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"
    
    # 创建订单
    order = Order.objects.create(
        order_no=order_no,
        customer=request.user,
        merchant=merchant,
        address_snapshot=address_snapshot,
        items_snapshot=items,
        total_amount=total_amount,
        delivery_fee=delivery_fee,
        paid_amount=paid_amount,
        status='pending',
        note=note
    )
    
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
        order.status = 'cancelled'
        order.save()
        return Response({'code': 0, 'message': '取消成功', 'data': None})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)


# Merchant 端接口
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def merchant_orders(request):
    """商家订单列表"""
    try:
        merchant = request.user.merchant
        orders = Order.objects.filter(merchant=merchant).order_by('-created_at')
        
        status = request.query_params.get('status')
        if status:
            orders = orders.filter(status=status)
        
        serializer = OrderSerializer(orders, many=True)
        return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': orders.count()}})
    except:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merchant_accept_order(request, pk):
    """商家接单"""
    try:
        merchant = request.user.merchant
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
        order = Order.objects.get(pk=pk, merchant=merchant, status='paid')
        order.status = 'cancelled'
        order.save()
        return Response({'code': 0, 'message': '已拒单', 'data': None})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)


# Rider 端接口
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rider_available_orders(request):
    """骑手可接单列表"""
    orders = Order.objects.filter(status='ready', rider__isnull=True).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': orders.count()}})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rider_grab_order(request, pk):
    """骑手抢单"""
    try:
        rider = request.user.rider
        order = Order.objects.get(pk=pk, status='ready', rider__isnull=True)
        order.rider = rider
        order.save()
        return Response({'code': 0, 'message': '抢单成功', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在或已被抢', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rider_pickup_order(request, pk):
    """骑手取餐"""
    try:
        rider = request.user.rider
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
    try:
        rider = request.user.rider
        order = Order.objects.get(pk=pk, rider=rider, status='picked')
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()
        return Response({'code': 0, 'message': '已送达', 'data': OrderSerializer(order).data})
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)
