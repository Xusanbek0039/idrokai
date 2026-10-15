from decimal import Decimal
import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('tenancy', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(default='languages', max_length=128)),
                ('is_active', models.BooleanField(default=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_courses', to='tenancy.company')),
            ],
            options={
                'verbose_name': "O'quv Kursi",
                'verbose_name_plural': "O'quv Kurslari",
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='EducationTeacher',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('phone', models.CharField(max_length=32)),
                ('subject', models.CharField(max_length=128)),
                ('salary_type', models.CharField(default='50% ulush', max_length=64)),
                ('is_active', models.BooleanField(default=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_teachers', to='tenancy.company')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='teacher_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': "O'qituvchi",
                'verbose_name_plural': "O'qituvchilar",
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='EducationGroup',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('room', models.CharField(default='Xona 101', max_length=128)),
                ('days', models.CharField(default='Dushanba - Chorshanba - Juma', max_length=128)),
                ('time', models.CharField(default='14:00 - 16:00', max_length=64)),
                ('monthly_fee', models.DecimalField(decimal_places=2, default=Decimal('750000.00'), max_digits=12)),
                ('is_active', models.BooleanField(default=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_groups', to='tenancy.company')),
                ('course', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='groups', to='education.course')),
                ('teacher', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_groups', to='education.educationteacher')),
            ],
            options={
                'verbose_name': "O'quv Guruhi",
                'verbose_name_plural': "O'quv Guruhlari",
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='EducationStudent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('phone', models.CharField(db_index=True, max_length=32)),
                ('parent_phone', models.CharField(blank=True, max_length=32)),
                ('password_text', models.CharField(default='12345678', max_length=128)),
                ('balance', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12)),
                ('attendance_rate', models.PositiveIntegerField(default=100)),
                ('xp', models.PositiveIntegerField(default=0)),
                ('coins', models.PositiveIntegerField(default=0)),
                ('status', models.CharField(default='active', max_length=32)),
                ('is_active', models.BooleanField(default=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_students', to='tenancy.company')),
                ('group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='enrolled_students', to='education.educationgroup')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='student_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': "O'quvchi",
                'verbose_name_plural': "O'quvchilar",
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='EducationTuitionPayment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('payment_method', models.CharField(choices=[('cash', 'Naqd pul'), ('card', 'Plastik karta (UzCard/Humo)'), ('transfer', "Bank o'tkazmasi")], default='cash', max_length=32)),
                ('receipt_number', models.CharField(blank=True, db_index=True, max_length=64)),
                ('notes', models.TextField(blank=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_payments', to='tenancy.company')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='payments', to='education.educationgroup')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='education.educationstudent')),
            ],
            options={
                'verbose_name': "To'lov Kvitansiyasi",
                'verbose_name_plural': "To'lov Kvitansiyalari",
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='EducationTimetable',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('day_of_week', models.CharField(db_index=True, max_length=32)),
                ('time', models.CharField(max_length=64)),
                ('room', models.CharField(max_length=128)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_timetables', to='tenancy.company')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='timetables', to='education.educationgroup')),
                ('teacher', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='education.educationteacher')),
            ],
            options={
                'verbose_name': 'Dars Jadvali',
                'verbose_name_plural': 'Dars Jadvallari',
                'ordering': ['day_of_week', 'time'],
            },
        ),
        migrations.CreateModel(
            name='EducationHomework',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('due_date', models.CharField(max_length=64)),
                ('xp_reward', models.PositiveIntegerField(default=100)),
                ('coins_reward', models.PositiveIntegerField(default=15)),
                ('is_active', models.BooleanField(default=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_homeworks', to='tenancy.company')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='homeworks', to='education.educationgroup')),
            ],
            options={
                'verbose_name': 'Uyga Vazifa',
                'verbose_name_plural': 'Uyga Vazifalar',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='EducationExam',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=255)),
                ('exam_date', models.CharField(max_length=64)),
                ('room', models.CharField(max_length=128)),
                ('max_score', models.PositiveIntegerField(default=100)),
                ('is_active', models.BooleanField(default=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_exams', to='tenancy.company')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exams', to='education.educationgroup')),
            ],
            options={
                'verbose_name': 'Imtihon',
                'verbose_name_plural': 'Imtihonlar',
                'ordering': ['-exam_date'],
            },
        ),
        migrations.CreateModel(
            name='EducationAttendance',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField(db_index=True)),
                ('status', models.CharField(choices=[('present', 'Bor'), ('absent', "Yo'q"), ('late', 'Kechikdi')], default='present', max_length=16)),
                ('notes', models.CharField(blank=True, max_length=255)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education_attendances', to='tenancy.company')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendances', to='education.educationgroup')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendances', to='education.educationstudent')),
            ],
            options={
                'verbose_name': 'Davomat',
                'verbose_name_plural': 'Davomat Yozuvlari',
                'ordering': ['-date'],
            },
        ),
        migrations.AddConstraint(
            model_name='educationattendance',
            constraint=models.UniqueConstraint(fields=('student', 'group', 'date'), name='unique_student_group_attendance_date'),
        ),
    ]
