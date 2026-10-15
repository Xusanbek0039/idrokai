from decimal import Decimal
from rest_framework import serializers
from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger

class MarketLoginSerializer(serializers.Serializer):
    """Magazinchi tizimga kirish serializatori (telefon raqam yoki email orqali)."""
    login = serializers.CharField(
        help_text="Telefon raqam (+998901234567) yoki elektron pochta (email)",
        required=True
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

class MarketCustomerSerializer(serializers.ModelSerializer):
    """Do'kon mijozi va uning qarz ma'lumotlari."""
    credit_limit = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    qarz_summasi = serializers.DecimalField(source='current_balance', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = DebtCustomer
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'address',
            'current_balance',
            'qarz_summasi',
            'credit_limit',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'current_balance', 'qarz_summasi', 'full_name', 'created_at', 'updated_at']

class MarketCreateCustomerSerializer(serializers.Serializer):
    """
    Magazinchi tomonidan yangi mijoz kiritish.
    Tartibi: ism, familiya, telefon raqam, manzil va qarz summasi.
    """
    first_name = serializers.CharField(
        max_length=128,
        required=True,
        help_text="Mijoz ismi"
    )
    last_name = serializers.CharField(
        max_length=128,
        required=True,
        help_text="Mijoz familiyasi"
    )
    phone_number = serializers.CharField(
        max_length=32,
        required=True,
        help_text="Telefon raqam (masalan: +998901234567)"
    )
    address = serializers.CharField(
        max_length=512,
        required=False,
        allow_blank=True,
        default='',
        help_text="Mijoz yashash manzili"
    )
    # Qarz summasi (ikkala nom ham qabul qilinadi: qarz_summasi yoki initial_debt)
    qarz_summasi = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        default=Decimal('0.00'),
        help_text="Boshlang'ich qarz summasi (ixtiyoriy, default: 0.00)"
    )
    initial_debt = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        default=None,
        help_text="qarz_summasi uchun alias"
    )
    credit_limit = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        default=Decimal('0.00'),
        help_text="Maksimal ruxsat etilgan qarz limiti (0.00 - cheklanmagan)"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
        help_text="Qo'shimcha eslatmalar"
    )

    def validate(self, attrs):
        first_name = attrs.get('first_name', '').strip()
        last_name = attrs.get('last_name', '').strip()
        phone_number = attrs.get('phone_number', '').strip()

        if not first_name:
            raise serializers.ValidationError({"first_name": "Mijoz ismi kiritilishi shart."})
        if not last_name:
            raise serializers.ValidationError({"last_name": "Mijoz familiyasi kiritilishi shart."})
        if not phone_number:
            raise serializers.ValidationError({"phone_number": "Telefon raqami kiritilishi shart."})

        # initial_debt va qarz_summasi ni birlashtirish
        debt = attrs.get('initial_debt')
        if debt is None:
            debt = attrs.get('qarz_summasi', Decimal('0.00'))
        
        if debt < Decimal('0.00'):
            raise serializers.ValidationError({"qarz_summasi": "Qarz summasi musbat son bo'lishi kerak."})
            
        attrs['resolved_initial_debt'] = debt
        attrs['first_name'] = first_name
        attrs['last_name'] = last_name
        attrs['phone_number'] = phone_number
        return attrs

class MarketUpdateCustomerSerializer(serializers.ModelSerializer):
    """Mijoz ma'lumotlarini tahrirlash."""
    class Meta:
        model = DebtCustomer
        fields = [
            'first_name',
            'last_name',
            'phone_number',
            'address',
            'credit_limit',
            'status',
            'notes',
        ]

class MarketAddDebtSerializer(serializers.Serializer):
    """Mijozga qo'shimcha nasiya/qarz yozish."""
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=True,
        help_text="Berilgan qarz summasi"
    )
    description = serializers.CharField(
        required=False,
        default="Do'kondan nasiya xarid",
        help_text="Xarid qilingan mahsulotlar ro'yxati yoki tavsifi"
    )
    due_date = serializers.DateField(
        required=False,
        allow_null=True,
        default=None,
        help_text="Qarzni qaytarish muddati (YYYY-MM-DD)"
    )

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Qarz summasi 0 dan katta bo'lishi shart.")
        return value

class MarketRepaymentSerializer(serializers.Serializer):
    """Mijoz tomonidan qarz to'langanda qayd qilish."""
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=True,
        help_text="To'langan qarz summasi"
    )
    payment_method = serializers.ChoiceField(
        choices=RepaymentRecord.METHOD_CHOICES,
        default=RepaymentRecord.METHOD_CASH,
        help_text="To'lov usuli: cash (naqd), card (plastik karta), bank_transfer (o'tkazma)"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
        help_text="To'lov bo'yicha izoh"
    )

    def validate_amount(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("To'lov summasi 0 dan katta bo'lishi shart.")
        return value

class MarketCustomerLedgerSerializer(serializers.ModelSerializer):
    """Mijozning barcha qarz va to'lovlar tarixi (o'zgarmas audit daftari)."""
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = DebtLedger
        fields = [
            'id',
            'transaction_type',
            'transaction_type_display',
            'amount',
            'balance_before',
            'balance_after',
            'reference_id',
            'created_at',
        ]
