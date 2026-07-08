from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'order', 'customer_phone', 'merchant', 'rating', 'content',
                  'images', 'reply', 'replied_at', 'created_at']
        read_only_fields = ['merchant', 'reply', 'replied_at', 'created_at']
