from decimal import Decimal
from django.db import transaction, models
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger

def create_debt_service(
    company,
    customer,
    amount: Decimal,
    description: str,
    recorded_by,
    due_date=None,
    idempotency_key=None,
) -> DebtRecord:
    """
    Atomically issues a new customer debt ('Nasiya savdo') and updates the balance ledger.
    Wraps all operations in transaction.atomic() without relying on SQLite select_for_update().
    """
    if amount <= Decimal('0.00'):
        raise ValidationError({"amount": "Debt amount must be greater than zero."})

    # Check idempotency if key was provided
    if idempotency_key:
        existing = DebtRecord.objects.filter(
            company=company,
            idempotency_key=idempotency_key
        ).first()
        if existing:
            return existing

    with transaction.atomic():
        # Re-read fresh customer record inside atomic block
        current_customer = DebtCustomer.objects.get(id=customer.id, company=company)
        
        if current_customer.status != DebtCustomer.STATUS_ACTIVE:
            raise ValidationError({"customer": "Cannot issue debt to an inactive or frozen customer."})

        # Validate credit limit if defined
        if current_customer.credit_limit > Decimal('0.00'):
            new_potential_balance = current_customer.current_balance + amount
            if new_potential_balance > current_customer.credit_limit:
                raise ValidationError({
                    "credit_limit": (
                        f"Credit limit exceeded. Current balance: {current_customer.current_balance}, "
                        f"Limit: {current_customer.credit_limit}, Requested addition: {amount}."
                    )
                })

        balance_before = current_customer.current_balance
        balance_after = balance_before + amount

        debt = DebtRecord.objects.create(
            company=company,
            customer=current_customer,
            amount=amount,
            remaining_unpaid=amount,
            description=description,
            due_date=due_date,
            status=DebtRecord.STATUS_PENDING,
            idempotency_key=idempotency_key,
            recorded_by=recorded_by,
        )

        DebtLedger.objects.create(
            company=company,
            customer=current_customer,
            transaction_type=DebtLedger.TYPE_DEBT_ISSUED,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference_id=debt.id,
        )

        # Atomic balance update using F expression
        DebtCustomer.objects.filter(id=current_customer.id).update(
            current_balance=models.F('current_balance') + amount
        )

        debt.refresh_from_db()
        return debt

def record_repayment_service(
    company,
    customer,
    amount: Decimal,
    payment_method: str,
    recorded_by,
    idempotency_key,
    debt=None,
    notes: str = "",
) -> tuple[RepaymentRecord, bool]:
    """
    Atomically records a customer repayment, decrements customer debt balance,
    and updates the immutable ledger inside transaction.atomic().
    Returns (RepaymentRecord, created: bool).
    """
    if amount <= Decimal('0.00'):
        raise ValidationError({"amount": "Repayment amount must be greater than zero."})

    if not idempotency_key:
        raise ValidationError({"idempotency_key": "Idempotency-Key header is required for repayment operations."})

    # Check for idempotent replay
    existing = RepaymentRecord.objects.filter(
        company=company,
        idempotency_key=idempotency_key
    ).first()
    if existing:
        return existing, False

    with transaction.atomic():
        current_customer = DebtCustomer.objects.get(id=customer.id, company=company)

        if current_customer.current_balance <= Decimal('0.00'):
            raise ValidationError({"customer": "This customer has zero outstanding debt."})

        if amount > current_customer.current_balance:
            raise ValidationError({
                "amount": (
                    f"Repayment amount ({amount}) exceeds current total outstanding balance "
                    f"({current_customer.current_balance})."
                )
            })

        balance_before = current_customer.current_balance
        balance_after = balance_before - amount

        repayment = RepaymentRecord.objects.create(
            company=company,
            customer=current_customer,
            debt=debt,
            amount=amount,
            payment_method=payment_method,
            notes=notes,
            idempotency_key=idempotency_key,
            recorded_by=recorded_by,
        )

        # Settle specific debt or allocate against oldest unpaid debts
        if debt and debt.company_id == company.id:
            deduct = min(debt.remaining_unpaid, amount)
            debt.remaining_unpaid -= deduct
            debt.status = DebtRecord.STATUS_PAID if debt.remaining_unpaid == Decimal('0.00') else DebtRecord.STATUS_PARTIALLY_PAID
            debt.save(update_fields=['remaining_unpaid', 'status', 'updated_at'])
        else:
            unpaid_debts = DebtRecord.objects.filter(
                company=company,
                customer=current_customer,
                status__in=[DebtRecord.STATUS_PENDING, DebtRecord.STATUS_PARTIALLY_PAID, DebtRecord.STATUS_OVERDUE]
            ).order_by('created_at')

            rem = amount
            for d in unpaid_debts:
                if rem <= Decimal('0.00'):
                    break
                deduct = min(d.remaining_unpaid, rem)
                d.remaining_unpaid -= deduct
                rem -= deduct
                d.status = DebtRecord.STATUS_PAID if d.remaining_unpaid == Decimal('0.00') else DebtRecord.STATUS_PARTIALLY_PAID
                d.save(update_fields=['remaining_unpaid', 'status', 'updated_at'])

        # Write immutable audit ledger entry
        DebtLedger.objects.create(
            company=company,
            customer=current_customer,
            transaction_type=DebtLedger.TYPE_REPAYMENT_RECEIVED,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference_id=repayment.id,
        )

        # Atomic balance update using F expression
        DebtCustomer.objects.filter(id=current_customer.id).update(
            current_balance=models.F('current_balance') - amount
        )

        repayment.refresh_from_db()
        return repayment, True

def get_debt_summary_service(company) -> dict:
    """Computes real-time debt and collection summary metrics for the shop."""
    today = timezone.localdate()
    
    # Customer aggregates
    debtor_stats = DebtCustomer.objects.filter(company=company).aggregate(
        total_balance=models.Sum('current_balance'),
        active_debtors=models.Count('id', filter=models.Q(current_balance__gt=Decimal('0.00'))),
    )

    # Overdue stats
    overdue_stats = DebtRecord.objects.filter(
        company=company,
        due_date__lt=today,
        status__in=[DebtRecord.STATUS_PENDING, DebtRecord.STATUS_PARTIALLY_PAID, DebtRecord.STATUS_OVERDUE]
    ).aggregate(
        total_overdue=models.Sum('remaining_unpaid'),
        overdue_count=models.Count('customer', distinct=True)
    )

    # Today's collections
    today_repayments = RepaymentRecord.objects.filter(
        company=company,
        created_at__date=today
    )
    today_total = today_repayments.aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')

    method_breakdown = {
        'cash': today_repayments.filter(payment_method=RepaymentRecord.METHOD_CASH).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00'),
        'card': today_repayments.filter(payment_method=RepaymentRecord.METHOD_CARD).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00'),
        'bank_transfer': today_repayments.filter(payment_method=RepaymentRecord.METHOD_BANK_TRANSFER).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00'),
    }

    return {
        'total_outstanding_debt': str(debtor_stats['total_balance'] or Decimal('0.00')),
        'active_debtor_count': debtor_stats['active_debtors'] or 0,
        'total_overdue_debt': str(overdue_stats['total_overdue'] or Decimal('0.00')),
        'overdue_debtor_count': overdue_stats['overdue_count'] or 0,
        'today_collected_amount': str(today_total),
        'today_collections_by_method': {k: str(v) for k, v in method_breakdown.items()},
    }
