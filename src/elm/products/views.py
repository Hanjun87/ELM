from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer, MerchantProductSerializer


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


# 商家端接口
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def merchant_product_list(request):
    """商家商品列表/创建"""
    from merchants.models import Merchant
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    if request.method == 'GET':
        products = Product.objects.filter(merchant=merchant)
        status_param = request.query_params.get('status')
        if status_param:
            products = products.filter(status=status_param)
        serializer = MerchantProductSerializer(products, many=True)
        return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': products.count()}})

    serializer = MerchantProductSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)
    product = serializer.save(merchant=merchant)
    return Response({'code': 0, 'message': '创建成功', 'data': MerchantProductSerializer(product).data}, status=201)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def merchant_product_detail(request, pk):
    """商家更新/删除商品"""
    from merchants.models import Merchant
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    try:
        product = Product.objects.get(pk=pk, merchant=merchant)
    except Product.DoesNotExist:
        return Response({'code': 3002, 'message': '商品不存在', 'data': None}, status=404)

    if request.method == 'DELETE':
        product.delete()
        return Response({'code': 0, 'message': '删除成功', 'data': None})

    serializer = MerchantProductSerializer(product, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)
    serializer.save()
    return Response({'code': 0, 'message': '更新成功', 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def merchant_product_toggle(request, pk):
    """商家上下架商品"""
    from merchants.models import Merchant
    new_status = request.data.get('status')
    if new_status not in ('on', 'off'):
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    try:
        product = Product.objects.get(pk=pk, merchant=merchant)
    except Product.DoesNotExist:
        return Response({'code': 3002, 'message': '商品不存在', 'data': None}, status=404)

    product.status = new_status
    product.save(update_fields=['status'])
    return Response({'code': 0, 'message': '更新成功', 'data': MerchantProductSerializer(product).data})
