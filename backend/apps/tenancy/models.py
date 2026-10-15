import uuid
from django.db import models
from django.conf import settings
from apps.common.models import UUIDModel, TimeStampedModel

class Company(UUIDModel, TimeStampedModel):
    """Represents an independent shop or business organization (Tenant)."""
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=32, blank=True)
    address = models.CharField(max_length=512, blank=True)
    currency = models.CharField(max_length=10, default='UZS')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Shop / Company'
        verbose_name_plural = 'Shops / Companies'
        ordering = ['name']

    def __str__(self):
        return self.name

class CompanyMember(UUIDModel, TimeStampedModel):
    """Associates a User with a Company with explicit RBAC role."""
    ROLE_PLATFORM_SUPER_ADMIN = 'platform_super_admin'
    ROLE_SHOP_OWNER = 'shop_owner'
    ROLE_SHOP_MANAGER = 'shop_manager'
    ROLE_CASHIER = 'cashier'

    ROLE_CHOICES = [
        (ROLE_PLATFORM_SUPER_ADMIN, 'Platform Super Admin'),
        (ROLE_SHOP_OWNER, 'Shop Owner'),
        (ROLE_SHOP_MANAGER, 'Shop Manager'),
        (ROLE_CASHIER, 'Cashier'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='memberships',
        db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company_memberships',
        db_index=True
    )
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default=ROLE_CASHIER)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Shop Member'
        verbose_name_plural = 'Shop Members'
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'user'],
                name='unique_company_user_membership'
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.company.name} ({self.get_role_display()})"
