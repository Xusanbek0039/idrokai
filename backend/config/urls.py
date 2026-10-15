from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.identity.urls', namespace='identity')),
    path('api/v1/', include('apps.tenancy.urls', namespace='tenancy')),
    path('api/v1/', include('apps.debts.urls', namespace='debts')),
    path('api/v1/', include('apps.work.urls', namespace='work')),
]
