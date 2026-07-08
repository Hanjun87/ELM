from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from accounts.models import User
from accounts.serializers import UserSerializer
from merchants.models import Merchant
from merchants.serializers import MerchantSerializer
from orders.models import Order
from .permissions import IsAdmin

PAID_STATUSES = ['paid', 'accepted', 'preparing', 'ready', 'picked', 'delivered', 'finished']


@api_view(['GET'])
@permission_classes([IsAdmin])
def dashboard(request):
    """数据看板"""
    gmv = Order.objects.filter(status__in=PAID_STATUSES).aggregate(total=Sum('paid_amount'))['total'] or 0

    return Response({
        'code': 0,
        'message': 'success',
        'data': {
            'gmv': float(gmv),
            'order_count': Order.objects.count(),
            'merchant_count': Merchant.objects.count(),
            'user_count': User.objects.count(),
            'cancelled_count': Order.objects.filter(status='cancelled').count(),
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def user_list(request):
    """用户列表"""
    users = User.objects.all().order_by('-date_joined')

    role = request.query_params.get('role')
    if role:
        users = users.filter(user_roles__role__name=role)

    status_param = request.query_params.get('status')
    if status_param:
        users = users.filter(status=status_param)

    serializer = UserSerializer(users, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': users.count()}})


@api_view(['POST'])
@permission_classes([IsAdmin])
def user_ban(request, pk):
    """封禁用户"""
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'code': 1001, 'message': '用户不存在', 'data': None}, status=404)

    user.status = 'banned'
    user.save(update_fields=['status'])
    return Response({'code': 0, 'message': '封禁成功', 'data': UserSerializer(user).data})


@api_view(['POST'])
@permission_classes([IsAdmin])
def user_unban(request, pk):
    """解封用户"""
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'code': 1001, 'message': '用户不存在', 'data': None}, status=404)

    user.status = 'active'
    user.save(update_fields=['status'])
    return Response({'code': 0, 'message': '解封成功', 'data': UserSerializer(user).data})


@api_view(['GET'])
@permission_classes([IsAdmin])
def merchant_list(request):
    """商家列表（管理端）"""
    merchants = Merchant.objects.all().order_by('-id')

    status_param = request.query_params.get('status')
    if status_param:
        merchants = merchants.filter(status=status_param)

    serializer = MerchantSerializer(merchants, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': merchants.count()}})


@api_view(['POST'])
@permission_classes([IsAdmin])
def merchant_set_status(request, pk):
    """更新商家状态（如下架违规商家）"""
    new_status = request.data.get('status')
    if new_status not in ('open', 'closed'):
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    try:
        merchant = Merchant.objects.get(pk=pk)
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    merchant.status = new_status
    merchant.save(update_fields=['status'])
    return Response({'code': 0, 'message': '更新成功', 'data': MerchantSerializer(merchant).data})
