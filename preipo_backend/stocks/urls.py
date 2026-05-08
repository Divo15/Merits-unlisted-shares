from django.urls import path
from . import views

urlpatterns = [
    path('', views.stock_list, name='stock-list'),
    path('news/', views.news_feed, name='news-feed'),
    path('admin/create/', views.stock_create, name='stock-create'),
    path('admin/<int:pk>/update/', views.stock_update, name='stock-update'),
    path('admin/<int:pk>/delete/', views.stock_delete, name='stock-delete'),
    path('<int:pk>/', views.stock_detail, name='stock-detail'),
]
