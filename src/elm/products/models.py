from django.db import models


class Category(models.Model):
    """商品分类"""
    name = models.CharField('分类名称', max_length=50, unique=True)
    icon = models.CharField('图标', max_length=50, null=True, blank=True)
    sort_order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('启用', default=True)

    class Meta:
        db_table = 'category'
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class Product(models.Model):
    """商品"""
    from merchants.models import Merchant
    
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField('商品名', max_length=100)
    description = models.TextField('描述', null=True, blank=True)
    image = models.URLField('图片', null=True, blank=True)
    price = models.DecimalField('价格', max_digits=10, decimal_places=2)
    original_price = models.DecimalField('原价', max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField('库存', default=0)
    status = models.CharField('状态', max_length=20, default='off', choices=[('on', '上架'), ('off', '下架')])
    sales_count = models.IntegerField('销量', default=0)
    rating = models.DecimalField('评分', max_digits=3, decimal_places=2, default=5.0)
    specs = models.JSONField('规格', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        db_table = 'product'

    def __str__(self):
        return self.name
