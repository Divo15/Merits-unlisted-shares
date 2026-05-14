from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from accounts.views import kylas_deal_webhook

urlpatterns = [
    path('api/stocks/',              include('stocks.urls')),
    path('api/auth/',                include('accounts.urls')),
    path('api/webhook/kylas-deal/',  kylas_deal_webhook, name='kylas_deal_webhook'),
    re_path(r'^media/(?P<path>.+)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
