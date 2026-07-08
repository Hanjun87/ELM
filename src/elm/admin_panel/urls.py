from django.urls import path
from . import views

urlpatterns = [
    path('admin/dashboard/', views.dashboard, name='admin_dashboard'),
    path('admin/users/', views.user_list, name='admin_user_list'),
    path('admin/users/<int:pk>/ban/', views.user_ban, name='admin_user_ban'),
    path('admin/users/<int:pk>/unban/', views.user_unban, name='admin_user_unban'),
    path('admin/merchants/', views.merchant_list, name='admin_merchant_list'),
    path('admin/merchants/<int:pk>/status/', views.merchant_set_status, name='admin_merchant_set_status'),
]
