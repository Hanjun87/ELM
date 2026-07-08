from rest_framework import serializers
from .models import Rider


class RiderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rider
        fields = ['id', 'real_name', 'phone', 'station', 'work_status',
                  'balance', 'total_orders', 'rating', 'created_at']
        read_only_fields = ['balance', 'total_orders', 'rating', 'created_at']
