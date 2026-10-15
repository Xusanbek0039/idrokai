import uuid
from decimal import Decimal
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError

from apps.identity.models import User
from apps.tenancy.models import Company, CompanyMember
from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger
from apps.debts.services import create_debt_service, record_repayment_service

from .serializers import (
    MarketLoginSerializer,
    MarketCustomerSerializer,
    MarketCreateCustomerSerializer,
    MarketUpdateCustomerSerializer,
    MarketAddDebtSerializer,
    MarketRepaymentSerializer,
    MarketCustomerLedgerSerializer,
)

def get_market_shop(request):
    """
    Magazinchi so'rovi uchun unga tegishli do'konni (Company) aniqlash.
    Agar URL yoki headerda company_id berilgan bo'lsa tekshiradi,
    aks holda magazinchi a'zo bo'lgan birinchi faol do'konni oladi.
    """
    if hasattr(request, 'company') and request.company:
        return request.company

    if not request.user or not request.user.is_authenticated:
        raise PermissionDenied("Tizimga kirmagansiz.")

    # Platform super admin bo'lsa
    if getattr(request.user, 'is_platform_super_admin', False):
        company_id_header = request.headers.get('X-Company-ID') or request.query_params.get('company_id')
        if company_id_header:
            company = Company.objects.filter(id=company_id_header, is_active=True).first()
            if company:
                request.company = company
                return company
        company = Company.objects.filter(business_type__code='retail_store', is_active=True).first() or Company.objects.filter(is_active=True).first()
        if company:
            request.company = company
            return company
        raise NotFound("Faol do'kon topilmadi.")

    # Magazinchi a'zoligini topish
    memberships = CompanyMember.objects.filter(
        user=request.user,
        is_active=True,
        role__in=[
            CompanyMember.ROLE_SHOP_OWNER,
            CompanyMember.ROLE_SHOP_MANAGER,
            CompanyMember.ROLE_CASHIER,
        ]
    ).select_related('company')

    company_id_header = request.headers.get('X-Company-ID') or request.query_params.get('company_id')
    if company_id_header:
        member = memberships.filter(company_id=company_id_header).first()
    else:
        member = memberships.first()

    if not member or not member.company.is_active:
        raise PermissionDenied("Sizga tegishli faol do'kon (market) topilmadi.")

    request.company = member.company
    request.company_member = member
    return member.company


class MarketLoginView(APIView):
    """
    Magazinchi uchun tizimga kirish (Login).
    Telefon raqami yoki email va parol orqali kiriladi.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MarketLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        login_input = serializer.validated_data['login'].strip()
        password = serializer.validated_data['password']

        # Userni aniqlash (email yoki telefon raqami bo'yicha)
        user = None
        if '@' in login_input:
            user = User.objects.filter(email__iexact=login_input).first()
        else:
            # Telefon raqam orqali
            clean_digits = ''.join(ch for ch in login_input if ch.isdigit())
            user = (
                User.objects.filter(phone_number=login_input).first() or
                User.objects.filter(phone_number__endswith=clean_digits[-9:] if len(clean_digits) >= 9 else clean_digits).first()
            )

        if not user:
            # Agar email orqali username bo'lsa
            user = User.objects.filter(email__iexact=login_input).first()

        if not user:
            return Response(
                {"detail": "Telefon raqami, email yoki parol noto'g'ri."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Autentifikatsiya qilish
        auth_user = authenticate(request, username=user.email, password=password)
        if not auth_user:
            return Response(
                {"detail": "Telefon raqami, email yoki parol noto'g'ri."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not auth_user.is_active:
            return Response(
                {"detail": "Ushbu profil faol emas."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Magazinchi rolini tekshirish
        is_admin = getattr(auth_user, 'is_platform_super_admin', False)
        membership = CompanyMember.objects.filter(
            user=auth_user,
            is_active=True,
            role__in=[
                CompanyMember.ROLE_SHOP_OWNER,
                CompanyMember.ROLE_SHOP_MANAGER,
                CompanyMember.ROLE_CASHIER,
            ]
        ).select_related('company').first()

        if not membership and not is_admin:
            return Response(
                {"detail": "Sizda do'kon boshqarish huquqi (magazinchi roli) mavjud emas."},
                status=status.HTTP_403_FORBIDDEN
            )

        shop = membership.company if membership else Company.objects.filter(is_active=True).first()

        # Sessiyaga kiritish
        login(request, auth_user)

        return Response({
            "detail": "Do'kon tizimiga muvaffaqiyatli kirildi.",
            "user": {
                "id": str(auth_user.id),
                "full_name": auth_user.full_name or auth_user.email,
                "phone_number": auth_user.phone_number,
                "email": auth_user.email,
                "role": membership.role if membership else 'platform_super_admin',
                "role_display": membership.get_role_display() if membership else 'Platform Administrator',
            },
            "shop": {
                "id": str(shop.id) if shop else None,
                "name": shop.name if shop else None,
                "currency": shop.currency if shop else "UZS",
                "status": shop.status if shop else "active",
            }
        }, status=status.HTTP_200_OK)


class MarketLogoutView(APIView):
    """Magazinchi sessiyasini yakunlash."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Tizimdan muvaffaqiyatli chiqildi."}, status=status.HTTP_200_OK)


