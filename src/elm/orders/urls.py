from django.urls import path
from . import views

urlpatterns = [
    # Customer
    path('orders/', views.order_list, name='order_list'),
    path('orders/<int:pk>/', views.order_detail, name='order_detail'),
    path('orders/create/', views.order_create, name='order_create'),
    path('orders/<int:pk>/pay/', views.order_pay, name='order_pay'),
    path('orders/<int:pk>/cancel/', views.order_cancel, name='order_cancel'),
    
    # Merchant
    path('merchant/orders/', views.merchant_orders, name='merchant_orders'),
    path('merchant/orders/<int:pk>/accept/', views.merchant_accept_order, name='merchant_accept'),
    path('merchant/orders/<int:pk>/reject/', views.merchant_reject_order, name='merchant_reject'),
    
    # Rider
    path('rider/orders/available/', views.rider_available_orders, name='rider_available'),
    path('rider/orders/<int:pk>/grab/', views.rider_grab_order, name='rider_grab'),
    path('rider/orders/<int:pk>/pickup/', views.rider_pickup_order, name='rider_pickup'),
    path('rider/orders/<int:pk>/deliver/', views.rider_deliver_order, name='rider_deliver'),
]
