from rest_framework import serializers
from .models import Coupon, UserCoupon


class CouponSerializer(serializers.ModelSerializer):
    merchant_name = serializers.CharField(source='merchant.store_name', read_only=True)
    
    class Meta:
        model = Coupon
        fields = ['id', 'name', 'discount_amount', 'min_spend', 'valid_until', 'merchant_name', 'is_active']


class UserCouponSerializer(serializers.ModelSerializer):
    coupon = CouponSerializer(read_only=True)
    
    class Meta:
        model = UserCoupon
        fields = ['id', 'coupon', 'status', 'used_at', 'created_at']
