from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Role, UserRole

User = get_user_model()


class AuthenticationTestCase(TestCase):
    """认证系统测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.customer_role = Role.objects.create(
            name='customer',
            display_name='客户',
            permissions=['view_products', 'create_order']
        )
        
    def test_register_success(self):
        """测试注册成功"""
        data = {
            'phone': '13800000099',
            'password': 'test123',
            'role': 'customer'
        }
        response = self.client.post('/api/v1/auth/register/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 0)
        self.assertIn('access_token', response.data['data'])
        
        # 验证用户已创建
        user = User.objects.get(phone='13800000099')
        self.assertTrue(user.check_password('test123'))
        
    def test_register_duplicate_phone(self):
        """测试重复手机号注册"""
        User.objects.create_user(phone='13800000099', password='test123')
        
        data = {
            'phone': '13800000099',
            'password': 'test456'
        }
        response = self.client.post('/api/v1/auth/register/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['code'], 2001)
        
    def test_login_success(self):
        """测试登录成功"""
        user = User.objects.create_user(phone='13800000099', password='test123')
        UserRole.objects.create(user=user, role=self.customer_role)
        
        data = {
            'phone': '13800000099',
            'password': 'test123'
        }
        response = self.client.post('/api/v1/auth/login/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 0)
        self.assertIn('access_token', response.data['data'])
        self.assertIn('customer', response.data['data']['roles'])
        
    def test_login_wrong_password(self):
        """测试密码错误"""
        User.objects.create_user(phone='13800000099', password='test123')
        
        data = {
            'phone': '13800000099',
            'password': 'wrong'
        }
        response = self.client.post('/api/v1/auth/login/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['code'], 1001)
        
    def test_login_user_not_exists(self):
        """测试用户不存在"""
        data = {
            'phone': '13800000099',
            'password': 'test123'
        }
        response = self.client.post('/api/v1/auth/login/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['code'], 1001)


class UserModelTestCase(TestCase):
    """用户模型测试"""
    
    def test_create_user(self):
        """测试创建用户"""
        user = User.objects.create_user(phone='13800000099', password='test123')
        
        self.assertEqual(user.phone, '13800000099')
        self.assertTrue(user.check_password('test123'))
        self.assertEqual(user.status, 'active')
        
    def test_user_roles(self):
        """测试用户角色"""
        user = User.objects.create_user(phone='13800000099')
        role = Role.objects.create(name='customer', display_name='客户')
        UserRole.objects.create(user=user, role=role)
        
        self.assertTrue(user.has_role('customer'))
        self.assertFalse(user.has_role('admin'))
        self.assertEqual(user.get_roles(), ['customer'])
