from django.db import models
from accounts.models import User


class Merchant(models.Model):
    """商家表"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    store_name = models.CharField('店铺名', max_length=100)
    logo = models.URLField(null=True, blank=True)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=200)
    min_order = models.DecimalField('起送金额', max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField('配送费', max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='open')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    monthly_sales = models.IntegerField('月销量', default=0)

    class Meta:
        db_table = 'merchant'

    def __str__(self):
        return self.store_name
