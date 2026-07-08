"""
生产环境配置
使用方法: export DJANGO_SETTINGS_MODULE=config.settings_prod
"""
from django.core.exceptions import ImproperlyConfigured
from .settings import *
import os

# 安全设置
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')  # 从环境变量读取
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

for _var in ('SECRET_KEY', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'):
    if not os.environ.get(_var):
        raise ImproperlyConfigured(f'{_var} environment variable must be set in production')
if ALLOWED_HOSTS == ['']:
    raise ImproperlyConfigured('ALLOWED_HOSTS environment variable must be set in production')

# HTTPS 设置
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS 设置（生产环境）
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# 数据库（生产环境使用 PostgreSQL）
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# 日志配置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/elm.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO',
    },
}

# 静态文件
STATIC_ROOT = '/var/www/elm/static/'
MEDIA_ROOT = '/var/www/elm/media/'

# Channels（生产环境使用 Redis，支持多进程/多机部署）
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.environ.get('REDIS_URL', 'redis://localhost:6379/0')],
        },
    },
}

# 限流（生产环境）
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    },
}
