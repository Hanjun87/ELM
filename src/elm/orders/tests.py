from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from merchants.models import Merchant
from products.models import Product
from .models import Order

User = get_user_model()


class OrderAPITestCase(TestCase):
    """订单 API 测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        
        # 创建客户
        self.customer = User.objects.create_user(phone='13800000001', password='customer')
        
        # 创建商家
        merchant_user = User.objects.create_user(phone='13800000002', password='merchant')
        self.merchant = Merchant.objects.create(
            user=merchant_user,
            store_name='测试餐厅',
            phone='021-12345678',
            address='测试地址',
            delivery_fee=5.0
        )
        
        # 创建商品
        self.product = Product.objects.create(
            merchant=self.merchant,
            name='测试商品',
            price=28.0,
            stock=100,
            status='on'
        )
        
        # 登录
        self.client.force_authenticate(user=self.customer)
        
    def test_create_order(self):
        """测试创建订单"""
        data = {
            'merchant_id': self.merchant.id,
            'items': [
                {'name': '测试商品', 'price': 28.0, 'quantity': 2}
            ],
            'address_snapshot': {
                'contact_name': '张三',
                'phone': '13800138000',
                'address': '测试地址'
            },
            'note': '少盐'
        }
        response = self.client.post('/api/v1/orders/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 0)
        
        # 验证订单已创建
        order = Order.objects.get(order_no=response.data['data']['order_no'])
        self.assertEqual(order.status, 'pending')
        self.assertEqual(float(order.total_amount), 56.0)
        self.assertEqual(float(order.paid_amount), 61.0)  # 56 + 5 配送费
        
    def test_get_order_list(self):
        """测试获取订单列表"""
        # 创建测试订单
        Order.objects.create(
            order_no='TEST001',
            customer=self.customer,
            merchant=self.merchant,
            address_snapshot={},
            items_snapshot=[],
            total_amount=50.0,
            delivery_fee=5.0,
            paid_amount=55.0,
            status='pending'
        )
        
        response = self.client.get('/api/v1/orders/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['data']['total'], 0)
        
    def test_pay_order(self):
        """测试支付订单"""
        order = Order.objects.create(
            order_no='TEST001',
            customer=self.customer,
            merchant=self.merchant,
            address_snapshot={},
            items_snapshot=[],
            total_amount=50.0,
            delivery_fee=5.0,
            paid_amount=55.0,
            status='pending'
        )
        
        response = self.client.post(f'/api/v1/orders/{order.id}/pay/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 0)
        
        # 验证订单状态已更新
        order.refresh_from_db()
        self.assertEqual(order.status, 'paid')
        self.assertIsNotNone(order.paid_at)
        
    def test_cancel_order(self):
        """测试取消订单"""
        order = Order.objects.create(
            order_no='TEST001',
            customer=self.customer,
            merchant=self.merchant,
            address_snapshot={},
            items_snapshot=[],
            total_amount=50.0,
            delivery_fee=5.0,
            paid_amount=55.0,
            status='pending'
        )
        
        response = self.client.post(f'/api/v1/orders/{order.id}/cancel/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证订单状态已更新
        order.refresh_from_db()
        self.assertEqual(order.status, 'cancelled')


class OrderModelTestCase(TestCase):
    """订单模型测试"""
    
    def test_create_order(self):
        """测试创建订单"""
        customer = User.objects.create_user(phone='13800000001')
        merchant_user = User.objects.create_user(phone='13800000002')
        merchant = Merchant.objects.create(
            user=merchant_user,
            store_name='测试餐厅',
            phone='021-12345678',
            address='测试地址'
        )
        
        order = Order.objects.create(
            order_no='TEST001',
            customer=customer,
            merchant=merchant,
            address_snapshot={'address': '测试地址'},
            items_snapshot=[{'name': '商品', 'price': 28, 'quantity': 1}],
            total_amount=28.0,
            delivery_fee=5.0,
            paid_amount=33.0,
            status='pending'
        )
        
        self.assertEqual(order.order_no, 'TEST001')
        self.assertEqual(order.status, 'pending')
        self.assertEqual(str(order), 'TEST001')
