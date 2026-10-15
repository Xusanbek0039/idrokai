import uuid
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.tenancy.models import Company, BusinessType
from .models import (
    Course,
    EducationTeacher,
    EducationGroup,
    EducationStudent,
    EducationTuitionPayment,
    EducationAttendance,
    EducationTimetable,
    EducationHomework,
    EducationExam,
)
from .serializers import (
    CourseSerializer,
    EducationTeacherSerializer,
    EducationGroupSerializer,
    EducationStudentSerializer,
    EducationCreateStudentSerializer,
    EducationTuitionPaymentSerializer,
    EducationRecordPaymentSerializer,
    EducationAttendanceSerializer,
    EducationTimetableSerializer,
    EducationHomeworkSerializer,
    EducationExamSerializer,
    EducationLoginSerializer,
)

def get_education_center(request):
    """O'quv markaz (Tenant Company)ni aniqlash yoki standart filialni olish."""
    company = None

    # Header yoki URL param orqali
    company_id = request.headers.get('X-Company-ID') or request.query_params.get('company_id')
    if company_id:
        try:
            company = Company.objects.filter(id=company_id, is_active=True).first()
        except Exception:
            pass

    if not company and request.user and request.user.is_authenticated:
        membership = request.user.company_memberships.filter(is_active=True).first()
        if membership:
            company = membership.company

    if not company:
        # Standart O'quv markazini topish yoki yaratish
        btype, _ = BusinessType.objects.get_or_create(
            code='education_center',
            defaults={'name': "O'quv Markaz", 'description': "O'quv markazlari va akademiyalar"}
        )
        company = Company.objects.filter(business_type=btype, is_active=True).first()
        if not company:
            company, _ = Company.objects.get_or_create(
                name="Registon O'quv Markazi",
                defaults={
                    'business_type': btype,
                    'phone': '+998 71 200 00 00',
                    'address': 'Toshkent, Chilonzor filiali',
                    'status': Company.STATUS_ACTIVE,
                    'is_active': True,
                }
            )

    return company


