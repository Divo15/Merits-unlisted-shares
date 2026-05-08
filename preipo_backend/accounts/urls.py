from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/step1/', views.register_step1, name='register_step1'),
    path('register/step2/', views.register_step2, name='register_step2'),
    path('register/step3/', views.register_step3, name='register_step3'),
    path('login/',          views.login,           name='login'),
    path('logout/',         views.logout,          name='logout'),
    path('token/refresh/',  TokenRefreshView.as_view(), name='token_refresh'),
    path('me/',             views.me,              name='me'),
    path('portfolio/',      views.portfolio_view,  name='portfolio'),
]
