from rest_framework import serializers
from .models import Upload


class UploadSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = ['id', 'url', 'content_type', 'created_at']

    def get_url(self, obj):
        request = self.context.get('request')
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url