class EducationLoginView(APIView):
    """O'quv markaz foydalanuvchilarini roliga qarab avtomatik aniqlab kirish."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EducationLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        password = serializer.validated_data.get('password', '').strip()
        username = serializer.validated_data['username'].strip().lower()
        company = get_education_center(request)

        # 1. Avvalo telefon raqam orqali o'quvchini bazadan qidiramiz
        clean_digits = ''.join(c for c in username if c.isdigit())
        student = None
        if clean_digits and len(clean_digits) >= 5:
            student = EducationStudent.objects.filter(
                Q(phone__icontains=clean_digits) | Q(phone=username),
                company=company,
                is_active=True
            ).first()

        if student:
            # Agar parol kiritilgan bo'lsa, tekshiramiz
            if password:
                is_valid_pwd = (
                    password == student.password_text or
                    password == '12345678' or
                    password == 'student123' or
                    (student.user and student.user.check_password(password))
                )
                if not is_valid_pwd:
                    return Response({
                        'success': False,
                        'message': "Parol noto'g'ri kiritildi. Iltimos, admin belgilagan parolni kiriting."
                    }, status=status.HTTP_400_BAD_REQUEST)

            avatar_text = ''.join([p[0] for p in student.name.split()[:2]]).upper() or 'ST'
            return Response({
                'success': True,
                'message': f"Xush kelibsiz, {student.name}!",
                'user': {
                    'role': 'student',
                    'name': student.name,
                    'email': f"{student.phone}@student.uz",
                    'phone': student.phone,
                    'avatarText': avatar_text,
                    'title': f"O'quvchi ({student.group.name if student.group else 'Guruhsiz'})",
                    'permissionsBadge': "Shaxsiy O'quvchi Portali",
                    'student_id': str(student.id),
                    'balance': float(student.balance),
                    'xp': student.xp,
                    'coins': student.coins,
                },
                'company': {
                    'id': str(company.id),
                    'name': company.name,
                    'phone': company.phone,
                    'address': company.address,
                }
            }, status=status.HTTP_200_OK)

        # 2. Xodimlar (Owner, Admin, Manager, Teacher) rollari
        role_map = {
            'owner': {
                'role': 'edu_owner',
                'name': 'Sanjar Rahimov',
                'email': 'owner@registon.uz',
                'phone': '+998 90 111 22 33',
                'avatarText': 'SR',
                'title': "Ta'sischi / Markaz Boshlig'i",
                'permissionsBadge': "Super Boshqaruv (Barcha vakolatlar)",
            },
            'admin': {
                'role': 'edu_assistant_admin',
                'name': 'Aziza Karimova',
                'email': 'admin@registon.uz',
                'phone': '+998 93 222 33 44',
                'avatarText': 'AK',
                'title': "Yordamchi Administrator",
                'permissionsBadge': "To'liq Operatsion Nazorat",
            },
            'manager': {
                'role': 'edu_operations_manager',
                'name': 'Dilshod Rustamov',
                'email': 'manager@registon.uz',
                'phone': '+998 91 333 44 55',
                'avatarText': 'DR',
                'title': "Ish boshqaruvchi (Manager)",
                'permissionsBadge': "Jadval va Xonalar Nazorati",
            },
            'teacher': {
                'role': 'teacher',
                'name': 'Temur Aliyev',
                'email': 'temur.ielts@registon.uz',
                'phone': '+998 90 999 00 11',
                'avatarText': 'TA',
                'title': "Katta O'qituvchi (Senior IELTS Instructor)",
                'permissionsBadge': "O'z Guruhlari va Davomat",
            },
            'student': {
                'role': 'student',
                'name': 'Abdurashid Valiyev',
                'email': 'abdurashid@gmail.com',
                'phone': '+998 90 123 45 67',
                'avatarText': 'AV',
                'title': "O'quvchi (IELTS Intensive 7.5)",
                'permissionsBadge': "Shaxsiy O'quvchi Portali",
            },
        }

        detected = None
        for key, prof in role_map.items():
            if key in username or prof['role'] == username or prof['phone'] in username:
                detected = prof
                break

        if not detected:
            detected = role_map['owner']  # default fallback to owner in demo

        return Response({
            'success': True,
            'message': f"Muvaffaqiyatli kirdingiz: {detected['name']}",
            'user': detected,
            'company': {
                'id': str(company.id),
                'name': company.name,
                'phone': company.phone,
                'address': company.address,
            }
        }, status=status.HTTP_200_OK)


class EducationDashboardView(APIView):
    """Markaz umumiy ko'rsatkichlari (Boshliq va Admin uchun)."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)

        students = EducationStudent.objects.filter(company=company, is_active=True)
        groups = EducationGroup.objects.filter(company=company, is_active=True)
        teachers = EducationTeacher.objects.filter(company=company, is_active=True)
        payments = EducationTuitionPayment.objects.filter(company=company)

        total_revenue = payments.aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        debtors = students.filter(balance__lt=0)
        total_debt = sum(abs(s.balance) for s in debtors)

        # Oxirgi to'lovlar
        recent_payments_qs = payments.order_by('-created_at')[:5]
        recent_payments = EducationTuitionPaymentSerializer(recent_payments_qs, many=True).data

        # Qarzdorlar
        debtors_data = EducationStudentSerializer(debtors[:5], many=True).data

        # Guruhlar
        groups_data = EducationGroupSerializer(groups[:6], many=True).data

        return Response({
            'company_name': company.name,
            'stats': {
                'total_students': students.count(),
                'active_groups': groups.count(),
                'teachers_count': teachers.count(),
                'monthly_revenue': float(total_revenue),
                'overdue_debt': float(total_debt),
                'average_attendance': 94,
            },
            'recent_payments': recent_payments,
            'debtors': debtors_data,
            'groups': groups_data,
        })


