import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.common.models import UUIDModel, TimeStampedModel
from apps.tenancy.models import Company

class Course(UUIDModel, TimeStampedModel):
    """O'quv kursi yo'nalishi (masalan: General English, IELTS, Dasturlash)."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_courses',
        db_index=True
    )
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=128, default='languages')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "O'quv Kursi"
        verbose_name_plural = "O'quv Kurslari"
        ordering = ['name']

    def __str__(self):
        return self.name


class EducationTeacher(UUIDModel, TimeStampedModel):
    """Markaz o'qituvchilar shtati."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_teachers',
        db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teacher_profile'
    )
    name = models.CharField(max_length=255, db_index=True)
    phone = models.CharField(max_length=32)
    subject = models.CharField(max_length=128)
    salary_type = models.CharField(max_length=64, default='50% ulush')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "O'qituvchi"
        verbose_name_plural = "O'qituvchilar"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.subject})"


class EducationGroup(UUIDModel, TimeStampedModel):
    """O'quv guruhi."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_groups',
        db_index=True
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='groups'
    )
    name = models.CharField(max_length=255, db_index=True)
    teacher = models.ForeignKey(
        EducationTeacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_groups'
    )
    room = models.CharField(max_length=128, default='Xona 101')
    days = models.CharField(max_length=128, default='Dushanba - Chorshanba - Juma')
    time = models.CharField(max_length=64, default='14:00 - 16:00')
    monthly_fee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('750000.00'))
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "O'quv Guruhi"
        verbose_name_plural = "O'quv Guruhlari"
        ordering = ['name']

    def __str__(self):
        return self.name


class EducationStudent(UUIDModel, TimeStampedModel):
    """Markaz o'quvchisi."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_students',
        db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profile'
    )
    name = models.CharField(max_length=255, db_index=True)
    phone = models.CharField(max_length=32, db_index=True)
    parent_phone = models.CharField(max_length=32, blank=True)
    group = models.ForeignKey(
        EducationGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enrolled_students'
    )
    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Ijobiy son to'langan balans, manfiy son qarzdorlikni bildiradi"
    )
    attendance_rate = models.PositiveIntegerField(default=100)
    xp = models.PositiveIntegerField(default=0)
    coins = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=32, default='active')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "O'quvchi"
        verbose_name_plural = "O'quvchilar"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.phone})"


class EducationTuitionPayment(UUIDModel, TimeStampedModel):
    """O'qish to'lovi qabul qilish kvitansiyasi."""
    PAYMENT_CASH = 'cash'
    PAYMENT_CARD = 'card'
    PAYMENT_TRANSFER = 'transfer'

    PAYMENT_CHOICES = [
        (PAYMENT_CASH, 'Naqd pul'),
        (PAYMENT_CARD, 'Plastik karta (UzCard/Humo)'),
        (PAYMENT_TRANSFER, "Bank o'tkazmasi"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_payments',
        db_index=True
    )
    student = models.ForeignKey(
        EducationStudent,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    group = models.ForeignKey(
        EducationGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=32, choices=PAYMENT_CHOICES, default=PAYMENT_CASH)
    receipt_number = models.CharField(max_length=64, blank=True, db_index=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "To'lov Kvitansiyasi"
        verbose_name_plural = "To'lov Kvitansiyalari"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.name} - {self.amount} UZS ({self.receipt_number})"


class EducationAttendance(UUIDModel, TimeStampedModel):
    """Kunlik dars davomati."""
    STATUS_PRESENT = 'present'
    STATUS_ABSENT = 'absent'
    STATUS_LATE = 'late'

    STATUS_CHOICES = [
        (STATUS_PRESENT, 'Bor'),
        (STATUS_ABSENT, "Yo'q"),
        (STATUS_LATE, 'Kechikdi'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_attendances',
        db_index=True
    )
    student = models.ForeignKey(
        EducationStudent,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    group = models.ForeignKey(
        EducationGroup,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PRESENT)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "Davomat"
        verbose_name_plural = "Davomat Yozuvlari"
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'group', 'date'],
                name='unique_student_group_attendance_date'
            )
        ]
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.name} - {self.group.name} - {self.date} ({self.status})"


class EducationTimetable(UUIDModel, TimeStampedModel):
    """Haftalik dars jadvali bandi."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_timetables',
        db_index=True
    )
    group = models.ForeignKey(
        EducationGroup,
        on_delete=models.CASCADE,
        related_name='timetables'
    )
    day_of_week = models.CharField(max_length=32, db_index=True) # Dushanba, Seshanba...
    time = models.CharField(max_length=64)
    room = models.CharField(max_length=128)
    teacher = models.ForeignKey(
        EducationTeacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Dars Jadvali"
        verbose_name_plural = "Dars Jadvallari"
        ordering = ['day_of_week', 'time']

    def __str__(self):
        return f"{self.group.name} - {self.day_of_week} {self.time} ({self.room})"


class EducationHomework(UUIDModel, TimeStampedModel):
    """Uyga vazifa."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_homeworks',
        db_index=True
    )
    group = models.ForeignKey(
        EducationGroup,
        on_delete=models.CASCADE,
        related_name='homeworks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.CharField(max_length=64)
    xp_reward = models.PositiveIntegerField(default=100)
    coins_reward = models.PositiveIntegerField(default=15)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Uyga Vazifa"
        verbose_name_plural = "Uyga Vazifalar"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.group.name})"


class EducationExam(UUIDModel, TimeStampedModel):
    """Imtihon yoki sinov testi."""
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='education_exams',
        db_index=True
    )
    group = models.ForeignKey(
        EducationGroup,
        on_delete=models.CASCADE,
        related_name='exams'
    )
    title = models.CharField(max_length=255)
    exam_date = models.CharField(max_length=64)
    room = models.CharField(max_length=128)
    max_score = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Imtihon"
        verbose_name_plural = "Imtihonlar"
        ordering = ['-exam_date']

    def __str__(self):
        return f"{self.title} ({self.group.name})"
