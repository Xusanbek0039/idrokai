from rest_framework import permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import CompanyMember

def get_or_set_company_member(request):
    """Retrieves or populates request.company_member for the current user and company."""
    if hasattr(request, 'company_member') and request.company_member is not None:
        return request.company_member

    company = getattr(request, 'company', None)
    if not company or not request.user or not request.user.is_authenticated:
        return None

    if getattr(request.user, 'is_platform_super_admin', False):
        return CompanyMember(
            company=company,
            user=request.user,
            role=CompanyMember.ROLE_PLATFORM_SUPER_ADMIN,
            is_active=True
        )

    member = CompanyMember.objects.filter(
        company=company,
        user=request.user,
        is_active=True
    ).first()
    request.company_member = member
    return member

class HasShopAccess(permissions.BasePermission):
    """
    Verifies that the user has an active membership in the selected shop.
    Returns 404 if the shop is inaccessible or membership does not exist,
    preventing cross-company tenant probing.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(request.user, 'is_platform_super_admin', False):
            return True

        member = get_or_set_company_member(request)
        if not member:
            raise NotFound("Shop not found.")
        return member.is_active

class IsShopOwner(permissions.BasePermission):
    """Requires Shop Owner role or Platform Super Admin."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'is_platform_super_admin', False):
            return True
        member = get_or_set_company_member(request)
        if not member:
            raise NotFound("Shop not found.")
        return member.is_active and member.role in [
            CompanyMember.ROLE_SHOP_OWNER,
            CompanyMember.ROLE_PLATFORM_SUPER_ADMIN,
        ]

class IsShopManager(permissions.BasePermission):
    """Requires Shop Manager, Shop Owner, or Platform Super Admin."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'is_platform_super_admin', False):
            return True
        member = get_or_set_company_member(request)
        if not member:
            raise NotFound("Shop not found.")
        return member.is_active and member.role in [
            CompanyMember.ROLE_SHOP_OWNER,
            CompanyMember.ROLE_SHOP_MANAGER,
            CompanyMember.ROLE_PLATFORM_SUPER_ADMIN,
        ]

class IsCashier(permissions.BasePermission):
    """Requires Cashier, Shop Manager, Shop Owner, or Platform Super Admin."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'is_platform_super_admin', False):
            return True
        member = get_or_set_company_member(request)
        if not member:
            raise NotFound("Shop not found.")
        return member.is_active and member.role in [
            CompanyMember.ROLE_SHOP_OWNER,
            CompanyMember.ROLE_SHOP_MANAGER,
            CompanyMember.ROLE_CASHIER,
            CompanyMember.ROLE_PLATFORM_SUPER_ADMIN,
        ]
