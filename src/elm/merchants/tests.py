from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Merchant

User = get_user_model()


class MerchantAPITestCase(TestCase):
    """商家 API 测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        
        # 创建测试商家
        user = User.objects.create_user(phone='13800000002', password='merchant')
        self.merchant = Merchant.objects.create(
            user=user,
            store_name='测试餐厅',
            phone='021-12345678',
            address='测试地址',
            min_order=15.0,
            delivery_fee=5.0,
            rating=4.8,
            monthly_sales=1520,
            status='open'
        )
        
    def test_get_merchant_list(self):
        """测试获取商家列表"""
        response = self.client.get('/api/v1/merchants/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 0)
        self.assertGreater(response.data['data']['total'], 0)
        
    def test_get_merchant_detail(self):
        """测试获取商家详情"""
        response = self.client.get(f'/api/v1/merchants/{self.merchant.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 0)
        self.assertEqual(response.data['data']['store_name'], '测试餐厅')
        self.assertEqual(response.data['data']['rating'], '4.80')
        
    def test_get_nonexistent_merchant(self):
        """测试获取不存在的商家"""
        response = self.client.get('/api/v1/merchants/9999/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['code'], 3001)


class MerchantModelTestCase(TestCase):
    """商家模型测试"""
    
    def test_create_merchant(self):
        """测试创建商家"""
        user = User.objects.create_user(phone='13800000002')
        merchant = Merchant.objects.create(
            user=user,
            store_name='测试餐厅',
            phone='021-12345678',
            address='测试地址',
            status='open'
        )
        
        self.assertEqual(merchant.store_name, '测试餐厅')
        self.assertEqual(merchant.status, 'open')
        self.assertEqual(str(merchant), '测试餐厅')
