from django.db import models
from accounts.models import User


class Rider(models.Model):
    """骑手"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    real_name = models.CharField('真实姓名', max_length=50)
    phone = models.CharField('电话', max_length=20)
    station = models.CharField('站点', max_length=100, null=True, blank=True)
    work_status = models.CharField('工作状态', max_length=20, default='offline', 
        choices=[('offline', '离线'), ('idle', '空闲'), ('busy', '忙碌'), ('delivering', '配送中')])
    balance = models.DecimalField('余额', max_digits=10, decimal_places=2, default=0)
    total_orders = models.IntegerField('总单量', default=0)
    rating = models.DecimalField('评分', max_digits=3, decimal_places=2, default=5.0)
    created_at = models.DateTimeField('注册时间', auto_now_add=True)

    class Meta:
        db_table = 'rider'

    def __str__(self):
        return self.real_name
