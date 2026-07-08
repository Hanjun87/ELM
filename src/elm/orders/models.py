from django.db import models
from accounts.models import User
from merchants.models import Merchant
from riders.models import Rider


class Order(models.Model):
    """订单"""
    STATUS_CHOICES = [
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('accepted', '已接单'),
        ('preparing', '准备中'),
        ('ready', '待取餐'),
        ('picked', '配送中'),
        ('delivered', '已送达'),
        ('finished', '已完成'),
        ('cancelled', '已取消'),
    ]
    
    order_no = models.CharField('订单号', max_length=32, unique=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE)
    rider = models.ForeignKey(Rider, on_delete=models.SET_NULL, null=True, blank=True)
    address_snapshot = models.JSONField('地址快照')
    items_snapshot = models.JSONField('商品快照')
    total_amount = models.DecimalField('总金额', max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField('配送费', max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField('实付金额', max_digits=10, decimal_places=2)
    status = models.CharField('状态', max_length=20, default='pending', choices=STATUS_CHOICES)
    note = models.TextField('备注', null=True, blank=True)
    created_at = models.DateTimeField('下单时间', auto_now_add=True)
    paid_at = models.DateTimeField('支付时间', null=True, blank=True)
    accepted_at = models.DateTimeField('接单时间', null=True, blank=True)
    prepared_at = models.DateTimeField('出餐完成时间', null=True, blank=True)
    picked_at = models.DateTimeField('取餐时间', null=True, blank=True)
    delivered_at = models.DateTimeField('送达时间', null=True, blank=True)

    class Meta:
        db_table = 'order'
        ordering = ['-created_at']

    def __str__(self):
        return self.order_no