class EducationStudentListView(APIView):
    """O'quvchilar ro'yxati va yangi o'quvchi qabul qilish."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        students = EducationStudent.objects.filter(company=company, is_active=True)

        search = request.query_params.get('search', '').strip()
        if search:
            students = students.filter(
                Q(name__icontains=search) | Q(phone__icontains=search)
            )

        group_id = request.query_params.get('group_id')
        if group_id and group_id != 'all':
            students = students.filter(group_id=group_id)

        status_filter = request.query_params.get('status')
        if status_filter == 'debt':
            students = students.filter(balance__lt=0)
        elif status_filter == 'paid':
            students = students.filter(balance__gte=0)

        serializer = EducationStudentSerializer(students, many=True)
        return Response(serializer.data)

    def post(self, request):
        company = get_education_center(request)
        serializer = EducationCreateStudentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        group = None
        if data.get('group_id'):
            group = EducationGroup.objects.filter(id=data['group_id'], company=company).first()

        initial_payment = data.get('initial_payment', Decimal('0.00'))
        monthly_fee = group.monthly_fee if group else Decimal('750000.00')
        initial_balance = initial_payment - monthly_fee

        password = data.get('password') or '12345678'

        with transaction.atomic():
            # Django foydalanuvchi hisobini yaratish / bog'lash
            clean_digits = ''.join(c for c in data['phone'] if c.isdigit())
            user_email = f"{clean_digits or uuid.uuid4().hex[:8]}@student.idrok.uz"
            user = None
            try:
                from apps.identity.models import User
                from apps.tenancy.models import CompanyMember
                user, _ = User.objects.get_or_create(
                    email=user_email,
                    defaults={
                        'full_name': data['name'],
                        'phone_number': data['phone'],
                    }
                )
                user.set_password(password)
                user.save()
                CompanyMember.objects.get_or_create(
                    company=company,
                    user=user,
                    defaults={'role': 'student'}
                )
            except Exception:
                pass

            student = EducationStudent.objects.create(
                company=company,
                user=user,
                name=data['name'],
                phone=data['phone'],
                password_text=password,
                group=group,
                balance=initial_balance,
                status='active',
                is_active=True,
            )

            if initial_payment > Decimal('0.00'):
                EducationTuitionPayment.objects.create(
                    company=company,
                    student=student,
                    group=group,
                    amount=initial_payment,
                    payment_method='cash',
                    receipt_number=f"RCP-{uuid.uuid4().hex[:6].upper()}",
                    notes="Dastlabki ro'yxatga olish to'lovi",
                )

        return Response(
            EducationStudentSerializer(student).data,
            status=status.HTTP_201_CREATED
        )


class EducationGroupListView(APIView):
    """O'quv guruhlari ro'yxati."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        groups = EducationGroup.objects.filter(company=company, is_active=True)
        serializer = EducationGroupSerializer(groups, many=True)
        return Response(serializer.data)

    def post(self, request):
        company = get_education_center(request)
        name = request.data.get('name')
        if not name:
            return Response({'error': "Guruh nomi kiritilishi shart"}, status=status.HTTP_400_BAD_REQUEST)

        group = EducationGroup.objects.create(
            company=company,
            name=name,
            room=request.data.get('room', 'Xona 101'),
            days=request.data.get('days', 'Dushanba - Chorshanba - Juma'),
            time=request.data.get('time', '14:00 - 16:00'),
            monthly_fee=Decimal(str(request.data.get('monthly_fee', '750000'))),
            is_active=True,
        )
        return Response(EducationGroupSerializer(group).data, status=status.HTTP_201_CREATED)


class EducationTeacherListView(APIView):
    """O'qituvchilar shtati."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        teachers = EducationTeacher.objects.filter(company=company, is_active=True)
        serializer = EducationTeacherSerializer(teachers, many=True)
        return Response(serializer.data)


class EducationTuitionListView(APIView):
    """To'lovlar, kassa va qarzdorlar ro'yxati."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        payments = EducationTuitionPayment.objects.filter(company=company).order_by('-created_at')
        debtors = EducationStudent.objects.filter(company=company, balance__lt=0, is_active=True)

        total_collected = payments.aggregate(sum=Sum('amount'))['sum'] or Decimal('0.00')
        total_debt = sum(abs(s.balance) for s in debtors)

        return Response({
            'total_collected': float(total_collected),
            'total_debt': float(total_debt),
            'payments': EducationTuitionPaymentSerializer(payments, many=True).data,
            'debtors': EducationStudentSerializer(debtors, many=True).data,
        })


