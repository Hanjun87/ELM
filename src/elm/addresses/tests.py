from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Address

User = get_user_model()


class AddressAPITestCase(TestCase):
    """地址 API 测试"""
    
    def setUp(self):
        """测试前准备"""
        self.client = APIClient()
        self.user = User.objects.create_user(phone='13800000001', password='customer')
        self.client.force_authenticate(user=self.user)
        
    def test_create_address(self):
        """测试创建地址"""
        data = {
            'tag': '家',
            'contact_name': '张三',
            'contact_phone': '13800138000',
            'address': '测试地址 123号',
            'is_default': True
        }
        response = self.client.post('/api/v1/addresses/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 0)
        
        # 验证地址已创建
        address = Address.objects.get(id=response.data['data']['id'])
        self.assertEqual(address.contact_name, '张三')
        self.assertTrue(address.is_default)
        
    def test_get_address_list(self):
        """测试获取地址列表"""
        Address.objects.create(
            user=self.user,
            contact_name='张三',
            contact_phone='13800138000',
            address='测试地址'
        )
        
        response = self.client.get('/api/v1/addresses/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['data']['total'], 0)
        
    def test_update_address(self):
        """测试更新地址"""
        address = Address.objects.create(
            user=self.user,
            contact_name='张三',
            contact_phone='13800138000',
            address='旧地址'
        )
        
        data = {'address': '新地址'}
        response = self.client.patch(f'/api/v1/addresses/{address.id}/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证地址已更新
        address.refresh_from_db()
        self.assertEqual(address.address, '新地址')
        
    def test_delete_address(self):
        """测试删除地址"""
        address = Address.objects.create(
            user=self.user,
            contact_name='张三',
            contact_phone='13800138000',
            address='测试地址'
        )
        
        response = self.client.delete(f'/api/v1/addresses/{address.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证地址已删除
        self.assertFalse(Address.objects.filter(id=address.id).exists())
        
    def test_set_default_address(self):
        """测试设置默认地址"""
        addr1 = Address.objects.create(
            user=self.user,
            contact_name='张三',
            contact_phone='13800138000',
            address='地址1',
            is_default=True
        )
        addr2 = Address.objects.create(
            user=self.user,
            contact_name='李四',
            contact_phone='13800138001',
            address='地址2',
            is_default=False
        )
        
        response = self.client.post(f'/api/v1/addresses/{addr2.id}/set_default/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证默认状态已更新
        addr1.refresh_from_db()
        addr2.refresh_from_db()
        self.assertFalse(addr1.is_default)
        self.assertTrue(addr2.is_default)
