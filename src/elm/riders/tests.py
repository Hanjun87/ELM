from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Rider

User = get_user_model()


class RiderAPITestCase(TestCase):
    """骑手 API 测试"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(phone='13800008000', password='rider')
        self.rider = Rider.objects.create(user=self.user, real_name='测试骑手', phone='13800008000')
        self.client.force_authenticate(user=self.user)

    def test_get_rider_me(self):
        response = self.client.get('/api/v1/riders/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['real_name'], '测试骑手')

    def test_update_rider_me(self):
        response = self.client.patch('/api/v1/riders/me/', {'station': '朝阳站'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.rider.refresh_from_db()
        self.assertEqual(self.rider.station, '朝阳站')

    def test_set_work_status(self):
        response = self.client.post('/api/v1/riders/me/status/', {'work_status': 'idle'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.rider.refresh_from_db()
        self.assertEqual(self.rider.work_status, 'idle')

    def test_set_work_status_invalid(self):
        response = self.client.post('/api/v1/riders/me/status/', {'work_status': 'bogus'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_rider_me_requires_rider_profile(self):
        other_user = User.objects.create_user(phone='13800008001', password='nobody')
        self.client.force_authenticate(user=other_user)
        response = self.client.get('/api/v1/riders/me/')
        self.assertEqual(response.status_code, 404)
