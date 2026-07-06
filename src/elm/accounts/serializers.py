from rest_framework import serializers
from .models import User, Role


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'phone', 'email', 'avatar', 'status', 'roles', 'created_at']
        
    def get_roles(self, obj):
        return [ur.role.name for ur in obj.user_roles.all()]


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=11)
    password = serializers.CharField(write_only=True)
