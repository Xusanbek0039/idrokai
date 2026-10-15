from django.urls import path
from .views import (
    EducationLoginView,
    EducationDashboardView,
    EducationStudentListView,
    EducationGroupListView,
    EducationTeacherListView,
    EducationTuitionListView,
    EducationRecordPaymentView,
    EducationTimetableListView,
    EducationAttendanceView,
    EducationHomeworkView,
    EducationExamView,
    EducationGamificationView,
)

app_name = 'education'

urlpatterns = [
    path('auth/login/', EducationLoginView.as_view(), name='login'),
    path('dashboard/', EducationDashboardView.as_view(), name='dashboard'),
    path('students/', EducationStudentListView.as_view(), name='students'),
    path('groups/', EducationGroupListView.as_view(), name='groups'),
    path('teachers/', EducationTeacherListView.as_view(), name='teachers'),
    path('tuition/', EducationTuitionListView.as_view(), name='tuition'),
    path('tuition/record/', EducationRecordPaymentView.as_view(), name='record_payment'),
    path('timetable/', EducationTimetableListView.as_view(), name='timetable'),
    path('attendance/', EducationAttendanceView.as_view(), name='attendance'),
    path('homework/', EducationHomeworkView.as_view(), name='homework'),
    path('exams/', EducationExamView.as_view(), name='exams'),
    path('gamification/', EducationGamificationView.as_view(), name='gamification'),
]
