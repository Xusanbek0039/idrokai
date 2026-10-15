import re
from uuid import UUID
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .models import Company, CompanyMember

COMPANY_URL_PATTERN = re.compile(r'^/api/v1/companies/([0-9a-fA-F-]{36})(/.*)?$')

class TenantContextMiddleware(MiddlewareMixin):
    """
    Inspects incoming requests matching `/api/v1/companies/{company_id}/...`.
    Ensures company scope is strictly established from the URL path.
    Enforces that authenticated user belongs to the target company.
    Returns 404 for inaccessible or non-existent companies to prevent tenant probing.
    """
    def process_request(self, request):
        request.company = None
        request.company_member = None

        match = COMPANY_URL_PATTERN.match(request.path)
        if not match:
            return None

        company_id_str = match.group(1)
        try:
            company_id = UUID(company_id_str)
        except ValueError:
            return JsonResponse(
                {"code": "NOT_FOUND", "message": "Shop not found.", "details": {}, "request_id": ""},
                status=404
            )

        try:
            company = Company.objects.get(id=company_id, is_active=True)
        except Company.DoesNotExist:
            return JsonResponse(
                {"code": "NOT_FOUND", "message": "Shop not found.", "details": {}, "request_id": ""},
                status=404
            )

        # Allow unauthenticated pass-through so DRF permissions handle 401
        if not request.user or not request.user.is_authenticated:
            request.company = company
            return None

        # Check Platform Super Admin
        if getattr(request.user, 'is_platform_super_admin', False):
            request.company = company
            # Try to get existing membership or create a dummy representation
            member = CompanyMember.objects.filter(company=company, user=request.user).first()
            request.company_member = member
            return None

        # Check tenant membership
        try:
            member = CompanyMember.objects.get(
                company=company,
                user=request.user,
                is_active=True
            )
            request.company = company
            request.company_member = member
        except CompanyMember.DoesNotExist:
            return JsonResponse(
                {"code": "NOT_FOUND", "message": "Shop not found or access denied.", "details": {}, "request_id": ""},
                status=404
            )

        return None
