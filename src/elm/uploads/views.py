from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Upload
from .serializers import UploadSerializer

ALLOWED_CONTENT_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_create(request):
    """上传图片"""
    file = request.FILES.get('file')
    if not file:
        return Response({'code': 9001, 'message': '未提供文件', 'data': None}, status=400)

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        return Response({'code': 9002, 'message': '不支持的文件类型', 'data': None}, status=400)

    if file.size > MAX_UPLOAD_SIZE:
        return Response({'code': 9003, 'message': '文件过大', 'data': None}, status=400)

    upload = Upload.objects.create(user=request.user, file=file, content_type=file.content_type)
    serializer = UploadSerializer(upload, context={'request': request})
    return Response({'code': 0, 'message': '上传成功', 'data': serializer.data}, status=201)
