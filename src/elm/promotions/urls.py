from django.urls import path
from . import views

urlpatterns = [
    path('coupons/', views.coupon_list, name='coupon_list'),
    path('coupons/<int:pk>/', views.coupon_detail, name='coupon_detail'),
    path('coupons/<int:pk>/claim/', views.claim_coupon, name='claim_coupon'),
    path('user/coupons/', views.user_coupons, name='user_coupons'),
]
