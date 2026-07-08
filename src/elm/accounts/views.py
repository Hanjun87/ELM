from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, LoginSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """登录"""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'code': 9001, 'message': '参数错误', 'data': None}, status=400)
    
    phone = serializer.validated_data['phone']
    password = serializer.validated_data['password']
    
    # Django 认证
    try:
        user = User.objects.get(phone=phone)
        if not user.check_password(password):
            return Response({'code': 1001, 'message': '密码错误', 'data': None}, status=401)
        if user.status == 'banned':
            return Response({'code': 1002, 'message': '账号已被封禁', 'data': None}, status=403)
    except User.DoesNotExist:
        return Response({'code': 1001, 'message': '用户不存在', 'data': None}, status=404)
    
    # 生成 JWT Token
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'code': 0,
        'message': 'success',
        'data': {
            'user_id': user.id,
            'phone': user.phone,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'expires_in': 7200,
            'roles': [ur.role.name for ur in user.user_roles.all()]
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """获取当前用户信息"""
    serializer = UserSerializer(request.user)
    return Response({
        'code': 0,
        'message': 'success',
        'data': serializer.data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """注册"""
    phone = request.data.get('phone')
    password = request.data.get('password')
    role_name = request.data.get('role', 'customer')
    
    if not phone or not password:
        return Response({'code': 9001, 'message': '手机号和密码不能为空', 'data': None}, status=400)
    
    if User.objects.filter(phone=phone).exists():
        return Response({'code': 2001, 'message': '手机号已注册', 'data': None}, status=400)

    from .models import Role, UserRole
    try:
        role = Role.objects.get(name=role_name)
    except Role.DoesNotExist:
        return Response({'code': 9001, 'message': '角色不存在', 'data': None}, status=400)

    # 创建用户
    user = User.objects.create(phone=phone)
    user.set_password(password)
    user.save()

    # 分配角色
    UserRole.objects.create(user=user, role=role)
    
    # 生成 Token
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'code': 0,
        'message': '注册成功',
        'data': {
            'user_id': user.id,
            'phone': user.phone,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }
    }, status=201)
