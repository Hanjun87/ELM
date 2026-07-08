from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
import shutil
import tempfile

User = get_user_model()

TEMP_MEDIA_ROOT = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class UploadAPITestCase(TestCase):
    """上传 API 测试"""

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(phone='13800009999', password='test')
        self.client.force_authenticate(user=self.user)

    def test_upload_image(self):
        image = SimpleUploadedFile('test.png', b'fakeimagedata', content_type='image/png')
        response = self.client.post('/api/v1/uploads/', {'file': image}, format='multipart')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['code'], 0)
        self.assertIn('url', response.data['data'])

    def test_upload_rejects_non_image(self):
        file = SimpleUploadedFile('test.txt', b'not an image', content_type='text/plain')
        response = self.client.post('/api/v1/uploads/', {'file': file}, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_upload_requires_file(self):
        response = self.client.post('/api/v1/uploads/', {}, format='multipart')
        self.assertEqual(response.status_code, 400)
