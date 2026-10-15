from django.contrib import admin
from django.urls import path, include
from apps.tenancy.dashboard_views import (
    platform_admin_dashboard,
    platform_admin_login,
    platform_admin_logout,
    api_toggle_company_status,
    api_toggle_company_module,
    api_create_company,
)

admin.site.site_header = "IDROK AI — Raw Django Database Admin"
admin.site.site_title = "IDROK AI Django Admin"
admin.site.index_title = "Django ORM Ma'lumotlar Boshqaruvi"

urlpatterns = [
    # 1. Platform Super Admin Real SaaS Dashboard
    path('', platform_admin_dashboard, name='dashboard_root'),
    path('admin/', platform_admin_dashboard, name='admin_dashboard'),
    path('admin/login/', platform_admin_login, name='admin_login'),
    path('admin/logout/', platform_admin_logout, name='admin_logout'),

    # Real Dashboard AJAX APIs
    path('admin/api/organizations/create/', api_create_company, name='admin_api_create_org'),
    path('admin/api/organizations/<uuid:company_id>/toggle-status/', api_toggle_company_status, name='admin_api_toggle_status'),
    path('admin/api/organizations/<uuid:company_id>/toggle-module/', api_toggle_company_module, name='admin_api_toggle_module'),

    # Raw Django ORM Model Admin (under /django-admin/)
    path('django-admin/', admin.site.urls),

    # 2. REST APIs for Next.js Business Dashboard & Clients
    path('api/v1/auth/', include('apps.identity.urls', namespace='identity')),
    path('api/v1/', include('apps.tenancy.urls', namespace='tenancy')),
    path('api/v1/', include('apps.debts.urls', namespace='debts')),
    path('api/v1/', include('apps.work.urls', namespace='work')),
]
