from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from merchants.models import Merchant
from orders.models import Order
from .models import Review

User = get_user_model()


class ReviewAPITestCase(TestCase):
    """评价 API 测试"""

    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(phone='13800007000', password='customer')

        merchant_user = User.objects.create_user(phone='13800007001', password='merchant')
        self.merchant = Merchant.objects.create(
            user=merchant_user, store_name='测试餐厅', phone='021-1', address='测试地址'
        )

        self.order = Order.objects.create(
            order_no='REVTEST001',
            customer=self.customer,
            merchant=self.merchant,
            address_snapshot={},
            items_snapshot=[],
            total_amount=50.0,
            delivery_fee=5.0,
            paid_amount=55.0,
            status='delivered',
        )
        self.client.force_authenticate(user=self.customer)

    def test_create_review(self):
        response = self.client.post('/api/v1/reviews/create/', {
            'order': self.order.id,
            'rating': 5,
            'content': '很好吃',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['code'], 0)
        self.assertEqual(Review.objects.filter(order=self.order).count(), 1)

    def test_cannot_review_unfinished_order(self):
        self.order.status = 'pending'
        self.order.save()
        response = self.client.post('/api/v1/reviews/create/', {
            'order': self.order.id,
            'rating': 5,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_cannot_review_twice(self):
        Review.objects.create(order=self.order, customer=self.customer, merchant=self.merchant, rating=4)
        response = self.client.post('/api/v1/reviews/create/', {
            'order': self.order.id,
            'rating': 5,
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_merchant_review_list(self):
        Review.objects.create(order=self.order, customer=self.customer, merchant=self.merchant, rating=4)
        response = self.client.get(f'/api/v1/merchants/{self.merchant.id}/reviews/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['data']['total'], 1)

    def test_merchant_reply(self):
        review = Review.objects.create(order=self.order, customer=self.customer, merchant=self.merchant, rating=4)
        self.client.force_authenticate(user=self.merchant.user)
        response = self.client.post(f'/api/v1/reviews/{review.id}/reply/', {'reply': '感谢您的支持'}, format='json')
        self.assertEqual(response.status_code, 200)
        review.refresh_from_db()
        self.assertEqual(review.reply, '感谢您的支持')
