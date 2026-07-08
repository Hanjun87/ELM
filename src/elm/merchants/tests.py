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

    def test_get_my_store(self):
        """测试获取我的店铺信息"""
        self.client.force_authenticate(user=self.merchant.user)
        response = self.client.get('/api/v1/merchant/store/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['store_name'], '测试餐厅')

    def test_update_my_store(self):
        """测试更新我的店铺信息"""
        self.client.force_authenticate(user=self.merchant.user)
        response = self.client.patch('/api/v1/merchant/store/', {'store_name': '新店名'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.merchant.refresh_from_db()
        self.assertEqual(self.merchant.store_name, '新店名')

    def test_toggle_store(self):
        """测试开关店"""
        self.client.force_authenticate(user=self.merchant.user)
        response = self.client.post('/api/v1/merchant/store/toggle/', {'status': 'closed'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.merchant.refresh_from_db()
        self.assertEqual(self.merchant.status, 'closed')

    def test_my_store_requires_auth(self):
        """测试未登录无法访问我的店铺"""
        response = self.client.get('/api/v1/merchant/store/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


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
