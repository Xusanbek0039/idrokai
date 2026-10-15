import json
from decimal import Decimal
from datetime import timedelta
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.db import transaction

from apps.identity.models import User
from apps.tenancy.models import Company, BusinessType, Module, BusinessTypeModule, OrganizationModule, CompanyMember
from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger
from apps.operations.models import AuditEvent

def platform_admin_login(request):
    """
    Sleek, modern login page for the Platform Super Admin.
    """
    if request.user.is_authenticated and (request.user.is_platform_super_admin or request.user.is_staff):
        return redirect('admin_dashboard')

    error_message = None
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()

        user = authenticate(request, email=email, password=password)
        if user is None:
            # Fallback to username for standard Django backends
            user = authenticate(request, username=email, password=password)

        if user is not None:
            if user.is_platform_super_admin or user.is_staff or user.is_superuser:
                login(request, user)
                next_url = request.GET.get('next') or request.POST.get('next') or '/admin/'
                return redirect(next_url)
            else:
                error_message = "Kechirasiz, sizda Platform Super Admin huquqi mavjud emas."
        else:
            error_message = "Elektron pochta yoki parol noto'g'ri kiritildi."

    return render(request, 'admin_dashboard/login.html', {
        'error_message': error_message,
        'next': request.GET.get('next', '/admin/'),
    })

def platform_admin_logout(request):
    """Logs out the user and redirects to the login screen."""
    logout(request)
    return redirect('admin_login')

def platform_admin_dashboard(request):
    """
    Primary Platform Super Admin Dashboard.
    Provides complete control of organizations, modules, financial flows, and metrics.
    """
    if not request.user.is_authenticated:
        return redirect(f"/admin/login/?next={request.path}")

    if not (request.user.is_platform_super_admin or request.user.is_staff or request.user.is_superuser):
        return HttpResponseForbidden("Sizda Platform Super Admin sahifasiga kirish ruxsati yo'q.")

    today = timezone.now().date()

    # 1. KPI Statistics
    total_orgs = Company.objects.count()
    active_orgs = Company.objects.filter(status=Company.STATUS_ACTIVE).count()
    suspended_orgs = Company.objects.filter(status=Company.STATUS_SUSPENDED).count()
    retail_orgs = Company.objects.filter(business_type__code='retail_store').count()
    edu_orgs = Company.objects.filter(business_type__code='education_center').count()

    total_debt_amount = DebtRecord.objects.aggregate(s=Sum('remaining_unpaid'))['s'] or Decimal('0.00')
    active_debtors_count = DebtCustomer.objects.filter(current_balance__gt=Decimal('0.00')).count()
    total_customers_count = DebtCustomer.objects.count()

    today_collections = RepaymentRecord.objects.filter(
        created_at__date=today
    ).aggregate(s=Sum('amount'))['s'] or Decimal('0.00')
    total_collections_all_time = RepaymentRecord.objects.aggregate(s=Sum('amount'))['s'] or Decimal('0.00')

    total_modules = Module.objects.count()
    active_modules = OrganizationModule.objects.filter(is_enabled=True).values('module').distinct().count()
    total_users = User.objects.count()

    # 2. Organizations with enriched data
    companies_list = Company.objects.select_related('business_type').prefetch_related(
        'module_entitlements__module',
        'memberships__user'
    ).order_by('-created_at')

    # Calculate per-company active debt
    org_data = []
    for comp in companies_list:
        comp_debt = DebtCustomer.objects.filter(company=comp).aggregate(s=Sum('current_balance'))['s'] or Decimal('0.00')
        comp_debtors = DebtCustomer.objects.filter(company=comp, current_balance__gt=0).count()
        enabled_modules = [
            ent.module.code for ent in comp.module_entitlements.all() if ent.is_enabled
        ]
        org_data.append({
            'obj': comp,
            'total_debt': comp_debt,
            'debtors_count': comp_debtors,
            'enabled_modules': enabled_modules,
            'all_entitlements': comp.module_entitlements.all(),
        })

    # 3. Recent Transactions
    recent_debts = DebtRecord.objects.select_related('customer', 'company').order_by('-created_at')[:6]
    recent_repayments = RepaymentRecord.objects.select_related('customer', 'company').order_by('-created_at')[:6]

    # 4. Modules & Business Types Catalog
    business_types = BusinessType.objects.prefetch_related('module_mappings__module').all()
    all_modules = Module.objects.select_related('depends_on').order_by('category', 'code')

    # 5. Chart Data: Last 7 Days Flow
    chart_labels = []
    chart_debts = []
    chart_repayments = []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%d-%b")
        chart_labels.append(day_str)

        d_sum = DebtRecord.objects.filter(created_at__date=day).aggregate(s=Sum('amount'))['s'] or Decimal('0.00')
        r_sum = RepaymentRecord.objects.filter(created_at__date=day).aggregate(s=Sum('amount'))['s'] or Decimal('0.00')
        chart_debts.append(float(d_sum))
        chart_repayments.append(float(r_sum))

    # Audit Events
    audit_logs = AuditEvent.objects.select_related('actor', 'company').order_by('-created_at')[:8]

    context = {
        'total_orgs': total_orgs,
        'active_orgs': active_orgs,
        'suspended_orgs': suspended_orgs,
        'retail_orgs': retail_orgs,
        'edu_orgs': edu_orgs,
        'total_debt_amount': f"{total_debt_amount:,.2f}".replace(',', ' '),
        'active_debtors_count': active_debtors_count,
        'total_customers_count': total_customers_count,
        'today_collections': f"{today_collections:,.2f}".replace(',', ' '),
        'total_collections_all_time': f"{total_collections_all_time:,.2f}".replace(',', ' '),
        'total_modules': total_modules,
        'active_modules': active_modules,
        'total_users': total_users,
        'org_data': org_data,
        'recent_debts': recent_debts,
        'recent_repayments': recent_repayments,
        'business_types': business_types,
        'all_modules': all_modules,
        'audit_logs': audit_logs,
        'chart_labels_json': json.dumps(chart_labels),
        'chart_debts_json': json.dumps(chart_debts),
        'chart_repayments_json': json.dumps(chart_repayments),
        'retail_orgs_count': retail_orgs,
        'edu_orgs_count': edu_orgs,
    }

    return render(request, 'admin_dashboard/dashboard.html', context)

