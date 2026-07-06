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
