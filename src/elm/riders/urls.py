from django.urls import path
from . import views

urlpatterns = [
    path('riders/me/', views.rider_me, name='rider_me'),
    path('riders/me/status/', views.rider_set_status, name='rider_set_status'),
]
