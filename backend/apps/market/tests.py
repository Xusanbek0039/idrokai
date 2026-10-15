import uuid
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.identity.models import User
from apps.tenancy.models import Company, BusinessType, CompanyMember
from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger

class MarketAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Business Type
        self.retail_type = BusinessType.objects.create(
            code='retail_store',
            name='Chakana Savdo Do\'koni'
        )

        # Do'kon (Company)
        self.shop = Company.objects.create(
            name='Test Baraka Do\'koni',
            business_type=self.retail_type,
            currency='UZS',
            status='active'
        )

        # Magazinchi (Do'kon egasi)
        self.shopkeeper = User.objects.create_user(
            email='magazinchi@test.uz',
            password='Password123!',
            full_name='Sardor Sotuvchi',
            phone_number='+998901112233'
        )

        # Do'konga a'zo qilish
        self.membership = CompanyMember.objects.create(
            company=self.shop,
            user=self.shopkeeper,
            role=CompanyMember.ROLE_SHOP_OWNER,
            is_active=True
        )

    def test_market_login_with_phone_success(self):
        """Magazinchi telefon raqam orqali login qila olishi kerak."""
        response = self.client.post('/market/auth/login/', {
            'login': '+998901112233',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'magazinchi@test.uz')
        self.assertEqual(response.data['shop']['name'], 'Test Baraka Do\'koni')

    def test_market_login_with_email_success(self):
        """Magazinchi email orqali ham login qila olishi kerak."""
        response = self.client.post('/market/auth/login/', {
            'login': 'magazinchi@test.uz',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['id'], str(self.shopkeeper.id))

    def test_market_login_invalid_password(self):
        """Noto'g'ri parol kiritilganda 401 qaytarishi kerak."""
        response = self.client.post('/market/auth/login/', {
            'login': '+998901112233',
            'password': 'WrongPassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_customer_with_initial_debt(self):
        """
        Magazinchi mijozni kiritishi: ism, familiya, telefon raqam, manzil va qarz summasi.
        Qarz summasi avtomatik tarzda DebtRecord va DebtLedger ga yozilishi kerak.
        """
        self.client.force_authenticate(user=self.shopkeeper)

        payload = {
            'first_name': 'Botir',
            'last_name': 'Sobirov',
            'phone_number': '+998935556677',
            'address': 'Chilonzor 19-mavze, 5-uy',
            'qarz_summasi': '250000.00',
            'notes': 'Yaxshi tanish mijoz'
        }

        response = self.client.post('/market/customers/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data

        self.assertEqual(data['first_name'], 'Botir')
        self.assertEqual(data['last_name'], 'Sobirov')
        self.assertEqual(data['full_name'], 'Botir Sobirov')
        self.assertEqual(data['phone_number'], '+998935556677')
        self.assertEqual(data['address'], 'Chilonzor 19-mavze, 5-uy')
        self.assertEqual(Decimal(data['current_balance']), Decimal('250000.00'))

        # DB tekshiruvi: DebtCustomer, DebtRecord va DebtLedger
        customer = DebtCustomer.objects.get(id=data['id'])
        self.assertEqual(customer.current_balance, Decimal('250000.00'))
        self.assertEqual(customer.debts.count(), 1)
        self.assertEqual(customer.debts.first().amount, Decimal('250000.00'))

        # Ledger yozuvini tekshirish
        ledger_entries = DebtLedger.objects.filter(customer=customer)
        self.assertEqual(ledger_entries.count(), 1)
        self.assertEqual(ledger_entries.first().transaction_type, DebtLedger.TYPE_DEBT_ISSUED)
        self.assertEqual(ledger_entries.first().amount, Decimal('250000.00'))
        self.assertEqual(ledger_entries.first().balance_before, Decimal('0.00'))
        self.assertEqual(ledger_entries.first().balance_after, Decimal('250000.00'))

    def test_create_customer_without_initial_debt(self):
        """Qarzsiz mijoz kiritilganda balansi 0.00 bo'lishi kerak."""
        self.client.force_authenticate(user=self.shopkeeper)

        payload = {
            'first_name': 'Gulbahor',
            'last_name': 'Nazarova',
            'phone_number': '+998971239988',
            'address': 'Yunusobod 12-mavze',
        }

        response = self.client.post('/market/customers/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['current_balance']), Decimal('0.00'))

    def test_add_debt_and_pay_debt_flow(self):
        """Mijozga yangi qarz yozish va qarzni to'lash to'liq sikli."""
        self.client.force_authenticate(user=self.shopkeeper)

        # 1. Mijoz yaratish (100,000 UZS qarz bilan)
        create_res = self.client.post('/market/customers/', {
            'first_name': 'Sardor',
            'last_name': 'Olimov',
            'phone_number': '+998907778899',
            'qarz_summasi': '100000.00'
        })
        customer_id = create_res.data['id']

        # 2. Yangi qarz qo'shish (yana 50,000 UZS)
        add_res = self.client.post(f'/market/customers/{customer_id}/add-debt/', {
            'amount': '50000.00',
            'description': 'Moy va shakar nasiya olindi'
        })
        self.assertEqual(add_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(add_res.data['customer']['current_balance']), Decimal('150000.00'))

        # 3. Qarzni to'lash (70,000 UZS naqd to'landi)
        pay_res = self.client.post(f'/market/customers/{customer_id}/pay-debt/', {
            'amount': '70000.00',
            'payment_method': 'cash',
            'notes': 'Qisman to\'lov'
        })
        self.assertEqual(pay_res.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(pay_res.data['customer']['current_balance']), Decimal('80000.00'))

        # 4. Mijoz daftari (ledger) tekshiruvi (3 ta yozuv bo'lishi kerak)
        ledger_res = self.client.get(f'/market/customers/{customer_id}/ledger/')
        self.assertEqual(ledger_res.status_code, status.HTTP_200_OK)
        self.assertEqual(ledger_res.data['count'], 3)

    def test_market_summary_stats(self):
        """Do'konning umumiy statistikasi to'g'ri hisoblanishi kerak."""
        self.client.force_authenticate(user=self.shopkeeper)

        # 2 ta mijoz kiritamiz
        self.client.post('/market/customers/', {
            'first_name': 'Mijoz 1',
            'last_name': 'Familiya 1',
            'phone_number': '+998900000001',
            'qarz_summasi': '100000.00'
        })
        self.client.post('/market/customers/', {
            'first_name': 'Mijoz 2',
            'last_name': 'Familiya 2',
            'phone_number': '+998900000002',
            'qarz_summasi': '200000.00'
        })

        res = self.client.get('/market/summary/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['total_customers'], 2)
        self.assertEqual(res.data['customers_with_debt'], 2)
        self.assertEqual(Decimal(res.data['total_debt_amount']), Decimal('300000.00'))
