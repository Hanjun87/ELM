from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from merchants.models import Merchant
from .models import Product, Category

User = get_user_model()


class ProductAPITestCase(TestCase):
    """商品 API 测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        
        # 创建商家
        user = User.objects.create_user(phone='13800000002', password='merchant')
        self.merchant = Merchant.objects.create(
            user=user,
            store_name='测试餐厅',
            phone='021-12345678',
            address='测试地址',
            status='open'
        )
        
        # 创建分类
        self.category = Category.objects.create(name='主食', icon='soup')
        
        # 创建商品
        self.product = Product.objects.create(
            merchant=self.merchant,
            category=self.category,
            name='测试商品',
            description='好吃的商品',
            image='https://example.com/image.jpg',
            price=28.0,
            stock=100,
            status='on',
            sales_count=1200,
            rating=4.9
        )
        
    def test_get_product_list(self):
        """测试获取商品列表"""
        response = self.client.get(f'/api/v1/merchants/{self.merchant.id}/products/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 0)
        self.assertGreater(response.data['data']['total'], 0)
        
    def test_get_product_list_by_category(self):
        """测试按分类筛选商品"""
        response = self.client.get(
            f'/api/v1/merchants/{self.merchant.id}/products/',
            {'category': '主食'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        items = response.data['data']['items']
        self.assertTrue(all(item['category']['name'] == '主食' for item in items))
        
    def test_get_product_detail(self):
        """测试获取商品详情"""
        response = self.client.get(f'/api/v1/products/{self.product.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['name'], '测试商品')
        self.assertEqual(response.data['data']['price'], '28.00')
        
    def test_get_category_list(self):
        """测试获取分类列表"""
        response = self.client.get('/api/v1/categories/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['data']), 0)


class ProductModelTestCase(TestCase):
    """商品模型测试"""
    
    def test_create_product(self):
        """测试创建商品"""
        user = User.objects.create_user(phone='13800000002')
        merchant = Merchant.objects.create(
            user=user,
            store_name='测试餐厅',
            phone='021-12345678',
            address='测试地址'
        )
        
        product = Product.objects.create(
            merchant=merchant,
            name='测试商品',
            price=28.0,
            stock=100,
            status='on'
        )
        
        self.assertEqual(product.name, '测试商品')
        self.assertEqual(float(product.price), 28.0)
        self.assertEqual(str(product), '测试商品')