class MarketMeView(APIView):
    """Hozir tizimga kirgan magazinchi va uning do'koni haqida ma'lumot."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shop = get_market_shop(request)
        member = getattr(request, 'company_member', None)

        return Response({
            "user": {
                "id": str(request.user.id),
                "full_name": request.user.full_name or request.user.email,
                "phone_number": request.user.phone_number,
                "email": request.user.email,
                "role": member.role if member else "shop_owner",
                "role_display": member.get_role_display() if member else "Do'kon egasi",
            },
            "shop": {
                "id": str(shop.id),
                "name": shop.name,
                "phone": shop.phone,
                "address": shop.address,
                "currency": shop.currency,
                "status": shop.status,
            }
        })


class MarketCustomerListCreateView(APIView):
    """
    Do'kon mijozlari ro'yxatini olish va yangi mijoz kiritish.
    Kiritish tartibi: ism, familiya, telefon raqam, manzil va qarz summasi.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shop = get_market_shop(request)
        customers = DebtCustomer.objects.filter(company=shop).exclude(status=DebtCustomer.STATUS_ARCHIVED)

        # Qidiruv (ism, familiya, telefon)
        search = request.query_params.get('search')
        if search:
            customers = customers.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(full_name__icontains=search) |
                Q(phone_number__icontains=search)
            )

        # Qarzi bor/yo'qligi bo'yicha filter
        has_debt = request.query_params.get('has_debt')
        if has_debt is not None:
            if has_debt.lower() in ['true', '1']:
                customers = customers.filter(current_balance__gt=Decimal('0.00'))
            elif has_debt.lower() in ['false', '0']:
                customers = customers.filter(current_balance=Decimal('0.00'))

        # Umumiy qarz summasi statistikasi
        total_debt = customers.aggregate(total=Sum('current_balance'))['total'] or Decimal('0.00')

        serializer = MarketCustomerSerializer(customers, many=True)
        return Response({
            "count": customers.count(),
            "total_debt": str(total_debt),
            "results": serializer.data
        })

    def post(self, request):
        shop = get_market_shop(request)
        serializer = MarketCreateCustomerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        first_name = data['first_name']
        last_name = data['last_name']
        phone_number = data['phone_number']
        address = data.get('address', '')
        initial_debt = data.get('resolved_initial_debt', Decimal('0.00'))
        credit_limit = data.get('credit_limit', Decimal('0.00'))
        notes = data.get('notes', '')

        # Ushbu do'konda ayni telefon raqamli mijoz borligini tekshirish
        existing = DebtCustomer.objects.filter(
            company=shop,
            phone_number=phone_number
        ).exclude(status=DebtCustomer.STATUS_ARCHIVED).first()

        if existing:
            return Response(
                {
                    "detail": f"Ushbu telefon raqamli mijoz ({existing.full_name}) bu do'konda allaqachon mavjud.",
                    "existing_customer_id": str(existing.id)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Atomik tarzda mijoz va uning boshlang'ich qarzini (agar bor bo'lsa) saqlash
        with transaction.atomic():
            customer = DebtCustomer.objects.create(
                company=shop,
                first_name=first_name,
                last_name=last_name,
                full_name=f"{first_name} {last_name}".strip(),
                phone_number=phone_number,
                address=address,
                credit_limit=credit_limit,
                current_balance=Decimal('0.00'),
                notes=notes,
                status=DebtCustomer.STATUS_ACTIVE
            )

            # Agar boshlang'ich qarz summasi kiritilgan bo'lsa, avtomatik birinchi qarz hujjati va daftarga yozish
            if initial_debt > Decimal('0.00'):
                debt_record = DebtRecord.objects.create(
                    company=shop,
                    customer=customer,
                    amount=initial_debt,
                    remaining_unpaid=initial_debt,
                    description="Boshlang'ich qarz balansi (Mijoz ochilgandagi hisob)",
                    status=DebtRecord.STATUS_PENDING,
                    recorded_by=request.user,
                    idempotency_key=uuid.uuid4()
                )

                customer.current_balance = initial_debt
                customer.save(update_fields=['current_balance'])

                DebtLedger.objects.create(
                    company=shop,
                    customer=customer,
                    transaction_type=DebtLedger.TYPE_DEBT_ISSUED,
                    amount=initial_debt,
                    balance_before=Decimal('0.00'),
                    balance_after=initial_debt,
                    reference_id=debt_record.id
                )

        return Response(
            MarketCustomerSerializer(customer).data,
            status=status.HTTP_201_CREATED
        )


class MarketCustomerDetailView(APIView):
    """Mijoz profilini ko'rish, tahrirlash va arxivlash."""
    permission_classes = [IsAuthenticated]

    def get_customer(self, request, customer_id):
        shop = get_market_shop(request)
        try:
            return DebtCustomer.objects.get(id=customer_id, company=shop)
        except DebtCustomer.DoesNotExist:
            raise NotFound("Mijoz topilmadi.")

    def get(self, request, customer_id):
        customer = self.get_customer(request, customer_id)
        return Response(MarketCustomerSerializer(customer).data)

    def patch(self, request, customer_id):
        customer = self.get_customer(request, customer_id)
        serializer = MarketUpdateCustomerSerializer(customer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MarketCustomerSerializer(customer).data)

    def put(self, request, customer_id):
        return self.patch(request, customer_id)

    def delete(self, request, customer_id):
        customer = self.get_customer(request, customer_id)
        customer.status = DebtCustomer.STATUS_ARCHIVED
        customer.save(update_fields=['status'])
        return Response({"detail": "Mijoz muvaffaqiyatli arxivlandi."}, status=status.HTTP_200_OK)


class MarketAddDebtView(APIView):
    """
    Mijozga qo'shimcha nasiya/qarz yozish.
    Atomik tarzda qarz summasini oshiradi va o'zgarmas audit daftari (ledger) ga yozadi.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, customer_id):
        shop = get_market_shop(request)
        try:
            customer = DebtCustomer.objects.get(id=customer_id, company=shop)
        except DebtCustomer.DoesNotExist:
            raise NotFound("Mijoz topilmadi.")

        serializer = MarketAddDebtSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', "Do'kondan nasiya xarid")
        due_date = serializer.validated_data.get('due_date')
        idempotency_key = uuid.uuid4()

        debt = create_debt_service(
            company=shop,
            customer=customer,
            amount=amount,
            description=description,
            recorded_by=request.user,
            due_date=due_date,
            idempotency_key=idempotency_key
        )

        customer.refresh_from_db()
        return Response({
            "detail": f"Mijozga {amount} {shop.currency} miqdorida qarz muvaffaqiyatli qo'shildi.",
            "debt_id": str(debt.id),
            "customer": MarketCustomerSerializer(customer).data
        }, status=status.HTTP_201_CREATED)


class MarketPayDebtView(APIView):
    """
    Mijoz tomonidan qarz to'langanda qayd qilish.
    Atomik tarzda qarz summasini kamaytiradi va audit daftariga yozadi.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, customer_id):
        shop = get_market_shop(request)
        try:
            customer = DebtCustomer.objects.get(id=customer_id, company=shop)
        except DebtCustomer.DoesNotExist:
            raise NotFound("Mijoz topilmadi.")

        serializer = MarketRepaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data.get('payment_method', RepaymentRecord.METHOD_CASH)
        notes = serializer.validated_data.get('notes', '')
        idempotency_key = uuid.uuid4()

        repayment = record_repayment_service(
            company=shop,
            customer=customer,
            amount=amount,
            payment_method=payment_method,
            notes=notes,
            recorded_by=request.user,
            idempotency_key=idempotency_key
        )

        customer.refresh_from_db()
        return Response({
            "detail": f"{amount} {shop.currency} miqdoridagi to'lov muvaffaqiyatli qabul qilindi.",
            "repayment_id": str(repayment.id),
            "customer": MarketCustomerSerializer(customer).data
        }, status=status.HTTP_200_OK)


