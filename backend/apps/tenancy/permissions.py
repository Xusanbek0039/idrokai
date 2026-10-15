from rest_framework import permissions
from .models import CompanyMember

class HasShopAccess(permissions.BasePermission):
    """Verifies that the user has an active membership in the selected shop or is a platform super admin."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'is_platform_super_admin', False):
            return True
        return hasattr(request, 'company_member') and request.company_member is not None and request.company_member.is_active

class IsShopOwner(permissions.BasePermission):
    """Requires Shop Owner role or Platform Super Admin."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'is_platform_super_admin', False):
            return True
        member = getattr(request, 'company_member', None)
        return member is not None and member.is_active and member.role in [
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
        member = getattr(request, 'company_member', None)
        return member is not None and member.is_active and member.role in [
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
        member = getattr(request, 'company_member', None)
        return member is not None and member.is_active and member.role in [
            CompanyMember.ROLE_SHOP_OWNER,
            CompanyMember.ROLE_SHOP_MANAGER,
            CompanyMember.ROLE_CASHIER,
            CompanyMember.ROLE_PLATFORM_SUPER_ADMIN,
        ]
