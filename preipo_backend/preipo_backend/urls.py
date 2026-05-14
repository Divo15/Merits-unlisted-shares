from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from accounts.views import kylas_deal_webhook

urlpatterns = [
    path('api/stocks/',              include('stocks.urls')),
    path('api/auth/',                include('accounts.urls')),
    path('api/webhook/kylas-deal/',  kylas_deal_webhook, name='kylas_deal_webhook'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
