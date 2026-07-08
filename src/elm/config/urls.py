from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/', include('merchants.urls')),
    path('api/v1/', include('products.urls')),
    path('api/v1/', include('orders.urls')),
    path('api/v1/', include('addresses.urls')),
    path('api/v1/', include('promotions.urls')),
    path('api/v1/', include('riders.urls')),
    path('api/v1/', include('reviews.urls')),
    path('api/v1/', include('admin_panel.urls')),
    path('api/v1/', include('uploads.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
