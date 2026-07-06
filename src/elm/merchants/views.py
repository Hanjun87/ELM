from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
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
