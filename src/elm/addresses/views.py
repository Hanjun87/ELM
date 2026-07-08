from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .models import Address
from .serializers import AddressSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def address_list(request):
    """地址列表/创建"""
    if request.method == 'GET':
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response({
            'code': 0,
            'message': 'success',
            'data': {'items': serializer.data, 'total': addresses.count()}
        })
    
    elif request.method == 'POST':
        serializer = AddressSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

        with transaction.atomic():
            # 如果设置为默认，取消其他默认地址
            if serializer.validated_data.get('is_default'):
                Address.objects.filter(user=request.user, is_default=True).update(is_default=False)

            address = serializer.save(user=request.user)
        return Response({
            'code': 0,
            'message': '地址创建成功',
            'data': AddressSerializer(address).data
        }, status=201)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def address_detail(request, pk):
    """地址详情/更新/删除"""
    try:
        address = Address.objects.get(pk=pk, user=request.user)
    except Address.DoesNotExist:
        return Response({'code': 2003, 'message': '地址不存在', 'data': None}, status=404)
    
    if request.method == 'GET':
        serializer = AddressSerializer(address)
        return Response({'code': 0, 'message': 'success', 'data': serializer.data})
    
    elif request.method == 'PATCH':
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)

        with transaction.atomic():
            if serializer.validated_data.get('is_default'):
                Address.objects.filter(user=request.user, is_default=True).update(is_default=False)

            serializer.save()
        return Response({'code': 0, 'message': '更新成功', 'data': serializer.data})
    
    elif request.method == 'DELETE':
        address.delete()
        return Response({'code': 0, 'message': '删除成功', 'data': None})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_default(request, pk):
    """设置默认地址"""
    try:
        address = Address.objects.get(pk=pk, user=request.user)
    except Address.DoesNotExist:
        return Response({'code': 2003, 'message': '地址不存在', 'data': None}, status=404)

    with transaction.atomic():
        Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
        address.is_default = True
        address.save()

    return Response({'code': 0, 'message': '设置成功', 'data': None})
