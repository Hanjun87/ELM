from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """用户基础表"""
    username = None
    phone = models.CharField('手机号', max_length=11, unique=True)
    avatar = models.URLField('头像', null=True, blank=True)
    status = models.CharField('状态', max_length=20, default='active')
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.phone


class Role(models.Model):
    """角色表"""
    name = models.CharField('角色名', max_length=50, unique=True)
    display_name = models.CharField('显示名称', max_length=50)
    permissions = models.JSONField('权限', default=list)

    class Meta:
        db_table = 'role'


class UserRole(models.Model):
    """用户角色"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        db_table = 'user_role'
        unique_together = ('user', 'role')
