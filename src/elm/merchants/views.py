from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Merchant
from .serializers import MerchantSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def merchant_list(request):
    """商家列表"""
    merchants = Merchant.objects.filter(status='open')
    serializer = MerchantSerializer(merchants, many=True)
    return Response({
        'code': 0,
        'message': 'success',
        'data': {
            'items': serializer.data,
            'total': merchants.count()
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def merchant_detail(request, pk):
    """商家详情"""
    try:
        merchant = Merchant.objects.get(pk=pk)
        serializer = MerchantSerializer(merchant)
        return Response({
            'code': 0,
            'message': 'success',
            'data': serializer.data
        })
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def my_store(request):
    """获取/更新我的店铺信息"""
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    if request.method == 'GET':
        return Response({'code': 0, 'message': 'success', 'data': MerchantSerializer(merchant).data})

    serializer = MerchantSerializer(merchant, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)
    serializer.save()
    return Response({'code': 0, 'message': '更新成功', 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_store(request):
    """开关店"""
    new_status = request.data.get('status')
    if new_status not in ('open', 'closed'):
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    merchant.status = new_status
    merchant.save(update_fields=['status'])
    return Response({'code': 0, 'message': '更新成功', 'data': MerchantSerializer(merchant).data})
