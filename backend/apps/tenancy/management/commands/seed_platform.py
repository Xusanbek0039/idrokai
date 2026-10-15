from django.core.management.base import BaseCommand
from apps.identity.models import User
from apps.tenancy.models import BusinessType, Module, BusinessTypeModule, Company, OrganizationModule, CompanyMember

class Command(BaseCommand):
    help = 'Seeds initial BusinessTypes, Modules, mappings, and Platform Super Admin.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding IDROK AI Platform...")

        # 1. Platform Super Admin
        admin_email = "admin@idrok.uz"
        admin_password = "admin12345"
        superadmin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'full_name': "Platform Super Admin",
                'is_staff': True,
                'is_superuser': True,
                'is_platform_super_admin': True,
            }
        )
        if created:
            superadmin.set_password(admin_password)
            superadmin.save()
            self.stdout.write(self.style.SUCCESS(f"Created Super Admin: {admin_email} (Parol: {admin_password})"))
        else:
            superadmin.is_staff = True
            superadmin.is_superuser = True
            superadmin.is_platform_super_admin = True
            superadmin.set_password(admin_password)
            superadmin.save()
            self.stdout.write(self.style.SUCCESS(f"Updated Super Admin: {admin_email} (Parol: {admin_password})"))

        # 2. Business Types
        retail_bt, _ = BusinessType.objects.get_or_create(
            code="retail_store",
            defaults={
                'name': "Do'kon / Chakana Savdo (Retail Store)",
                'description': "Chakana savdo do'konlari, oziq-ovqat va nooziq-ovqat savdosi, nasiya daftari va POS kassa.",
                'is_active': True,
            }
        )
        edu_bt, _ = BusinessType.objects.get_or_create(
            code="education_center",
            defaults={
                'name': "O'quv Markazi (Education Center)",
                'description': "Xususiy maktablar, o'quv markazlari, kurslar, to'garaklar va to'lovlar monitoringi.",
                'is_active': True,
            }
        )

        # 3. Modules Catalog
        # Retail Modules
        mod_rc, _ = Module.objects.get_or_create(
            code="retail_customers",
            defaults={
                'name': "Mijozlar Bazasi (Customers)",
                'category': "retail",
                'description': "Do'kon mijozlari profili, telefon raqamlari va kredit limitlari.",
                'is_system': True,
            }
        )
        mod_rd, _ = Module.objects.get_or_create(
            code="retail_debts",
            defaults={
                'name': "Nasiya Savdo / Qarz Daftari (Debts)",
                'category': "retail",
                'description': "Qarzlarni yozish, qisman/to'liq so'ndirish va moliyaviy audit jurnali.",
                'depends_on': mod_rc,
                'is_system': True,
            }
        )
        mod_ri, _ = Module.objects.get_or_create(
            code="retail_inventory",
            defaults={
                'name': "Ombor va Mahsulotlar (Inventory)",
                'category': "retail",
                'description': "Tovar qoldiqlari, narxlar, shtrix-kod va kam qolgan tovarlar monitoringi.",
                'is_system': False,
            }
        )
        mod_rp, _ = Module.objects.get_or_create(
            code="retail_pos",
            defaults={
                'name': "POS Kassa Savdosi (Sales POS)",
                'category': "retail",
                'description': "Kassir hisob-kitob oynasi, aralash to'lovlar (naqd, karta, nasiya).",
                'depends_on': mod_ri,
                'is_system': False,
            }
        )
        mod_rr, _ = Module.objects.get_or_create(
            code="retail_reports",
            defaults={
                'name': "Moliyaviy Hisobotlar (Financial Reports)",
                'category': "retail",
                'description': "Kassa tushumlari, muddati o'tgan qarzlar tahlili va kunlik smena hisoboti.",
                'depends_on': mod_rd,
                'is_system': False,
            }
        )
        mod_rm, _ = Module.objects.get_or_create(
            code="retail_reminders",
            defaults={
                'name': "Avtomatik Eslatmalar (Reminders)",
                'category': "retail",
                'description': "Qarz to'lov muddati yaqinlashganda avtomatik SMS/xabarnomalar.",
                'depends_on': mod_rd,
                'is_system': False,
            }
        )

        # Education Modules
        mod_es, _ = Module.objects.get_or_create(
            code="edu_students",
            defaults={
                'name': "O'quvchilar Bazasi (Students)",
                'category': "education",
                'description': "O'quvchilar profili, ota-onalar kontaktlari va qabul sanalari.",
                'is_system': True,
            }
        )
        mod_eg, _ = Module.objects.get_or_create(
            code="edu_groups",
            defaults={
                'name': "Guruhlar va Dars Jadvallari (Groups)",
                'category': "education",
                'description': "Kurs guruhlari, xonalar taqsimoti, dars kunlari va o'qituvchilar biriktiruvi.",
                'depends_on': mod_es,
                'is_system': True,
            }
        )
        mod_et, _ = Module.objects.get_or_create(
            code="edu_tuition",
            defaults={
                'name': "Oylik To'lovlar va Billing (Tuition)",
                'category': "education",
                'description': "Oylik to'lov kvitansiyalari generatsiyasi, to'lovlarni qabul qilish va chegirmalar.",
                'depends_on': mod_eg,
                'is_system': True,
            }
        )
        mod_ed, _ = Module.objects.get_or_create(
            code="edu_debts",
            defaults={
                'name': "O'quv To'lov Qarzlarini Nazorat Qilish (Debts)",
                'category': "education",
                'description': "To'lanmagan oylik to'lovlar, qarzdorlik muddatlari va eslatmalar.",
                'depends_on': mod_et,
                'is_system': True,
            }
        )
        mod_el, _ = Module.objects.get_or_create(
            code="edu_lms",
            defaults={
                'name': "Video Darslar va Materiallar (LMS)",
                'category': "education",
                'description': "Onlayn video darslar, taqdimotlar va konspektlar tarqatish.",
                'depends_on': mod_eg,
                'is_system': False,
            }
        )
        mod_eh, _ = Module.objects.get_or_create(
            code="edu_homework",
            defaults={
                'name': "Uyga Vazifalar va Baholash (Homework)",
                'category': "education",
                'description': "Vazifalar berish, o'quvchilar javoblarini qabul qilish va ustoz tekshiruvi.",
                'depends_on': mod_eg,
                'is_system': False,
            }
        )
        mod_ex, _ = Module.objects.get_or_create(
            code="edu_exams",
            defaults={
                'name': "Testlar va Imtihonlar (Exams)",
                'category': "education",
                'description': "Sinov testlari, oraliq/yakuniy imtihon ballari va reyting hisoboti.",
                'depends_on': mod_eg,
                'is_system': False,
            }
        )
        mod_er, _ = Module.objects.get_or_create(
            code="edu_reports",
            defaults={
                'name': "Akademik va Tushum Hisobotlari (Reports)",
                'category': "education",
                'description': "Davomat foizi, o'zlashtirish ko'rsatkichlari va oylik daromad prognozi.",
                'depends_on': mod_et,
                'is_system': False,
            }
        )

        # 4. Map Modules to Business Types
        # Retail mappings
        retail_modules = [
            (mod_rc, True, True),
            (mod_rd, True, True),
            (mod_ri, True, False),
            (mod_rp, True, False),
            (mod_rr, True, False),
            (mod_rm, False, False),
        ]
        for m, is_def, is_mand in retail_modules:
            BusinessTypeModule.objects.get_or_create(
                business_type=retail_bt,
                module=m,
                defaults={'is_default': is_def, 'is_mandatory': is_mand}
            )

        # Education mappings
        edu_modules = [
            (mod_es, True, True),
            (mod_eg, True, True),
            (mod_et, True, True),
            (mod_ed, True, True),
            (mod_el, True, False),
            (mod_eh, True, False),
            (mod_ex, False, False),
            (mod_er, True, False),
        ]
        for m, is_def, is_mand in edu_modules:
            BusinessTypeModule.objects.get_or_create(
                business_type=edu_bt,
                module=m,
                defaults={'is_default': is_def, 'is_mandatory': is_mand}
            )

        # 5. Connect existing organizations to BusinessType & Modules
        companies = Company.objects.all()
        for c in companies:
            if not c.business_type:
                c.business_type = retail_bt
                c.save(update_fields=['business_type'])
            # Ensure default modules are activated
            for m, is_def, _ in retail_modules:
                OrganizationModule.objects.get_or_create(
                    company=c,
                    module=m,
                    defaults={'is_enabled': is_def}
                )

        # Create demo Retail Store 1: Anor Supermarket (Chilonzor)
        retail_org1, created_r1 = Company.objects.get_or_create(
            name="Anor Supermarket (Chilonzor)",
            defaults={
                'business_type': retail_bt,
                'phone': "+998901112233",
                'address': "Toshkent shahri, Chilonzor 7-mavze",
                'currency': "UZS",
                'status': Company.STATUS_ACTIVE,
            }
        )
        for m, is_def, is_mand in retail_modules:
            OrganizationModule.objects.get_or_create(
                company=retail_org1,
                module=m,
                defaults={'is_enabled': is_def or is_mand}
            )
        CompanyMember.objects.get_or_create(
            company=retail_org1,
            user=superadmin,
            defaults={'role': CompanyMember.ROLE_SHOP_OWNER}
        )

        # Create demo Retail Store 2: Baraka Oziq-ovqat Do'koni (Yunusobod)
        retail_org2, created_r2 = Company.objects.get_or_create(
            name="Baraka Oziq-ovqat (Yunusobod)",
            defaults={
                'business_type': retail_bt,
                'phone': "+998934445566",
                'address': "Toshkent shahri, Yunusobod 12-mavze",
                'currency': "UZS",
                'status': Company.STATUS_ACTIVE,
            }
        )
        for m, is_def, is_mand in retail_modules:
            OrganizationModule.objects.get_or_create(
                company=retail_org2,
                module=m,
                defaults={'is_enabled': is_def or is_mand}
            )

        # Create demo education organization if none exists
        if not Company.objects.filter(business_type=edu_bt).exists():
            edu_org = Company.objects.create(
                name="Registon O'quv Markazi",
                business_type=edu_bt,
                phone="+998712003040",
                address="Toshkent, Navoiy ko'chasi 15-uy",
                currency="UZS",
                status=Company.STATUS_ACTIVE,
            )
            for m, is_def, _ in edu_modules:
                OrganizationModule.objects.create(
                    company=edu_org,
                    module=m,
                    is_enabled=is_def
                )
            CompanyMember.objects.create(
                company=edu_org,
                user=superadmin,
                role=CompanyMember.ROLE_SHOP_OWNER,
            )
            self.stdout.write(self.style.SUCCESS("Created demo Education Center organization: Registon O'quv Markazi"))

        # 6. Seed Debtors and Debts for Anor Supermarket
        from apps.debts.models import DebtCustomer, DebtRecord, RepaymentRecord, DebtLedger
        from apps.debts.services import create_debt_service, record_repayment_service
        from decimal import Decimal
        import datetime

        if not DebtCustomer.objects.filter(company=retail_org1).exists():
            c1 = DebtCustomer.objects.create(
                company=retail_org1,
                full_name="Akmal Rustamov",
                phone_number="+998901234567",
                address="Chilonzor 7, 14-uy, 22-xonadon",
                credit_limit=Decimal('5000000.00'),
                status=DebtCustomer.STATUS_ACTIVE,
                notes="Mahalla oqsoqoli, ishonchli doimiy xaridor"
            )
            c2 = DebtCustomer.objects.create(
                company=retail_org1,
                full_name="Dilshod Karimov",
                phone_number="+998939876543",
                address="Chilonzor 9, 5-uy",
                credit_limit=Decimal('10000000.00'),
                status=DebtCustomer.STATUS_ACTIVE,
                notes="Qurilish ustasi, har 15 kunda to'laydi"
            )
            c3 = DebtCustomer.objects.create(
                company=retail_org1,
                full_name="Zuhra Rahimova",
                phone_number="+998975554433",
                address="Chilonzor 8, 3-uy",
                credit_limit=Decimal('2000000.00'),
                status=DebtCustomer.STATUS_ACTIVE,
                notes="Maktab o'qituvchisi"
            )
            c4 = DebtCustomer.objects.create(
                company=retail_org1,
                full_name="Otabek Jo'rayev",
                phone_number="+998912223344",
                address="Chilonzor 7, 8-uy",
                credit_limit=Decimal('4000000.00'),
                status=DebtCustomer.STATUS_ACTIVE,
                notes="Tadbirkor"
            )

            # Issue realistic initial debts
            today = datetime.date.today()
            d1 = create_debt_service(
                company=retail_org1,
                customer=c1,
                amount=Decimal('850000.00'),
                description="Oziq-ovqat mahsulotlari (go'sht, yog', non)",
                recorded_by=superadmin,
                due_date=today + datetime.timedelta(days=15)
            )
            d2 = create_debt_service(
                company=retail_org1,
                customer=c2,
                amount=Decimal('1450000.00'),
                description="1 qop un (50kg), 5L yog', shakar va qandolat",
                recorded_by=superadmin,
                due_date=today + datetime.timedelta(days=10)
            )
            d3 = create_debt_service(
                company=retail_org1,
                customer=c3,
                amount=Decimal('320000.00'),
                description="Tozalash vositalari va bolalar shirinliklari",
                recorded_by=superadmin,
                due_date=today + datetime.timedelta(days=20)
            )
            d4 = create_debt_service(
                company=retail_org1,
                customer=c4,
                amount=Decimal('2100000.00'),
                description="Katta xarid: go'sht mahsulotlari va ichimliklar",
                recorded_by=superadmin,
                due_date=today + datetime.timedelta(days=7)
            )

            # Register partial repayments
            import uuid
            record_repayment_service(
                company=retail_org1,
                customer=c2,
                amount=Decimal('500000.00'),
                payment_method=RepaymentRecord.METHOD_CARD,
                idempotency_key=uuid.uuid4(),
                notes="Uzcard orqali qisman so'ndirildi",
                recorded_by=superadmin
            )
            record_repayment_service(
                company=retail_org1,
                customer=c1,
                amount=Decimal('200000.00'),
                payment_method=RepaymentRecord.METHOD_CASH,
                idempotency_key=uuid.uuid4(),
                notes="Naqd pulda qisman to'lov",
                recorded_by=superadmin
            )
            self.stdout.write(self.style.SUCCESS("Seeded retail debt customers and transactions for Anor Supermarket."))

        self.stdout.write(self.style.SUCCESS("IDROK AI Platform successfully seeded!"))

