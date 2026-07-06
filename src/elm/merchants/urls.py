from django.urls import path
from . import views

urlpatterns = [
    path('merchants/', views.merchant_list, name='merchant_list'),
    path('merchants/<int:pk>/', views.merchant_detail, name='merchant_detail'),
]
