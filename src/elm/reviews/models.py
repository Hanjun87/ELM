from django.db import models
from accounts.models import User
from merchants.models import Merchant
from orders.models import Order


class Review(models.Model):
    """评价"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE)
    rating = models.IntegerField('评分', choices=[(i, i) for i in range(1, 6)])
    content = models.TextField('内容', null=True, blank=True)
    images = models.JSONField('图片', null=True, blank=True)
    reply = models.TextField('回复', null=True, blank=True)
    replied_at = models.DateTimeField('回复时间', null=True, blank=True)
    created_at = models.DateTimeField('评价时间', auto_now_add=True)

    class Meta:
        db_table = 'review'

    def __str__(self):
        return f'{self.customer.phone} - {self.rating}星'
