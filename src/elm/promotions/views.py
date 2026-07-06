from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import Coupon, UserCoupon
from .serializers import CouponSerializer, UserCouponSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def coupon_list(request):
    """优惠券列表"""
    coupons = Coupon.objects.filter(is_active=True, valid_until__gt=timezone.now())
    merchant_id = request.query_params.get('merchant_id')
    if merchant_id:
        coupons = coupons.filter(merchant_id=merchant_id)
    
    serializer = CouponSerializer(coupons, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': coupons.count()}})


@api_view(['GET'])
@permission_classes([AllowAny])
def coupon_detail(request, pk):
    """优惠券详情"""
    try:
        coupon = Coupon.objects.get(pk=pk)
        serializer = CouponSerializer(coupon)
        return Response({'code': 0, 'message': 'success', 'data': serializer.data})
    except Coupon.DoesNotExist:
        return Response({'code': 5001, 'message': '优惠券不存在', 'data': None}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_coupon(request, pk):
    """领取优惠券"""
    try:
        coupon = Coupon.objects.get(pk=pk, is_active=True)
        
        # 检查是否已领取
        if UserCoupon.objects.filter(user=request.user, coupon=coupon).exists():
            return Response({'code': 5002, 'message': '已经领取过该优惠券', 'data': None}, status=400)
        
        # 检查是否过期
        if coupon.valid_until < timezone.now():
            return Response({'code': 5003, 'message': '优惠券已过期', 'data': None}, status=400)
        
        # 领取
        user_coupon = UserCoupon.objects.create(user=request.user, coupon=coupon, status='unused')
        serializer = UserCouponSerializer(user_coupon)
        return Response({'code': 0, 'message': '领取成功', 'data': serializer.data})
    except Coupon.DoesNotExist:
        return Response({'code': 5001, 'message': '优惠券不存在', 'data': None}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_coupons(request):
    """用户的优惠券"""
    status = request.query_params.get('status')
    coupons = UserCoupon.objects.filter(user=request.user)
    
    if status:
        coupons = coupons.filter(status=status)
    
    serializer = UserCouponSerializer(coupons, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': coupons.count()}})
