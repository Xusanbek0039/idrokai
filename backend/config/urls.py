from django.contrib import admin
from django.urls import path, include

admin.site.site_header = "IDROK AI — Platform Super Admin"
admin.site.site_title = "IDROK AI Admin"
admin.site.index_title = "Platform Boshqaruvi va Monitoring"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.identity.urls', namespace='identity')),
    path('api/v1/', include('apps.tenancy.urls', namespace='tenancy')),
    path('api/v1/', include('apps.debts.urls', namespace='debts')),
    path('api/v1/', include('apps.work.urls', namespace='work')),
]
