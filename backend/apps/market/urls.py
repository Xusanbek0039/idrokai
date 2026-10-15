from django.urls import path
from .views import (
    MarketLoginView,
    MarketLogoutView,
    MarketMeView,
    MarketCustomerListCreateView,
    MarketCustomerDetailView,
    MarketAddDebtView,
    MarketPayDebtView,
    MarketCustomerLedgerView,
    MarketSummaryView,
)

app_name = 'market'

urlpatterns = [
    # 1. Magazinchi autentifikatsiyasi
    path('auth/login/', MarketLoginView.as_view(), name='login'),
    path('auth/logout/', MarketLogoutView.as_view(), name='logout'),
    path('auth/me/', MarketMeView.as_view(), name='me'),

    # 2. Mijozlarni kiritish va ko'rish (ism, familiya, telefon, manzil, qarz summasi)
    path('customers/', MarketCustomerListCreateView.as_view(), name='customer-list-create'),
    path('customers/<uuid:customer_id>/', MarketCustomerDetailView.as_view(), name='customer-detail'),

    # 3. Qarz va to'lov operatsiyalari
    path('customers/<uuid:customer_id>/add-debt/', MarketAddDebtView.as_view(), name='customer-add-debt'),
    path('customers/<uuid:customer_id>/pay-debt/', MarketPayDebtView.as_view(), name='customer-pay-debt'),
    path('customers/<uuid:customer_id>/ledger/', MarketCustomerLedgerView.as_view(), name='customer-ledger'),

    # 4. Do'kon xulosasi (Dashboard summary)
    path('summary/', MarketSummaryView.as_view(), name='summary'),
]
