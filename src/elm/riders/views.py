from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Rider
from .serializers import RiderSerializer

WORK_STATUS_CHOICES = {choice[0] for choice in Rider._meta.get_field('work_status').choices}


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def rider_me(request):
    """骑手个人信息"""
    try:
        rider = request.user.rider
    except Rider.DoesNotExist:
        return Response({'code': 5001, 'message': '骑手信息不存在', 'data': None}, status=404)

    if request.method == 'GET':
        serializer = RiderSerializer(rider)
        return Response({'code': 0, 'message': 'success', 'data': serializer.data})

    serializer = RiderSerializer(rider, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)
    serializer.save()
    return Response({'code': 0, 'message': '更新成功', 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rider_set_status(request):
    """更新骑手工作状态"""
    try:
        rider = request.user.rider
    except Rider.DoesNotExist:
        return Response({'code': 5001, 'message': '骑手信息不存在', 'data': None}, status=404)

    work_status = request.data.get('work_status')
    if work_status not in WORK_STATUS_CHOICES:
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

    rider.work_status = work_status
    rider.save(update_fields=['work_status'])
    return Response({'code': 0, 'message': '更新成功', 'data': RiderSerializer(rider).data})
