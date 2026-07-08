from rest_framework import serializers
from .models import Merchant


class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ['id', 'store_name', 'logo', 'phone', 'address', 'min_order',
                  'delivery_fee', 'status', 'rating', 'monthly_sales']
        read_only_fields = ['rating', 'monthly_sales']
