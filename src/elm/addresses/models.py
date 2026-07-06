from django.db import models
from accounts.models import User


class Address(models.Model):
    """收货地址"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    tag = models.CharField('标签', max_length=20, null=True, blank=True)
    contact_name = models.CharField('收件人', max_length=50)
    contact_phone = models.CharField('电话', max_length=20)
    address = models.CharField('详细地址', max_length=200)
    is_default = models.BooleanField('默认', default=False)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'address'

    def __str__(self):
        return f'{self.contact_name} - {self.address}'
