from decimal import Decimal
from rest_framework import serializers
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

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'category', 'is_active']


class EducationTeacherSerializer(serializers.ModelSerializer):
    groups_count = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = EducationTeacher
        fields = [
            'id',
            'name',
            'phone',
            'subject',
            'salary_type',
            'groups_count',
            'students_count',
            'is_active',
        ]

    def get_groups_count(self, obj):
        return obj.assigned_groups.filter(is_active=True).count()

    def get_students_count(self, obj):
        return EducationStudent.objects.filter(group__teacher=obj, is_active=True).count()


class EducationGroupSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = EducationGroup
        fields = [
            'id',
            'name',
            'course',
            'course_name',
            'teacher',
            'teacher_name',
            'room',
            'days',
            'time',
            'monthly_fee',
            'students_count',
            'is_active',
        ]

    def get_students_count(self, obj):
        return obj.enrolled_students.filter(is_active=True).count()


class EducationStudentSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = EducationStudent
        fields = [
            'id',
            'name',
            'phone',
            'parent_phone',
            'group',
            'group_name',
            'balance',
            'attendance_rate',
            'xp',
            'coins',
            'status',
            'is_active',
            'created_at',
        ]


class EducationCreateStudentSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=32)
    group_id = serializers.UUIDField(required=False, allow_null=True)
    initial_payment = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal('0.00'))


class EducationTuitionPaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = EducationTuitionPayment
        fields = [
            'id',
            'student',
            'student_name',
            'group',
            'group_name',
            'amount',
            'payment_method',
            'receipt_number',
            'notes',
            'created_at',
        ]


class EducationRecordPaymentSerializer(serializers.Serializer):
    student_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=EducationTuitionPayment.PAYMENT_CHOICES, default='cash')
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class EducationAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = EducationAttendance
        fields = [
            'id',
            'student',
            'student_name',
            'group',
            'group_name',
            'date',
            'status',
            'notes',
        ]


class EducationTimetableSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model = EducationTimetable
        fields = [
            'id',
            'group',
            'group_name',
            'day_of_week',
            'time',
            'room',
            'teacher',
            'teacher_name',
        ]


class EducationHomeworkSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = EducationHomework
        fields = [
            'id',
            'group',
            'group_name',
            'title',
            'description',
            'due_date',
            'xp_reward',
            'coins_reward',
            'is_active',
        ]


class EducationExamSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = EducationExam
        fields = [
            'id',
            'group',
            'group_name',
            'title',
            'exam_date',
            'room',
            'max_score',
            'is_active',
        ]


class EducationLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(required=False, allow_blank=True)
