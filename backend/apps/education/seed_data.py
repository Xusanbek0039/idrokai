import os
import sys
import django
from decimal import Decimal

# Setup standalone django if executed directly
if __name__ == '__main__':
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    sys.path.insert(0, backend_dir)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
    django.setup()

from apps.tenancy.models import Company, BusinessType
from apps.education.models import (
    Course,
    EducationTeacher,
    EducationGroup,
    EducationStudent,
    EducationTuitionPayment,
    EducationTimetable,
    EducationHomework,
    EducationExam,
)

def run_seed():
    print("O'quv markaz ma'lumotlarini yuklash boshlandi...")

    btype, _ = BusinessType.objects.get_or_create(
        code='education_center',
        defaults={
            'name': "O'quv Markaz",
            'description': "O'quv markazlari, xususiy maktablar va akademiyalar",
        }
    )

    company, _ = Company.objects.get_or_create(
        name="Registon O'quv Markazi",
        defaults={
            'business_type': btype,
            'phone': '+998 71 200 00 00',
            'address': 'Toshkent sh., Chilonzor tumani, 9-mavze',
            'currency': 'UZS',
            'status': Company.STATUS_ACTIVE,
            'is_active': True,
        }
    )

    # 1. Kurslar
    c_ielts, _ = Course.objects.get_or_create(
        company=company,
        name='IELTS Intensive',
        defaults={'description': "Xalqaro IELTS imtihoniga tayyorgarlik kursi", 'category': 'languages'}
    )
    c_eng, _ = Course.objects.get_or_create(
        company=company,
        name='General English',
        defaults={'description': "Ingliz tili boshlang'ich va o'rta darajalar", 'category': 'languages'}
    )
    c_it, _ = Course.objects.get_or_create(
        company=company,
        name='Front-End Web Dasturlash',
        defaults={'description': "React, Next.js va zamonaviy web dasturlash", 'category': 'it'}
    )
    c_math, _ = Course.objects.get_or_create(
        company=company,
        name='Matematika & SAT',
        defaults={'description': "Prezident maktablari va SAT imtihoniga tayyorgarlik", 'category': 'exact_sciences'}
    )

    # 2. O'qituvchilar
    t_temur, _ = EducationTeacher.objects.get_or_create(
        company=company,
        name='Temur Aliyev',
        defaults={
            'phone': '+998 90 999 00 11',
            'subject': 'IELTS & General English',
            'salary_type': '50% ulush',
            'is_active': True,
        }
    )
    t_nodira, _ = EducationTeacher.objects.get_or_create(
        company=company,
        name='Nodira Karimova',
        defaults={
            'phone': '+998 93 888 77 66',
            'subject': 'General English & CEFR',
            'salary_type': 'Oylik stavka',
            'is_active': True,
        }
    )
    t_bobur, _ = EducationTeacher.objects.get_or_create(
        company=company,
        name='Bobur Zokirov',
        defaults={
            'phone': '+998 97 777 66 55',
            'subject': 'Full-Stack Web Dasturlash',
            'salary_type': '60% ulush',
            'is_active': True,
        }
    )

    # 3. Guruhlar
    g_ielts, _ = EducationGroup.objects.get_or_create(
        company=company,
        name='IELTS Intensive 7.5',
        defaults={
            'course': c_ielts,
            'teacher': t_temur,
            'room': 'Xona 102 (Audio)',
            'days': 'Dushanba - Chorshanba - Juma',
            'time': '14:00 - 16:00',
            'monthly_fee': Decimal('750000.00'),
            'is_active': True,
        }
    )
    g_eng, _ = EducationGroup.objects.get_or_create(
        company=company,
        name='General English B2',
        defaults={
            'course': c_eng,
            'teacher': t_nodira,
            'room': 'Xona 105 (Katta)',
            'days': 'Seshanba - Payshanba - Shanba',
            'time': '10:00 - 12:00',
            'monthly_fee': Decimal('600000.00'),
            'is_active': True,
        }
    )
    g_it, _ = EducationGroup.objects.get_or_create(
        company=company,
        name='Front-End Web Dasturlash',
        defaults={
            'course': c_it,
            'teacher': t_bobur,
            'room': 'Kompyuter Lab 1',
            'days': 'Dushanba - Chorshanba - Juma',
            'time': '18:30 - 20:30',
            'monthly_fee': Decimal('900000.00'),
            'is_active': True,
        }
    )
    g_math, _ = EducationGroup.objects.get_or_create(
        company=company,
        name='Matematika (SAT & Milliy sertifikat)',
        defaults={
            'course': c_math,
            'teacher': t_temur,
            'room': 'Xona 201 (Aniq fanlar)',
            'days': 'Seshanba - Payshanba - Shanba',
            'time': '16:00 - 18:00',
            'monthly_fee': Decimal('550000.00'),
            'is_active': True,
        }
    )

    # 4. O'quvchilar
    students_data = [
        {
            'name': 'Abdurashid Valiyev',
            'phone': '+998 90 123 45 67',
            'group': g_ielts,
            'balance': Decimal('-250000.00'),
            'attendance_rate': 94,
            'xp': 1450,
            'coins': 85,
        },
        {
            'name': 'Madina Ismoilova',
            'phone': '+998 91 234 56 78',
            'group': g_ielts,
            'balance': Decimal('0.00'),
            'attendance_rate': 98,
            'xp': 1820,
            'coins': 120,
        },
        {
            'name': 'Jasur Bekmurodov',
            'phone': '+998 93 345 67 89',
            'group': g_it,
            'balance': Decimal('-500000.00'),
            'attendance_rate': 88,
            'xp': 1390,
            'coins': 80,
        },
        {
            'name': 'Shaxnoza Rahimova',
            'phone': '+998 94 456 78 90',
            'group': g_eng,
            'balance': Decimal('150000.00'),
            'attendance_rate': 92,
            'xp': 1200,
            'coins': 70,
        },
        {
            'name': 'Sarvar Qosimov',
            'phone': '+998 95 567 89 01',
            'group': g_math,
            'balance': Decimal('-750000.00'),
            'attendance_rate': 75,
            'xp': 950,
            'coins': 40,
        },
        {
            'name': 'Diyora Karimova',
            'phone': '+998 97 678 90 12',
            'group': g_eng,
            'balance': Decimal('0.00'),
            'attendance_rate': 96,
            'xp': 1100,
            'coins': 65,
        },
    ]

    for sd in students_data:
        std, _ = EducationStudent.objects.get_or_create(
            company=company,
            phone=sd['phone'],
            defaults={
                'name': sd['name'],
                'group': sd['group'],
                'balance': sd['balance'],
                'attendance_rate': sd['attendance_rate'],
                'password_text': '12345678',
                'xp': sd['xp'],
                'coins': sd['coins'],
                'is_active': True,
            }
        )

    # 5. Kassa to'lovlari
    std_madina = EducationStudent.objects.filter(phone='+998 91 234 56 78').first()
    std_rashid = EducationStudent.objects.filter(phone='+998 90 123 45 67').first()
    std_diyora = EducationStudent.objects.filter(phone='+998 97 678 90 12').first()

    if std_madina and not EducationTuitionPayment.objects.filter(student=std_madina).exists():
        EducationTuitionPayment.objects.create(
            company=company,
            student=std_madina,
            group=g_ielts,
            amount=Decimal('750000.00'),
            payment_method='cash',
            receipt_number='INV-9021',
            notes="Oktyabr oyi to'liq to'lovi",
        )

    if std_rashid and not EducationTuitionPayment.objects.filter(student=std_rashid).exists():
        EducationTuitionPayment.objects.create(
            company=company,
            student=std_rashid,
            group=g_ielts,
            amount=Decimal('500000.00'),
            payment_method='card',
            receipt_number='INV-9020',
            notes="Oylik to'lovning 1-qismi",
        )

    if std_diyora and not EducationTuitionPayment.objects.filter(student=std_diyora).exists():
        EducationTuitionPayment.objects.create(
            company=company,
            student=std_diyora,
            group=g_eng,
            amount=Decimal('800000.00'),
            payment_method='card',
            receipt_number='INV-9019',
            notes="Oktyabr to'lovi va kitoblar uchun",
        )

    # 6. Dars jadvali
    days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
    for day in ['Dushanba', 'Chorshanba', 'Juma']:
        EducationTimetable.objects.get_or_create(
            company=company,
            group=g_ielts,
            day_of_week=day,
            defaults={'time': '14:00 - 16:00', 'room': 'Xona 102 (Audio)', 'teacher': t_temur}
        )
        EducationTimetable.objects.get_or_create(
            company=company,
            group=g_it,
            day_of_week=day,
            defaults={'time': '18:30 - 20:30', 'room': 'Kompyuter Lab 1', 'teacher': t_bobur}
        )

    for day in ['Seshanba', 'Payshanba', 'Shanba']:
        EducationTimetable.objects.get_or_create(
            company=company,
            group=g_eng,
            day_of_week=day,
            defaults={'time': '10:00 - 12:00', 'room': 'Xona 105 (Katta)', 'teacher': t_nodira}
        )
        EducationTimetable.objects.get_or_create(
            company=company,
            group=g_math,
            day_of_week=day,
            defaults={'time': '16:00 - 18:00', 'room': 'Xona 201 (Aniq fanlar)', 'teacher': t_temur}
        )

    print("O'quv markaz demo ma'lumotlari muvaffaqiyatli yuklandi!")

if __name__ == '__main__':
    run_seed()
