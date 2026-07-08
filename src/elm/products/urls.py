from django.urls import path
from . import views

urlpatterns = [
    path('merchants/<int:merchant_id>/products/', views.product_list, name='product_list'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('categories/', views.category_list, name='category_list'),
    path('merchant/products/', views.merchant_product_list, name='merchant_product_list'),
    path('merchant/products/<int:pk>/', views.merchant_product_detail, name='merchant_product_detail'),
    path('merchant/products/<int:pk>/toggle/', views.merchant_product_toggle, name='merchant_product_toggle'),
]
