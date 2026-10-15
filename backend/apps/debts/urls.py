from django.urls import path
from .views import (
    DebtCustomerListCreateView,
    DebtCustomerDetailView,
    DebtCustomerLedgerView,
    DebtListCreateView,
    DebtDetailView,
    RepaymentListCreateView,
    DebtSummaryReportView,
)

app_name = 'debts'

urlpatterns = [
    # Debt Customers
    path('companies/<uuid:company_id>/debt-customers', DebtCustomerListCreateView.as_view(), name='customer-list-create'),
    path('companies/<uuid:company_id>/debt-customers/<uuid:customer_id>', DebtCustomerDetailView.as_view(), name='customer-detail'),
    path('companies/<uuid:company_id>/debt-customers/<uuid:customer_id>/ledger', DebtCustomerLedgerView.as_view(), name='customer-ledger'),

    # Debts ("Nasiya")
    path('companies/<uuid:company_id>/debts', DebtListCreateView.as_view(), name='debt-list-create'),
    path('companies/<uuid:company_id>/debts/<uuid:debt_id>', DebtDetailView.as_view(), name='debt-detail'),

    # Repayments
    path('companies/<uuid:company_id>/repayments', RepaymentListCreateView.as_view(), name='repayment-list-create'),

    # Reports
    path('companies/<uuid:company_id>/reports/debt-summary', DebtSummaryReportView.as_view(), name='debt-summary'),
]
