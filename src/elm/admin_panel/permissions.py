from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """仅平台管理员可访问"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('admin')
