from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'phone_number', 'is_platform_super_admin', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_platform_super_admin', 'is_staff', 'is_active']
    search_fields = ['email', 'full_name', 'phone_number']
    ordering = ['email']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Shaxsiy ma\'lumotlar', {'fields': ('full_name', 'phone_number')}),
        ('Ruxsatlar va Huquqlar', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'is_platform_super_admin',
                'groups',
                'user_permissions',
            ),
        }),
        ('Vaqt tamg\'alari', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ['last_login', 'created_at', 'updated_at']

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'full_name', 'is_platform_super_admin'),
        }),
    )
