from django.contrib import admin
from .models import AuditEvent, IdempotencyRecord

@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ['action', 'company', 'actor', 'target_type', 'target_id', 'created_at']
    list_filter = ['action', 'company', 'created_at']
    search_fields = ['action', 'target_type', 'actor__email']
    readonly_fields = ['id', 'company', 'actor', 'action', 'target_type', 'target_id', 'metadata', 'created_at', 'updated_at']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(IdempotencyRecord)
class IdempotencyRecordAdmin(admin.ModelAdmin):
    list_display = ['key', 'company', 'user', 'endpoint', 'response_status', 'is_completed', 'expires_at']
    list_filter = ['is_completed', 'endpoint', 'created_at']
    search_fields = ['key', 'endpoint']
    readonly_fields = ['id', 'key', 'company', 'user', 'endpoint', 'request_hash', 'response_status', 'response_body', 'is_completed', 'expires_at', 'created_at', 'updated_at']
