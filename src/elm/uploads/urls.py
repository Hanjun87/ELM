from django.urls import path
from . import views

urlpatterns = [
    path('uploads/', views.upload_create, name='upload_create'),
]