@require_POST
def api_toggle_company_status(request, company_id):
    """AJAX endpoint: toggle organization active/suspended status."""
    if not request.user.is_authenticated or not (request.user.is_platform_super_admin or request.user.is_staff):
        return JsonResponse({'status': 'error', 'message': 'Ruxsat berilmagan'}, status=403)

    company = get_object_or_404(Company, id=company_id)
    if company.status == Company.STATUS_ACTIVE:
        company.status = Company.STATUS_SUSPENDED
    else:
        company.status = Company.STATUS_ACTIVE
    company.save(update_fields=['status'])

    # Record Audit Event
    try:
        AuditEvent.objects.create(
            company=company,
            actor=request.user,
            action=f"ORGANIZATION_STATUS_{company.status.upper()}",
            target_type="Company",
            metadata={'new_status': company.status}
        )
    except Exception:
        pass

    return JsonResponse({
        'status': 'success',
        'new_status': company.status,
        'new_status_display': 'Faol' if company.status == Company.STATUS_ACTIVE else "To'xtatilgan"
    })

@require_POST
def api_toggle_company_module(request, company_id):
    """AJAX endpoint: toggle a module for an organization."""
    if not request.user.is_authenticated or not (request.user.is_platform_super_admin or request.user.is_staff):
        return JsonResponse({'status': 'error', 'message': 'Ruxsat berilmagan'}, status=403)

    try:
        data = json.loads(request.body)
        module_code = data.get('module_code')
    except Exception:
        module_code = request.POST.get('module_code')

    company = get_object_or_404(Company, id=company_id)
    module = get_object_or_404(Module, code=module_code)

    entitlement, created = OrganizationModule.objects.get_or_create(
        company=company,
        module=module,
        defaults={'is_enabled': False}
    )

    # Toggle
    entitlement.is_enabled = not entitlement.is_enabled
    entitlement.save(update_fields=['is_enabled'])

    # Record Audit Event
    try:
        AuditEvent.objects.create(
            company=company,
            actor=request.user,
            action="MODULE_TOGGLED",
            target_type="OrganizationModule",
            metadata={
                'module_code': module.code,
                'is_enabled': entitlement.is_enabled
            }
        )
    except Exception:
        pass

    return JsonResponse({
        'status': 'success',
        'module_code': module.code,
        'is_enabled': entitlement.is_enabled
    })

@require_POST
def api_create_company(request):
    """AJAX endpoint: quickly create a new organization from the dashboard modal."""
    if not request.user.is_authenticated or not (request.user.is_platform_super_admin or request.user.is_staff):
        return JsonResponse({'status': 'error', 'message': 'Ruxsat berilmagan'}, status=403)

    try:
        data = json.loads(request.body) if request.body else request.POST
        name = data.get('name', '').strip()
        bt_code = data.get('business_type', 'retail_store')
        phone = data.get('phone', '').strip()
        address = data.get('address', '').strip()
        currency = data.get('currency', 'UZS')

        if not name:
            return JsonResponse({'status': 'error', 'message': "Tashkilot nomi kiritilishi shart."}, status=400)

        bt = get_object_or_404(BusinessType, code=bt_code)

        with transaction.atomic():
            company = Company.objects.create(
                name=name,
                business_type=bt,
                phone=phone,
                address=address,
                currency=currency,
                status=Company.STATUS_ACTIVE
            )

            # Map default modules from BusinessType
            default_mappings = BusinessTypeModule.objects.filter(business_type=bt)
            for mapping in default_mappings:
                OrganizationModule.objects.create(
                    company=company,
                    module=mapping.module,
                    is_enabled=mapping.is_default or mapping.is_mandatory
                )

            # Assign SuperAdmin as owner for initial configuration
            CompanyMember.objects.create(
                company=company,
                user=request.user,
                role=CompanyMember.ROLE_SHOP_OWNER
            )

            try:
                AuditEvent.objects.create(
                    company=company,
                    actor=request.user,
                    action="ORGANIZATION_CREATED",
                    target_type="Company",
                    metadata={'name': company.name, 'business_type': bt.code}
                )
            except Exception:
                pass

        return JsonResponse({
            'status': 'success',
            'company_id': str(company.id),
            'name': company.name,
            'message': f"'{company.name}' muvaffaqiyatli yaratildi!"
        })

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
