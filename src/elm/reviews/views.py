from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from orders.models import Order
from .models import Review
from .serializers import ReviewSerializer

REVIEWABLE_STATUSES = {'delivered', 'finished'}


@api_view(['GET'])
@permission_classes([AllowAny])
def merchant_review_list(request, merchant_id):
    """商家评价列表"""
    reviews = Review.objects.filter(merchant_id=merchant_id).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response({'code': 0, 'message': 'success', 'data': {'items': serializer.data, 'total': reviews.count()}})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_create(request):
    """创建评价"""
    order_id = request.data.get('order')
    try:
        rating = int(request.data.get('rating', 0))
    except (TypeError, ValueError):
        rating = 0
    content = request.data.get('content', '')
    images = request.data.get('images')

    if not order_id or rating not in (1, 2, 3, 4, 5):
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    try:
        order = Order.objects.get(pk=order_id, customer=request.user)
    except Order.DoesNotExist:
        return Response({'code': 4002, 'message': '订单不存在', 'data': None}, status=404)

    if order.status not in REVIEWABLE_STATUSES:
        return Response({'code': 4003, 'message': '订单尚未完成，无法评价', 'data': None}, status=400)

    if Review.objects.filter(order=order).exists():
        return Response({'code': 6001, 'message': '该订单已评价', 'data': None}, status=400)

    review = Review.objects.create(
        order=order,
        customer=request.user,
        merchant=order.merchant,
        rating=rating,
        content=content,
        images=images,
    )
    serializer = ReviewSerializer(review)
    return Response({'code': 0, 'message': '评价成功', 'data': serializer.data}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_reply(request, pk):
    """商家回复评价"""
    reply = request.data.get('reply')
    if not reply:
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    from merchants.models import Merchant
    try:
        merchant = request.user.merchant
    except Merchant.DoesNotExist:
        return Response({'code': 3001, 'message': '商家不存在', 'data': None}, status=404)

    try:
        review = Review.objects.get(pk=pk, merchant=merchant)
    except Review.DoesNotExist:
        return Response({'code': 6002, 'message': '评价不存在', 'data': None}, status=404)

    from django.utils import timezone
    review.reply = reply
    review.replied_at = timezone.now()
    review.save(update_fields=['reply', 'replied_at'])
    return Response({'code': 0, 'message': '回复成功', 'data': ReviewSerializer(review).data})
