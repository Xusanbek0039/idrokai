from django.urls import path
from .views import (
    CompanyListCreateView,
    CompanyDetailView,
    CompanyMemberListCreateView,
)

app_name = 'tenancy'

urlpatterns = [
    path('companies', CompanyListCreateView.as_view(), name='company-list-create'),
    path('companies/<uuid:company_id>', CompanyDetailView.as_view(), name='company-detail'),
    path('companies/<uuid:company_id>/members', CompanyMemberListCreateView.as_view(), name='company-members'),
    path('companies/<uuid:company_id>/members/invite', CompanyMemberListCreateView.as_view(), name='company-members-invite'),
]
