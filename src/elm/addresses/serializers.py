from rest_framework import serializers
from .models import Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'tag', 'contact_name', 'contact_phone', 'address', 'is_default', 'created_at']
        read_only_fields = ['created_at']
