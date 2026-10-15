from django.contrib import admin
from .models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger

@admin.register(DebtCustomer)
class DebtCustomerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone_number', 'company', 'credit_limit', 'current_balance', 'status', 'created_at']
    list_filter = ['status', 'company', 'created_at']
    search_fields = ['full_name', 'phone_number', 'address']
    autocomplete_fields = ['company']

@admin.register(DebtRecord)
class DebtRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'company', 'amount', 'remaining_unpaid', 'status', 'due_date', 'recorded_by', 'created_at']
    list_filter = ['status', 'company', 'due_date']
    search_fields = ['customer__full_name', 'description', 'idempotency_key']
    autocomplete_fields = ['company', 'customer', 'recorded_by']

@admin.register(RepaymentRecord)
class RepaymentRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'company', 'amount', 'payment_method', 'recorded_by', 'created_at']
    list_filter = ['payment_method', 'company', 'created_at']
    search_fields = ['customer__full_name', 'notes', 'idempotency_key']
    autocomplete_fields = ['company', 'customer', 'debt', 'recorded_by']

@admin.register(DebtLedger)
class DebtLedgerAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'company', 'transaction_type', 'amount', 'balance_before', 'balance_after', 'created_at']
    list_filter = ['transaction_type', 'company', 'created_at']
    search_fields = ['customer__full_name', 'reference_id']
    readonly_fields = ['id', 'company', 'customer', 'transaction_type', 'amount', 'balance_before', 'balance_after', 'reference_id', 'created_at']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
