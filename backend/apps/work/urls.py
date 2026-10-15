from django.urls import path
from .views import TaskListCreateView

app_name = 'work'

urlpatterns = [
    path('companies/<uuid:company_id>/tasks', TaskListCreateView.as_view(), name='task-list-create'),
]
