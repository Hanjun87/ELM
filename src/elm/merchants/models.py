from django.db import models
from accounts.models import User


class Merchant(models.Model):
    """商家表"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    store_name = models.CharField('店铺名', max_length=100)
    logo = models.URLField(null=True, blank=True)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=200)
    status = models.CharField(max_length=20, default='open')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)

    class Meta:
        db_table = 'merchant'
