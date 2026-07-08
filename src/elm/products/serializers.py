from decimal import Decimal
from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'image', 'price', 'original_price',
                  'stock', 'status', 'sales_count', 'rating', 'specs', 'category']


class MerchantProductSerializer(serializers.ModelSerializer):
    """商家端商品创建/更新，接受 category_id 而非嵌套 category"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Category.objects.all(), write_only=True, required=False, allow_null=True
    )
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    original_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'), required=False, allow_null=True)
    stock = serializers.IntegerField(min_value=0)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'image', 'price', 'original_price',
                  'stock', 'status', 'sales_count', 'rating', 'specs', 'category', 'category_id']
        read_only_fields = ['sales_count', 'rating']
