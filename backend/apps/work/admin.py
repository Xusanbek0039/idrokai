from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'customer', 'assigned_to', 'due_date', 'status', 'created_at']
    list_filter = ['status', 'company', 'due_date']
    search_fields = ['title', 'customer__full_name']
    autocomplete_fields = ['company', 'customer', 'assigned_to']
