from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from accounts.models import Role, UserRole
from merchants.models import Merchant

User = get_user_model()


class AdminPanelAPITestCase(TestCase):
    """管理后台 API 测试"""

    def setUp(self):
        self.client = APIClient()

        self.admin_role = Role.objects.create(name='admin', display_name='管理员', permissions=['*'])
        self.customer_role = Role.objects.create(name='customer', display_name='客户', permissions=[])

        self.admin = User.objects.create_user(phone='13800009000', password='admin')
        UserRole.objects.create(user=self.admin, role=self.admin_role)

        self.customer = User.objects.create_user(phone='13800009001', password='customer')
        UserRole.objects.create(user=self.customer, role=self.customer_role)

        merchant_user = User.objects.create_user(phone='13800009002', password='merchant')
        self.merchant = Merchant.objects.create(
            user=merchant_user, store_name='测试餐厅', phone='021-1', address='测试地址'
        )

    def test_dashboard_requires_admin(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/v1/admin/dashboard/')
        self.assertEqual(response.status_code, 403)

    def test_dashboard_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/admin/dashboard/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['code'], 0)
        self.assertIn('gmv', response.data['data'])

    def test_ban_and_unban_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(f'/api/v1/admin/users/{self.customer.id}/ban/')
        self.assertEqual(response.status_code, 200)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.status, 'banned')

        response = self.client.post(f'/api/v1/admin/users/{self.customer.id}/unban/')
        self.assertEqual(response.status_code, 200)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.status, 'active')

    def test_merchant_set_status(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/v1/admin/merchants/{self.merchant.id}/status/', {'status': 'closed'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.merchant.refresh_from_db()
        self.assertEqual(self.merchant.status, 'closed')
