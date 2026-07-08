from django.db import models
from accounts.models import User


class Upload(models.Model):
    """上传文件"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploads')
    file = models.FileField('文件', upload_to='uploads/%Y/%m/')
    content_type = models.CharField('MIME类型', max_length=100, null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'upload'

    def __str__(self):
        return self.file.name
