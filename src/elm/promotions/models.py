from django.db import models
from accounts.models import User
from merchants.models import Merchant


class Coupon(models.Model):
    """优惠券"""
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField('名称', max_length=100)
    discount_amount = models.DecimalField('优惠金额', max_digits=10, decimal_places=2)
    min_spend = models.DecimalField('最低消费', max_digits=10, decimal_places=2, default=0)
    valid_until = models.DateTimeField('有效期至')
    is_active = models.BooleanField('启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'coupon'

    def __str__(self):
        return self.name


class UserCoupon(models.Model):
    """用户优惠券"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    status = models.CharField('状态', max_length=20, default='unused', 
        choices=[('unused', '未使用'), ('used', '已使用'), ('expired', '已过期')])
    used_at = models.DateTimeField('使用时间', null=True, blank=True)
    created_at = models.DateTimeField('领取时间', auto_now_add=True)

    class Meta:
        db_table = 'user_coupon'
