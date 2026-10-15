import uuid
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError

from apps.identity.models import User
from apps.tenancy.models import Company, CompanyMember
from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger
from apps.debts.services import create_debt_service, record_repayment_service

class ShopDebtManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Shop 1 (Company A)
        self.shop1 = Company.objects.create(name="Chilonzor Oziq-Ovqat", currency="UZS")
        self.owner1 = User.objects.create_user(email="owner1@idrok.uz", password="Password123!", full_name="Shop Owner 1")
        CompanyMember.objects.create(company=self.shop1, user=self.owner1, role=CompanyMember.ROLE_SHOP_OWNER)

        self.manager1 = User.objects.create_user(email="manager1@idrok.uz", password="Password123!", full_name="Manager 1")
        CompanyMember.objects.create(company=self.shop1, user=self.manager1, role=CompanyMember.ROLE_SHOP_MANAGER)

        self.cashier1 = User.objects.create_user(email="cashier1@idrok.uz", password="Password123!", full_name="Cashier 1")
        CompanyMember.objects.create(company=self.shop1, user=self.cashier1, role=CompanyMember.ROLE_CASHIER)

        # Create Shop 2 (Company B for isolation tests)
        self.shop2 = Company.objects.create(name="Yunusobod Market", currency="UZS")
        self.owner2 = User.objects.create_user(email="owner2@idrok.uz", password="Password123!", full_name="Shop Owner 2")
        CompanyMember.objects.create(company=self.shop2, user=self.owner2, role=CompanyMember.ROLE_SHOP_OWNER)

        # Create Customer in Shop 1
        self.customer1 = DebtCustomer.objects.create(
            company=self.shop1,
            full_name="Akmal Rahimov",
            phone_number="+998901112233",
            credit_limit=Decimal('500000.00'),
            current_balance=Decimal('0.00'),
        )

    def test_debt_issuance_service_and_ledger(self):
        """Test atomic debt issuance, customer balance update, and ledger creation."""
        debt = create_debt_service(
            company=self.shop1,
            customer=self.customer1,
            amount=Decimal('150000.50'),
            description="Flour 50kg, Sunflower Oil 5L",
            recorded_by=self.cashier1,
        )

        self.customer1.refresh_from_db()
        self.assertEqual(self.customer1.current_balance, Decimal('150000.50'))
        self.assertEqual(debt.amount, Decimal('150000.50'))
        self.assertEqual(debt.remaining_unpaid, Decimal('150000.50'))
        self.assertEqual(debt.status, DebtRecord.STATUS_PENDING)

        # Verify ledger
        ledger = DebtLedger.objects.filter(customer=self.customer1).first()
        self.assertIsNotNone(ledger)
        self.assertEqual(ledger.transaction_type, DebtLedger.TYPE_DEBT_ISSUED)
        self.assertEqual(ledger.balance_before, Decimal('0.00'))
        self.assertEqual(ledger.balance_after, Decimal('150000.50'))

    def test_credit_limit_validation(self):
        """Test that issuing debt beyond credit limit raises ValidationError."""
        # Customer limit is 500,000.00. Attempt to issue 600,000.00
        with self.assertRaises(ValidationError):
            create_debt_service(
                company=self.shop1,
                customer=self.customer1,
                amount=Decimal('600000.00'),
                description="Excessive credit purchase",
                recorded_by=self.cashier1,
            )

        # Customer balance should remain 0.00
        self.customer1.refresh_from_db()
        self.assertEqual(self.customer1.current_balance, Decimal('0.00'))

    def test_repayment_service_and_idempotency(self):
        """Test repayment, debt settlement, and idempotent replay without double-crediting."""
        debt = create_debt_service(
            company=self.shop1,
            customer=self.customer1,
            amount=Decimal('200000.00'),
            description="Groceries",
            recorded_by=self.cashier1,
        )

        idempotency_key = uuid.uuid4()

        # First repayment attempt: 50,000.00
        repayment, created = record_repayment_service(
            company=self.shop1,
            customer=self.customer1,
            amount=Decimal('50000.00'),
            payment_method='cash',
            recorded_by=self.cashier1,
            idempotency_key=idempotency_key,
        )

        self.assertTrue(created)
        self.customer1.refresh_from_db()
        debt.refresh_from_db()
        self.assertEqual(self.customer1.current_balance, Decimal('150000.00'))
        self.assertEqual(debt.remaining_unpaid, Decimal('150000.00'))
        self.assertEqual(debt.status, DebtRecord.STATUS_PARTIALLY_PAID)

        # Second repayment attempt with EXACT SAME idempotency_key (simulating network retry)
        repayment2, created2 = record_repayment_service(
            company=self.shop1,
            customer=self.customer1,
            amount=Decimal('50000.00'),
            payment_method='cash',
            recorded_by=self.cashier1,
            idempotency_key=idempotency_key,
        )

        self.assertFalse(created2) # Indicates idempotent replay
        self.assertEqual(repayment.id, repayment2.id)

        # Customer balance MUST still be 150000.00, NOT double-debited to 100000.00
        self.customer1.refresh_from_db()
        self.assertEqual(self.customer1.current_balance, Decimal('150000.00'))

    def test_api_cashier_debt_and_repayment_endpoints(self):
        """Test API endpoints with Cashier authentication."""
        self.client.force_authenticate(user=self.cashier1)

        # Create debt via API
        idemp_debt = str(uuid.uuid4())
        response = self.client.post(
            f"/api/v1/companies/{self.shop1.id}/debts",
            data={
                "customer_id": str(self.customer1.id),
                "amount": "100000.00",
                "description": "Vegetables and meat",
            },
            HTTP_IDEMPOTENCY_KEY=idemp_debt,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], "100000.00")

        # Record repayment via API
        idemp_repay = str(uuid.uuid4())
        rep_response = self.client.post(
            f"/api/v1/companies/{self.shop1.id}/repayments",
            data={
                "customer_id": str(self.customer1.id),
                "amount": "40000.00",
                "payment_method": "cash",
                "notes": "Morning cashier shift",
            },
            HTTP_IDEMPOTENCY_KEY=idemp_repay,
            format='json'
        )
        self.assertEqual(rep_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(rep_response.data['amount'], "40000.00")

        # Verify customer ledger endpoint
        ledger_response = self.client.get(
            f"/api/v1/companies/{self.shop1.id}/debt-customers/{self.customer1.id}/ledger"
        )
        self.assertEqual(ledger_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(ledger_response.data), 2)

    def test_multi_tenant_isolation(self):
        """Verify Cashier in Shop 1 CANNOT see or access Shop 2 data (returns 404)."""
        self.client.force_authenticate(user=self.cashier1)

        # Attempt to access Shop 2
        response = self.client.get(f"/api/v1/companies/{self.shop2.id}/debt-customers")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Attempt to create debt in Shop 2
        response = self.client.post(
            f"/api/v1/companies/{self.shop2.id}/debts",
            data={
                "customer_id": str(self.customer1.id),
                "amount": "50000.00",
                "description": "Cross-tenant intrusion attempt",
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_role_based_access_control(self):
        """Cashier cannot adjust credit limits; Shop Manager can."""
        # Cashier attempt to PATCH customer credit limit
        self.client.force_authenticate(user=self.cashier1)
        response = self.client.patch(
            f"/api/v1/companies/{self.shop1.id}/debt-customers/{self.customer1.id}",
            data={"credit_limit": "1000000.00"},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Shop Manager attempt to PATCH customer credit limit
        self.client.force_authenticate(user=self.manager1)
        response = self.client.patch(
            f"/api/v1/companies/{self.shop1.id}/debt-customers/{self.customer1.id}",
            data={"credit_limit": "1000000.00"},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['credit_limit'], "1000000.00")
