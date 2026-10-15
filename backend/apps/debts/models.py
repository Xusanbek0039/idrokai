import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.common.models import CompanyScopedModel, UUIDModel, TimeStampedModel

class DebtCustomer(CompanyScopedModel):
    """Debtor customer registered within a shop tenant."""
    STATUS_ACTIVE = 'active'
    STATUS_FROZEN = 'frozen'
    STATUS_ARCHIVED = 'archived'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_FROZEN, 'Frozen'),
        (STATUS_ARCHIVED, 'Archived'),
    ]

    first_name = models.CharField(max_length=128, blank=True, default='', db_index=True)
    last_name = models.CharField(max_length=128, blank=True, default='', db_index=True)
    full_name = models.CharField(max_length=255, db_index=True)
    phone_number = models.CharField(max_length=32, db_index=True)
    address = models.CharField(max_length=512, blank=True)
    
    # Financial precision: strictly DecimalField
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Maximum allowed credit (0.00 means unlimited or default shop limit).'
    )
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Current total unpaid debt balance owed by this customer.'
    )
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Debtor Customer'
        verbose_name_plural = 'Debtor Customers'
        ordering = ['full_name']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(current_balance__gte=Decimal('0.00')),
                name='debt_customer_balance_non_negative'
            ),
            models.CheckConstraint(
                condition=models.Q(credit_limit__gte=Decimal('0.00')),
                name='debt_customer_credit_limit_non_negative'
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.first_name and not self.last_name and self.full_name:
            parts = self.full_name.strip().split(' ', 1)
            self.first_name = parts[0]
            self.last_name = parts[1] if len(parts) > 1 else ''
        elif self.first_name or self.last_name:
            self.full_name = f"{self.first_name} {self.last_name}".strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.phone_number}) - Balance: {self.current_balance}"

class DebtRecord(CompanyScopedModel):
    """Represents a specific debt issuance ('Nasiya savdo') to a customer."""
    STATUS_PENDING = 'pending'
    STATUS_PARTIALLY_PAID = 'partially_paid'
    STATUS_PAID = 'paid'
    STATUS_OVERDUE = 'overdue'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PARTIALLY_PAID, 'Partially Paid'),
        (STATUS_PAID, 'Paid'),
        (STATUS_OVERDUE, 'Overdue'),
    ]

    customer = models.ForeignKey(
        DebtCustomer,
        on_delete=models.CASCADE,
        related_name='debts',
        db_index=True
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Original principal debt amount.'
    )
    remaining_unpaid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Remaining unpaid balance of this specific debt.'
    )
    description = models.TextField(help_text='Purchased items or sale summary.')
    due_date = models.DateField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    
    # Idempotency token to prevent double-recording
    idempotency_key = models.UUIDField(null=True, blank=True, unique=True, db_index=True)

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_debts'
    )

    class Meta:
        verbose_name = 'Debt Record'
        verbose_name_plural = 'Debt Records'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=Decimal('0.00')),
                name='debt_amount_strictly_positive'
            ),
            models.CheckConstraint(
                condition=models.Q(remaining_unpaid__gte=Decimal('0.00')),
                name='debt_remaining_unpaid_non_negative'
            ),
        ]

    def __str__(self):
        return f"Debt #{self.id} - {self.customer.full_name}: {self.amount} ({self.status})"

class RepaymentRecord(CompanyScopedModel):
    """Represents a customer repayment."""
    METHOD_CASH = 'cash'
    METHOD_CARD = 'card'
    METHOD_BANK_TRANSFER = 'bank_transfer'

    METHOD_CHOICES = [
        (METHOD_CASH, 'Cash'),
        (METHOD_CARD, 'Card'),
        (METHOD_BANK_TRANSFER, 'Bank Transfer'),
    ]

    customer = models.ForeignKey(
        DebtCustomer,
        on_delete=models.CASCADE,
        related_name='repayments',
        db_index=True
    )
    debt = models.ForeignKey(
        DebtRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='repayments',
        help_text='Optional specific debt this repayment settles.'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Repaid amount.'
    )
    payment_method = models.CharField(max_length=16, choices=METHOD_CHOICES, default=METHOD_CASH)
    notes = models.TextField(blank=True)
    
    # Mandatory Idempotency Key
    idempotency_key = models.UUIDField(unique=True, db_index=True)

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_repayments'
    )

    class Meta:
        verbose_name = 'Repayment Record'
        verbose_name_plural = 'Repayment Records'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=Decimal('0.00')),
                name='repayment_amount_strictly_positive'
            ),
        ]

    def __str__(self):
        return f"Repayment #{self.id} - {self.customer.full_name}: {self.amount} via {self.payment_method}"

class DebtLedger(CompanyScopedModel):
    """
    Immutable double-entry financial ledger recording every balance modification.
    Guarantees that customer balances can always be reconstructed and verified
    without relying on row-level database locking in SQLite.
    """
    TYPE_DEBT_ISSUED = 'DEBT_ISSUED'
    TYPE_REPAYMENT_RECEIVED = 'REPAYMENT_RECEIVED'
    TYPE_BALANCE_ADJUSTMENT = 'BALANCE_ADJUSTMENT'

    TYPE_CHOICES = [
        (TYPE_DEBT_ISSUED, 'Debt Issued'),
        (TYPE_REPAYMENT_RECEIVED, 'Repayment Received'),
        (TYPE_BALANCE_ADJUSTMENT, 'Balance Adjustment'),
    ]

    customer = models.ForeignKey(
        DebtCustomer,
        on_delete=models.CASCADE,
        related_name='ledger_entries',
        db_index=True
    )
    transaction_type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_before = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    reference_id = models.UUIDField(help_text='ID of the associated DebtRecord or RepaymentRecord')

    class Meta:
        verbose_name = 'Debt Ledger Entry'
        verbose_name_plural = 'Debt Ledger Entries'
        ordering = ['-created_at']

    def __str__(self):
        return f"Ledger #{self.id} [{self.transaction_type}] {self.amount} (Balance: {self.balance_before} -> {self.balance_after})"
