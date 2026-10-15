import uuid
from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.tenancy.permissions import HasShopAccess, IsShopManager, IsCashier
from .models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger
from .serializers import (
    DebtCustomerSerializer,
    CreateDebtCustomerSerializer,
    DebtRecordSerializer,
    CreateDebtSerializer,
    RepaymentRecordSerializer,
    CreateRepaymentSerializer,
    DebtLedgerEntrySerializer,
)
from .services import (
    create_debt_service,
    record_repayment_service,
    get_debt_summary_service,
)

class DebtCustomerListCreateView(APIView):
    """List or create debtor customer profiles in the shop."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsCashier]

    def get(self, request, company_id):
        customers = DebtCustomer.objects.filter(company=request.company)

        search = request.query_params.get('search')
        if search:
            customers = customers.filter(
                Q(full_name__icontains=search) | 
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search) | 
                Q(phone_number__icontains=search)
            )

        has_debt = request.query_params.get('has_debt')
        if has_debt is not None:
            if has_debt.lower() in ['true', '1']:
                customers = customers.filter(current_balance__gt=Decimal('0.00'))
            elif has_debt.lower() in ['false', '0']:
                customers = customers.filter(current_balance=Decimal('0.00'))

        serializer = DebtCustomerSerializer(customers, many=True)
        return Response({"count": customers.count(), "results": serializer.data})

    def post(self, request, company_id):
        if not IsShopManager().has_permission(request, self):
            return Response(
                {"detail": "Only a Shop Manager or Owner can create customer credit profiles."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = CreateDebtCustomerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        initial_debt = serializer.validated_data.pop('initial_debt', Decimal('0.00'))
        with transaction.atomic():
            customer = DebtCustomer.objects.create(
                company=request.company,
                **serializer.validated_data
            )
            if initial_debt and initial_debt > Decimal('0.00'):
                debt = DebtRecord.objects.create(
                    company=request.company,
                    customer=customer,
                    amount=initial_debt,
                    remaining_unpaid=initial_debt,
                    description="Boshlang'ich qarz balansi (Mijoz ochilgandagi qarz)",
                    status=DebtRecord.STATUS_PENDING,
                    recorded_by=request.user if request.user.is_authenticated else None
                )
                customer.current_balance = initial_debt
                customer.save(update_fields=['current_balance'])

                DebtLedger.objects.create(
                    company=request.company,
                    customer=customer,
                    transaction_type=DebtLedger.TYPE_DEBT_ISSUED,
                    amount=initial_debt,
                    balance_before=Decimal('0.00'),
                    balance_after=initial_debt,
                    reference_id=debt.id
                )

        return Response(DebtCustomerSerializer(customer).data, status=status.HTTP_201_CREATED)

class DebtCustomerDetailView(APIView):
    """Retrieve or update a customer credit profile."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsCashier]

    def get(self, request, company_id, customer_id):
        customer = get_object_or_404(DebtCustomer, id=customer_id, company=request.company)
        return Response(DebtCustomerSerializer(customer).data)

    def patch(self, request, company_id, customer_id):
        if not IsShopManager().has_permission(request, self):
            return Response(
                {"detail": "Only a Shop Manager or Owner can modify credit limits or customer status."},
                status=status.HTTP_403_FORBIDDEN
            )
        customer = get_object_or_404(DebtCustomer, id=customer_id, company=request.company)
        serializer = DebtCustomerSerializer(customer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class DebtCustomerLedgerView(APIView):
    """Retrieve complete chronological ledger trail for a customer."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsCashier]

    def get(self, request, company_id, customer_id):
        customer = get_object_or_404(DebtCustomer, id=customer_id, company=request.company)
        entries = DebtLedger.objects.filter(
            company=request.company,
            customer=customer
        ).order_by('-created_at')
        return Response(DebtLedgerEntrySerializer(entries, many=True).data)

class DebtListCreateView(APIView):
    """List or issue debts ('Nasiya savdo')."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsCashier]

    def get(self, request, company_id):
        debts = DebtRecord.objects.filter(company=request.company).select_related('customer', 'recorded_by')

        customer_id = request.query_params.get('customer_id')
        if customer_id:
            debts = debts.filter(customer_id=customer_id)

        status_filter = request.query_params.get('status')
        if status_filter:
            debts = debts.filter(status=status_filter)

        serializer = DebtRecordSerializer(debts, many=True)
        return Response({"count": debts.count(), "results": serializer.data})

    def post(self, request, company_id):
        serializer = CreateDebtSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        customer = get_object_or_404(
            DebtCustomer,
            id=serializer.validated_data['customer_id'],
            company=request.company
        )

        idempotency_key_header = request.headers.get('Idempotency-Key')
        idempotency_key = None
        if idempotency_key_header:
            try:
                idempotency_key = uuid.UUID(idempotency_key_header)
            except ValueError:
                return Response(
                    {"detail": "Idempotency-Key header must be a valid UUIDv4."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        debt = create_debt_service(
            company=request.company,
            customer=customer,
            amount=serializer.validated_data['amount'],
            description=serializer.validated_data['description'],
            recorded_by=request.user,
            due_date=serializer.validated_data.get('due_date'),
            idempotency_key=idempotency_key,
        )

        return Response(DebtRecordSerializer(debt).data, status=status.HTTP_201_CREATED)

class DebtDetailView(APIView):
    """Retrieve single debt details."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsCashier]

    def get(self, request, company_id, debt_id):
        debt = get_object_or_404(DebtRecord, id=debt_id, company=request.company)
        return Response(DebtRecordSerializer(debt).data)

class RepaymentListCreateView(APIView):
    """List or record customer repayments."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsCashier]

    def get(self, request, company_id):
        repayments = RepaymentRecord.objects.filter(
            company=request.company
        ).select_related('customer', 'recorded_by')

        customer_id = request.query_params.get('customer_id')
        if customer_id:
            repayments = repayments.filter(customer_id=customer_id)

        serializer = RepaymentRecordSerializer(repayments, many=True)
        return Response({"count": repayments.count(), "results": serializer.data})

    def post(self, request, company_id):
        idempotency_key_header = request.headers.get('Idempotency-Key')
        if not idempotency_key_header:
            return Response(
                {"detail": "Idempotency-Key header is required for repayment requests."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            idempotency_key = uuid.UUID(idempotency_key_header)
        except ValueError:
            return Response(
                {"detail": "Idempotency-Key header must be a valid UUIDv4."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CreateRepaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        customer = get_object_or_404(
            DebtCustomer,
            id=serializer.validated_data['customer_id'],
            company=request.company
        )

        debt = None
        debt_id = serializer.validated_data.get('debt_id')
        if debt_id:
            debt = get_object_or_404(DebtRecord, id=debt_id, company=request.company)

        repayment, created = record_repayment_service(
            company=request.company,
            customer=customer,
            amount=serializer.validated_data['amount'],
            payment_method=serializer.validated_data['payment_method'],
            recorded_by=request.user,
            idempotency_key=idempotency_key,
            debt=debt,
            notes=serializer.validated_data.get('notes', ''),
        )

        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(RepaymentRecordSerializer(repayment).data, status=status_code)

class DebtSummaryReportView(APIView):
    """Retrieve financial summary of debts and collections for the shop."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsShopManager]

    def get(self, request, company_id):
        summary = get_debt_summary_service(request.company)
        return Response(summary)
