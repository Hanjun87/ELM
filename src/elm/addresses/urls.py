from django.urls import path
from . import views

urlpatterns = [
    path('addresses/', views.address_list, name='address_list'),
    path('addresses/<int:pk>/', views.address_detail, name='address_detail'),
    path('addresses/<int:pk>/set_default/', views.set_default, name='set_default'),
]
