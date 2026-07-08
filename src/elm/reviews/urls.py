from django.urls import path
from . import views

urlpatterns = [
    path('merchants/<int:merchant_id>/reviews/', views.merchant_review_list, name='merchant_review_list'),
    path('reviews/create/', views.review_create, name='review_create'),
    path('reviews/<int:pk>/reply/', views.review_reply, name='review_reply'),
]
