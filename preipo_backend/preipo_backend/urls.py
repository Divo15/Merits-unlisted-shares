from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from accounts.views import kylas_deal_webhook

# NOTE: Update this to the production frontend URL before deploying
admin.site.site_url = 'https://72cc3a84fa61efd3-125-99-5-219.serveousercontent.com'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/stocks/',              include('stocks.urls')),
    path('api/auth/',                include('accounts.urls')),
    path('api/webhook/kylas-deal/',  kylas_deal_webhook, name='kylas_deal_webhook'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
