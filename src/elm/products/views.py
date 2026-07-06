from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request, merchant_id):
    """商家商品列表"""
    products = Product.objects.filter(merchant_id=merchant_id, status='on')
    
    # 分类过滤
    category = request.query_params.get('category')
    if category:
        products = products.filter(category__name=category)
    
    serializer = ProductSerializer(products, many=True)
    return Response({
        'code': 0,
        'message': 'success',
        'data': {
            'items': serializer.data,
            'total': products.count()
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    """商品详情"""
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response({
            'code': 0,
            'message': 'success',
            'data': serializer.data
        })
    except Product.DoesNotExist:
        return Response({'code': 3002, 'message': '商品不存在', 'data': None}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    """分类列表"""
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True)
    return Response({
        'code': 0,
        'message': 'success',
        'data': serializer.data
    })
