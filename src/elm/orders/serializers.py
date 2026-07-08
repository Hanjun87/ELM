from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    merchant_name = serializers.CharField(source='merchant.store_name', read_only=True)
    merchant_logo = serializers.URLField(source='merchant.logo', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_no', 'merchant_name', 'merchant_logo', 'address_snapshot',
                  'items_snapshot', 'total_amount', 'delivery_fee', 'paid_amount',
                  'status', 'note', 'created_at', 'paid_at', 'accepted_at',
                  'prepared_at', 'picked_at', 'delivered_at']
