from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import BusinessType, Module, BusinessTypeModule, Company, OrganizationModule, CompanyMember
from apps.operations.models import AuditEvent

class BusinessTypeModuleInline(admin.TabularInline):
    model = BusinessTypeModule
    extra = 1
    autocomplete_fields = ['module']

@admin.register(BusinessType)
class BusinessTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'organizations_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code']
    inlines = [BusinessTypeModuleInline]

    def organizations_count(self, obj):
        return obj.organizations.count()
    organizations_count.short_description = "Tashkilotlar soni"

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'depends_on', 'is_system_badge', 'is_active_badge']
    list_filter = ['category', 'is_system', 'is_active']
    search_fields = ['name', 'code', 'description']
    autocomplete_fields = ['depends_on']

    def is_system_badge(self, obj):
        if obj.is_system:
            return format_html('<span style="color: #b91c1c; font-weight: bold;">Tizim (Asosiy)</span>')
        return format_html('<span style="color: #6b7280;">Ixtiyoriy</span>')
    is_system_badge.short_description = "Turi"

    def is_active_badge(self, obj):
        color = "#15803d" if obj.is_active else "#9ca3af"
        label = "Faol" if obj.is_active else "Nofaol"
        return format_html(f'<span style="color: {color}; font-weight: bold;">{label}</span>')
    is_active_badge.short_description = "Holat"

class OrganizationModuleInline(admin.TabularInline):
    model = OrganizationModule
    extra = 0
    autocomplete_fields = ['module']
    fields = ['module', 'is_enabled', 'activated_at', 'deactivated_at']
    readonly_fields = ['activated_at']

class CompanyMemberInline(admin.TabularInline):
    model = CompanyMember
    extra = 0
    autocomplete_fields = ['user']
    fields = ['user', 'role', 'is_active', 'created_at']
    readonly_fields = ['created_at']

