from decimal import Decimal
from rest_framework import serializers
from .models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger

class DebtCustomerSerializer(serializers.ModelSerializer):
    credit_limit = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = DebtCustomer
        fields = [
            'id',
            'company_id',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'address',
            'credit_limit',
            'current_balance',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'company_id', 'current_balance', 'created_at', 'updated_at']

class CreateDebtCustomerSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=128, required=False, allow_blank=True, default='')
    last_name = serializers.CharField(max_length=128, required=False, allow_blank=True, default='')
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')
    credit_limit = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal('0.00'))
    initial_debt = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal('0.00'), write_only=True)

    class Meta:
        model = DebtCustomer
        fields = [
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'address',
            'credit_limit',
            'initial_debt',
            'notes',
        ]

    def validate(self, attrs):
        first_name = attrs.get('first_name', '').strip()
        last_name = attrs.get('last_name', '').strip()
        full_name = attrs.get('full_name', '').strip()
        if not full_name and not (first_name or last_name):
            raise serializers.ValidationError({"first_name": "Mijozning ismi yoki to'liq ismi kiritilishi shart."})
        if not full_name:
            attrs['full_name'] = f"{first_name} {last_name}".strip()
        return attrs

class DebtRecordSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_unpaid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    recorded_by_user_id = serializers.UUIDField(source='recorded_by.id', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = DebtRecord
        fields = [
            'id',
            'company_id',
            'customer_id',
            'customer_name',
            'amount',
            'remaining_unpaid',
            'description',
            'due_date',
            'status',
            'recorded_by_user_id',
            'recorded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'company_id', 'remaining_unpaid', 'status', 'created_at']

class CreateDebtSerializer(serializers.Serializer):
    customer_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    description = serializers.CharField(max_length=1000)
    due_date = serializers.DateField(required=False, allow_null=True)

class RepaymentRecordSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    recorded_by_user_id = serializers.UUIDField(source='recorded_by.id', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)

    class Meta:
        model = RepaymentRecord
        fields = [
            'id',
            'company_id',
            'customer_id',
            'customer_name',
            'debt_id',
            'amount',
            'payment_method',
            'notes',
            'idempotency_key',
            'recorded_by_user_id',
            'recorded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'company_id', 'created_at']

class CreateRepaymentSerializer(serializers.Serializer):
    customer_id = serializers.UUIDField()
    debt_id = serializers.UUIDField(required=False, allow_null=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    payment_method = serializers.ChoiceField(choices=RepaymentRecord.METHOD_CHOICES, default=RepaymentRecord.METHOD_CASH)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

class DebtLedgerEntrySerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance_before = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance_after = serializers.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = DebtLedger
        fields = [
            'id',
            'customer_id',
            'transaction_type',
            'amount',
            'balance_before',
            'balance_after',
            'reference_id',
            'created_at',
        ]