class MarketCustomerLedgerView(APIView):
    """Mijozning to'liq qarz va to'lovlar daftari tarixi."""
    permission_classes = [IsAuthenticated]

    def get(self, request, customer_id):
        shop = get_market_shop(request)
        try:
            customer = DebtCustomer.objects.get(id=customer_id, company=shop)
        except DebtCustomer.DoesNotExist:
            raise NotFound("Mijoz topilmadi.")

        entries = DebtLedger.objects.filter(
            company=shop,
            customer=customer
        ).order_by('-created_at')

        serializer = MarketCustomerLedgerSerializer(entries, many=True)
        return Response({
            "customer": {
                "id": str(customer.id),
                "full_name": customer.full_name,
                "phone_number": customer.phone_number,
                "current_balance": str(customer.current_balance),
            },
            "count": entries.count(),
            "results": serializer.data
        })


class MarketSummaryView(APIView):
    """Do'konning umumiy moliyaviy va mijozlar holati (Dashboard)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shop = get_market_shop(request)
        customers = DebtCustomer.objects.filter(company=shop).exclude(status=DebtCustomer.STATUS_ARCHIVED)

        total_customers = customers.count()
        customers_with_debt = customers.filter(current_balance__gt=Decimal('0.00')).count()
        total_debt_amount = customers.aggregate(total=Sum('current_balance'))['total'] or Decimal('0.00')

        # Bugungi to'lovlar
        today = timezone.localdate()
        today_repayments = RepaymentRecord.objects.filter(
            company=shop,
            created_at__date=today
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        return Response({
            "shop_name": shop.name,
            "currency": shop.currency,
            "total_customers": total_customers,
            "customers_with_debt": customers_with_debt,
            "total_debt_amount": str(total_debt_amount),
            "today_repayments": str(today_repayments),
        })
