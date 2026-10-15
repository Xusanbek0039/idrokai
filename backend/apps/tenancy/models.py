import uuid
from django.db import models
from django.conf import settings
from apps.common.models import UUIDModel, TimeStampedModel

class BusinessType(UUIDModel, TimeStampedModel):
    """Represents an industry vertical template (e.g. Retail Store, Education Center)."""
    code = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = 'Business Type'
        verbose_name_plural = 'Business Types'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class Module(UUIDModel, TimeStampedModel):
    """System-wide registry of available feature modules with dependency resolution."""
    code = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=64, default='core', db_index=True)
    depends_on = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dependent_modules',
        help_text='Prerequisite module that must be active before this module can be enabled.'
    )
    is_system = models.BooleanField(
        default=False,
        help_text='System modules cannot be disabled by tenants.'
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = 'System Module'
        verbose_name_plural = 'System Modules'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} [{self.code}]"

class BusinessTypeModule(UUIDModel, TimeStampedModel):
    """Maps default and mandatory modules to a business vertical."""
    business_type = models.ForeignKey(
        BusinessType,
        on_delete=models.CASCADE,
        related_name='module_mappings'
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='business_type_mappings'
    )
    is_default = models.BooleanField(
        default=True,
        help_text='Automatically enabled upon organization creation.'
    )
    is_mandatory = models.BooleanField(
        default=False,
        help_text='Cannot be disabled for this business type.'
    )

    class Meta:
        verbose_name = 'Business Type Module Mapping'
        verbose_name_plural = 'Business Type Module Mappings'
        constraints = [
            models.UniqueConstraint(
                fields=['business_type', 'module'],
                name='unique_business_type_module'
            )
        ]

    def __str__(self):
        return f"{self.business_type.name} -> {self.module.name} (Default: {self.is_default})"

class Company(UUIDModel, TimeStampedModel):
    """Represents an independent business organization (Tenant)."""
    STATUS_ACTIVE = 'active'
    STATUS_SUSPENDED = 'suspended'
    STATUS_PENDING = 'pending_verification'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Faol (Active)'),
        (STATUS_SUSPENDED, 'Toxtatilgan (Suspended)'),
        (STATUS_PENDING, 'Kutilmoqda (Pending)'),
    ]

    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=128, blank=True)
    business_type = models.ForeignKey(
        BusinessType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='organizations'
    )
    phone = models.CharField(max_length=32, blank=True)
    address = models.CharField(max_length=512, blank=True)
    currency = models.CharField(max_length=10, default='UZS')
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Tashkilot / Do\'kon (Organization)'
        verbose_name_plural = 'Tashkilotlar / Do\'konlar (Organizations)'
        ordering = ['name']

    def __str__(self):
        type_str = f" [{self.business_type.name}]" if self.business_type else ""
        return f"{self.name}{type_str} ({self.get_status_display()})"

    def has_module(self, module_code: str) -> bool:
        """Helper to quickly check if a module is currently active for this organization."""
        return self.module_entitlements.filter(module__code=module_code, is_enabled=True).exists()

# Canonical alias
Organization = Company

class OrganizationModule(UUIDModel, TimeStampedModel):
    """Tracks active feature module entitlements per tenant organization."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='module_entitlements',
        db_index=True
    )
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='organization_entitlements',
        db_index=True
    )
    is_enabled = models.BooleanField(default=True, db_index=True)
    config = models.JSONField(default=dict, blank=True)
    activated_at = models.DateTimeField(auto_now_add=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Organization Module Entitlement'
        verbose_name_plural = 'Organization Module Entitlements'
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'module'],
                name='unique_organization_module'
            )
        ]

    def __str__(self):
        state = "YOQILGAN" if self.is_enabled else "OCHIRILGAN"
        return f"{self.company.name} -> {self.module.name} ({state})"

class CompanyMember(UUIDModel, TimeStampedModel):
    """Associates a User with an Organization with explicit RBAC role."""
    ROLE_PLATFORM_SUPER_ADMIN = 'platform_super_admin'
    ROLE_SHOP_OWNER = 'shop_owner'
    ROLE_SHOP_MANAGER = 'shop_manager'
    ROLE_CASHIER = 'cashier'
    ROLE_TEACHER = 'teacher'
    ROLE_ACCOUNTANT = 'accountant'

    ROLE_CHOICES = [
        (ROLE_PLATFORM_SUPER_ADMIN, 'Platform Super Admin'),
        (ROLE_SHOP_OWNER, 'Do\'kon / Tashkilot Egasi (Owner)'),
        (ROLE_SHOP_MANAGER, 'Menejer (Manager)'),
        (ROLE_CASHIER, 'Kassir (Cashier)'),
        (ROLE_TEACHER, 'O\'qituvchi (Teacher)'),
        (ROLE_ACCOUNTANT, 'Hisobchi (Accountant)'),
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
        verbose_name = 'Hodim / A\'zo (Member)'
        verbose_name_plural = 'Hodimlar / A\'zolar (Members)'
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'user'],
                name='unique_company_user_membership'
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.company.name} ({self.get_role_display()})"

# Canonical alias
Membership = CompanyMember
