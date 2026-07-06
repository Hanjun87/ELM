from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """自定义用户管理器"""
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError('手机号必须提供')
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, password, **extra_fields)


class User(AbstractUser):
    """用户基础表"""
    username = None
    phone = models.CharField('手机号', max_length=11, unique=True)
    avatar = models.URLField('头像', null=True, blank=True)
    status = models.CharField('状态', max_length=20, default='active')
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []
    
    objects = UserManager()

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.phone

    def get_roles(self):
        """获取用户所有角色"""
        return [ur.role.name for ur in self.user_roles.all()]

    def has_role(self, role_name):
        """判断用户是否拥有某个角色"""
        return role_name in self.get_roles()


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