@admin.register(Company)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'business_type_display',
        'status_badge',
        'owner_display',
        'active_modules_count',
        'active_members_count',
        'currency',
        'created_at',
    ]
    list_filter = ['status', 'business_type', 'currency', 'created_at']
    search_fields = ['name', 'slug', 'phone', 'address']
    inlines = [OrganizationModuleInline, CompanyMemberInline]
    actions = ['suspend_organizations', 'reactivate_organizations', 'sync_default_modules']

    readonly_fields = [
        'owner_display',
        'enabled_modules_display',
        'disabled_modules_display',
        'usage_summary_display',
        'audit_history_display',
        'created_at',
        'updated_at',
    ]

    fieldsets = (
        ('Tashkilot Profili', {
            'fields': (
                'name',
                'slug',
                'business_type',
                'status',
                'is_active',
                'phone',
                'address',
                'currency',
            )
        }),
        ('Rahbariyat & Modullar Holati', {
            'fields': (
                'owner_display',
                'enabled_modules_display',
                'disabled_modules_display',
            )
        }),
        ('Foydalanish Statistikasi (Usage Summary)', {
            'fields': (
                'usage_summary_display',
            )
        }),
        ('Xavfsizlik & Audit Tarixi', {
            'fields': (
                'audit_history_display',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )

    def business_type_display(self, obj):
        if obj.business_type:
            return format_html(f'<span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">{obj.business_type.name}</span>')
        return "—"
    business_type_display.short_description = "Biznes turi"

    def status_badge(self, obj):
        colors = {
            Company.STATUS_ACTIVE: ('#dcfce7', '#15803d', 'Faol'),
            Company.STATUS_SUSPENDED: ('#fee2e2', '#b91c1c', 'To\'xtatilgan'),
            Company.STATUS_PENDING: ('#fef3c7', '#b45309', 'Kutilmoqda'),
        }
        bg, text, label = colors.get(obj.status, ('#f3f4f6', '#374151', obj.status))
        return format_html(
            f'<span style="background: {bg}; color: {text}; padding: 3px 10px; border-radius: 12px; font-weight: 600; font-size: 11px;">{label}</span>'
        )
    status_badge.short_description = "Holat"

    def owner_display(self, obj):
        owner_member = obj.memberships.filter(role=CompanyMember.ROLE_SHOP_OWNER, is_active=True).select_related('user').first()
        if owner_member and owner_member.user:
            return f"{owner_member.user.full_name or owner_member.user.email} ({owner_member.user.email})"
        return format_html('<span style="color: #9ca3af;">Biriktirilmagan</span>')
    owner_display.short_description = "Tashkilot Egasi (Owner)"

    def active_modules_count(self, obj):
        count = obj.module_entitlements.filter(is_enabled=True).count()
        return format_html(f'<b>{count} ta faol</b>')
    active_modules_count.short_description = "Modullar"

    def active_members_count(self, obj):
        return obj.memberships.filter(is_active=True).count()
    active_members_count.short_description = "Hodimlar"

    def enabled_modules_display(self, obj):
        active_entitlements = obj.module_entitlements.filter(is_enabled=True).select_related('module')
        if not active_entitlements.exists():
            return "Faol modullar yo'q."
        badges = [
            f'<span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 6px; margin-right: 6px; display: inline-block; margin-bottom: 4px; font-size: 12px; font-weight: 500;">✓ {e.module.name} ({e.module.code})</span>'
            for e in active_entitlements
        ]
        return format_html("".join(badges))
    enabled_modules_display.short_description = "Yoqilgan Modullar (Enabled)"

    def disabled_modules_display(self, obj):
        disabled_entitlements = obj.module_entitlements.filter(is_enabled=False).select_related('module')
        if not disabled_entitlements.exists():
            return format_html('<span style="color: #9ca3af;">O\'chirilgan modullar yo\'q.</span>')
        badges = [
            f'<span style="background: #f1f5f9; color: #64748b; padding: 3px 8px; border-radius: 6px; margin-right: 6px; display: inline-block; margin-bottom: 4px; font-size: 12px;">✕ {e.module.name} ({e.module.code})</span>'
            for e in disabled_entitlements
        ]
        return format_html("".join(badges))
    disabled_modules_display.short_description = "O'chirilgan Modullar (Disabled)"

    def usage_summary_display(self, obj):
        from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord
        from apps.work.models import Task

        debtors_count = DebtCustomer.objects.filter(company=obj).count()
        debts_count = DebtRecord.objects.filter(company=obj).count()
        repayments_count = RepaymentRecord.objects.filter(company=obj).count()
        tasks_count = Task.objects.filter(company=obj).count()

        html = f"""
        <table style="width: 100%; max-width: 600px; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #e2e8f0; padding: 6px 0;">
                <td style="padding: 6px; color: #64748b;">Mijozlar (Qarzdorlar):</td>
                <td style="padding: 6px; font-weight: bold;">{debtors_count} ta</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; color: #64748b;">Yozilgan nasiyalar:</td>
                <td style="padding: 6px; font-weight: bold;">{debts_count} ta</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; color: #64748b;">Qabul qilingan to'lovlar:</td>
                <td style="padding: 6px; font-weight: bold;">{repayments_count} ta</td>
            </tr>
            <tr>
                <td style="padding: 6px; color: #64748b;">Eslatmalar / Vazifalar:</td>
                <td style="padding: 6px; font-weight: bold;">{tasks_count} ta</td>
            </tr>
        </table>
        """
        return format_html(html)
    usage_summary_display.short_description = "Statistika"

    def audit_history_display(self, obj):
        events = AuditEvent.objects.filter(company=obj).order_by('-created_at')[:10]
        if not events.exists():
            return "Hozircha audit yozuvlari mavjud emas."
        rows = [
            f"<tr style='border-bottom: 1px solid #eee; font-size: 12px;'>"
            f"<td style='padding: 4px 8px;'>{e.created_at.strftime('%Y-%m-%d %H:%M')}</td>"
            f"<td style='padding: 4px 8px; font-weight: 600;'>{e.action}</td>"
            f"<td style='padding: 4px 8px;'>{e.actor.email if e.actor else 'Tizim'}</td>"
            f"<td style='padding: 4px 8px;'>{e.metadata}</td>"
            f"</tr>"
            for e in events
        ]
        table = f"""
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f8fafc; font-size: 11px; text-transform: uppercase;">
                <tr><th style='padding: 6px 8px; text-align: left;'>Vaqt</th><th style='padding: 6px 8px; text-align: left;'>Amal</th><th style='padding: 6px 8px; text-align: left;'>Foydalanuvchi</th><th style='padding: 6px 8px; text-align: left;'>Tafsilot</th></tr>
            </thead>
            <tbody>{''.join(rows)}</tbody>
        </table>
        """
        return format_html(table)
    audit_history_display.short_description = "So'nggi Audit Tarixi"

    # Bulk Actions
    @admin.action(description="Tanlangan tashkilotlarni to'xtatish (Suspend)")
    def suspend_organizations(self, request, queryset):
        count = queryset.update(status=Company.STATUS_SUSPENDED, is_active=False)
        self.message_user(request, f"{count} ta tashkilot faoliyati muvaffaqiyatli to'xtatildi.")

    @admin.action(description="Tanlangan tashkilotlarni qayta faollashtirish (Reactivate)")
    def reactivate_organizations(self, request, queryset):
        count = queryset.update(status=Company.STATUS_ACTIVE, is_active=True)
        self.message_user(request, f"{count} ta tashkilot qayta faollashtirildi.")

    @admin.action(description="Standart modullarni qayta sinxronizatsiya qilish")
    def sync_default_modules(self, request, queryset):
        activated = 0
        for org in queryset:
            if not org.business_type:
                continue
            defaults = BusinessTypeModule.objects.filter(
                business_type=org.business_type,
                is_default=True
            ).select_related('module')
            for mapping in defaults:
                ent, created = OrganizationModule.objects.get_or_create(
                    company=org,
                    module=mapping.module,
                    defaults={'is_enabled': True}
                )
                if not ent.is_enabled:
                    ent.is_enabled = True
                    ent.save(update_fields=['is_enabled'])
                    activated += 1
        self.message_user(request, f"{activated} ta modul muvaffaqiyatli yoqildi va sinxronlandi.")

@admin.register(OrganizationModule)
class OrganizationModuleAdmin(admin.ModelAdmin):
    list_display = ['company', 'module', 'is_enabled_badge', 'activated_at', 'deactivated_at']
    list_filter = ['is_enabled', 'module__category', 'module']
    search_fields = ['company__name', 'module__name', 'module__code']
    autocomplete_fields = ['company', 'module']
    actions = ['enable_modules', 'disable_modules']

    def is_enabled_badge(self, obj):
        color = "#15803d" if obj.is_enabled else "#dc2626"
        label = "YOQILGAN" if obj.is_enabled else "O'CHIRILGAN"
        return format_html(f'<span style="color: {color}; font-weight: bold;">{label}</span>')
    is_enabled_badge.short_description = "Holat"

    @admin.action(description="Tanlangan modullarni YOQISH")
    def enable_modules(self, request, queryset):
        count = queryset.update(is_enabled=True, deactivated_at=None)
        self.message_user(request, f"{count} ta modul yoqildi.")

    @admin.action(description="Tanlangan modullarni O'CHIRISH (Ma'lumotlar saqlanadi)")
    def disable_modules(self, request, queryset):
        count = queryset.update(is_enabled=False, deactivated_at=timezone.now())
        self.message_user(request, f"{count} ta modul o'chirildi (Ma'lumotlar saqlab qolindi).")

@admin.register(CompanyMember)
class CompanyMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'company']
    search_fields = ['user__email', 'user__full_name', 'company__name']
    autocomplete_fields = ['company', 'user']

# ==============================================================================
# REAL DASHBOARD OVERRIDE FOR DJANGO ADMIN SITE
# ==============================================================================
from decimal import Decimal
from django.db import models

original_admin_index = admin.site.index

def custom_admin_index(request, extra_context=None):
    today = timezone.localdate()

    # 1. Organization KPIs
    total_orgs = Company.objects.count()
    active_orgs = Company.objects.filter(status=Company.STATUS_ACTIVE, is_active=True).count()
    suspended_orgs = Company.objects.filter(status=Company.STATUS_SUSPENDED).count()

    retail_orgs = Company.objects.filter(business_type__code='retail_store').count()
    edu_orgs = Company.objects.filter(business_type__code='education_center').count()

    # 2. Financial & Debt Metrics
    from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord
    from apps.identity.models import User

    debt_stats = DebtCustomer.objects.aggregate(
        total_balance=models.Sum('current_balance'),
        active_debtors=models.Count('id', filter=models.Q(current_balance__gt=Decimal('0.00'))),
        total_customers=models.Count('id'),
    )
    total_debt_amount = debt_stats['total_balance'] or Decimal('0.00')
    active_debtors_count = debt_stats['active_debtors'] or 0
    total_customers_count = debt_stats['total_customers'] or 0

    today_collections = RepaymentRecord.objects.filter(created_at__date=today).aggregate(
        total=models.Sum('amount')
    )['total'] or Decimal('0.00')

    # 3. System Modules & Users
    total_modules = Module.objects.count()
    active_modules = Module.objects.filter(is_active=True).count()
    total_users = User.objects.count()

    # 4. Detailed lists for dashboard widgets
    dashboard_orgs = Company.objects.select_related('business_type').prefetch_related(
        'module_entitlements__module'
    ).order_by('-created_at')[:8]

    recent_debts = DebtRecord.objects.select_related(
        'customer', 'company', 'recorded_by'
    ).order_by('-created_at')[:6]

    recent_repayments = RepaymentRecord.objects.select_related(
        'customer', 'company', 'recorded_by'
    ).order_by('-created_at')[:6]

    recent_audits = AuditEvent.objects.select_related(
        'actor', 'company'
    ).order_by('-created_at')[:8]

    business_types_list = BusinessType.objects.prefetch_related(
        'module_mappings__module'
    ).all()

    dashboard_context = {
        'total_orgs': total_orgs,
        'active_orgs': active_orgs,
        'suspended_orgs': suspended_orgs,
        'retail_orgs': retail_orgs,
        'edu_orgs': edu_orgs,
        'total_debt_amount': f"{total_debt_amount:,.2f}",
        'today_collections': f"{today_collections:,.2f}",
        'active_debtors_count': active_debtors_count,
        'total_customers_count': total_customers_count,
        'total_modules': total_modules,
        'active_modules': active_modules,
        'total_users': total_users,
        'dashboard_orgs': dashboard_orgs,
        'recent_debts': recent_debts,
        'recent_repayments': recent_repayments,
        'recent_audits': recent_audits,
        'business_types_list': business_types_list,
    }

    extra_context = extra_context or {}
    extra_context.update(dashboard_context)
    return original_admin_index(request, extra_context=extra_context)

admin.site.index = custom_admin_index