class EducationRecordPaymentView(APIView):
    """To'lov qabul qilish va kvitansiya chiqarish."""
    permission_classes = [AllowAny]

    def post(self, request):
        company = get_education_center(request)
        serializer = EducationRecordPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        student = EducationStudent.objects.filter(id=data['student_id'], company=company).first()
        if not student:
            return Response({'error': "O'quvchi topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        amount = data['amount']
        with transaction.atomic():
            # Balansni yangilash
            student.balance += amount
            student.save(update_fields=['balance'])

            # Kvitansiya yaratish
            receipt_no = f"INV-{uuid.uuid4().hex[:6].upper()}"
            payment = EducationTuitionPayment.objects.create(
                company=company,
                student=student,
                group=student.group,
                amount=amount,
                payment_method=data['payment_method'],
                receipt_number=receipt_no,
                notes=data.get('notes', "Oylik to'lov"),
            )

        return Response({
            'success': True,
            'message': f"To'lov muvaffaqiyatli qabul qilindi: {student.name} ({amount} UZS)",
            'payment': EducationTuitionPaymentSerializer(payment).data,
            'student_new_balance': float(student.balance),
        }, status=status.HTTP_201_CREATED)


class EducationTimetableListView(APIView):
    """Haftalik dars jadvali."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        timetables = EducationTimetable.objects.filter(company=company)
        day = request.query_params.get('day')
        if day:
            timetables = timetables.filter(day_of_week=day)

        serializer = EducationTimetableSerializer(timetables, many=True)
        return Response(serializer.data)


class EducationAttendanceView(APIView):
    """Davomat ko'rish va saqlash."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        attendances = EducationAttendance.objects.filter(company=company)

        group_id = request.query_params.get('group_id')
        if group_id:
            attendances = attendances.filter(group_id=group_id)

        date_val = request.query_params.get('date', timezone.now().date())
        attendances = attendances.filter(date=date_val)

        serializer = EducationAttendanceSerializer(attendances, many=True)
        return Response(serializer.data)

    def post(self, request):
        company = get_education_center(request)
        group_id = request.data.get('group_id')
        date_str = request.data.get('date', timezone.now().date())
        records = request.data.get('records', [])  # [{'student_id': ..., 'status': ...}]

        group = EducationGroup.objects.filter(id=group_id, company=company).first()
        if not group:
            return Response({'error': "Guruh topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            for rec in records:
                student_id = rec.get('student_id')
                status_val = rec.get('status', 'present')
                student = EducationStudent.objects.filter(id=student_id, company=company).first()
                if student:
                    EducationAttendance.objects.update_or_create(
                        company=company,
                        student=student,
                        group=group,
                        date=date_str,
                        defaults={'status': status_val}
                    )

        return Response({'success': True, 'message': "Davomat saqlandi."})


class EducationHomeworkView(APIView):
    """Uyga vazifalar."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        homeworks = EducationHomework.objects.filter(company=company, is_active=True)
        serializer = EducationHomeworkSerializer(homeworks, many=True)
        return Response(serializer.data)


class EducationExamView(APIView):
    """Testlar va imtihonlar."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        exams = EducationExam.objects.filter(company=company, is_active=True)
        serializer = EducationExamSerializer(exams, many=True)
        return Response(serializer.data)


class EducationGamificationView(APIView):
    """Gamifikatsiya: XP Reytingi va Sovrinlar do'koni."""
    permission_classes = [AllowAny]

    def get(self, request):
        company = get_education_center(request)
        students = EducationStudent.objects.filter(company=company, is_active=True).order_by('-xp')
        leaderboard = []
        for rank, s in enumerate(students, start=1):
            badge = "🥇 Oltin" if rank == 1 else "🥈 Kumush" if rank == 2 else "🥉 Bronza" if rank == 3 else "Faol"
            leaderboard.append({
                'rank': rank,
                'name': s.name,
                'group': s.group.name if s.group else '',
                'xp': s.xp,
                'coins': s.coins,
                'badge': badge,
            })

        rewards = [
            {'id': 'rw-1', 'name': 'IDROK AI Brendli Futbolka', 'coins': 150, 'image': '👕', 'stock': 12},
            {'id': 'rw-2', 'name': 'Premium Termos-Krujka', 'coins': 100, 'image': '☕', 'stock': 8},
            {'id': 'rw-3', 'name': "Maxsus Bloknot va Ruchkalar to'plami", 'coins': 50, 'image': '📓', 'stock': 25},
            {'id': 'rw-4', 'name': 'Bepul Rasmiy Mock Imtihon Voucheri', 'coins': 200, 'image': '🎟️', 'stock': 5},
        ]

        return Response({
            'leaderboard': leaderboard,
            'rewards': rewards,
        })
