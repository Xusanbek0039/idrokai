from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tenancy.permissions import HasShopAccess, IsCashier
from .models import Task
from .serializers import TaskSerializer

class TaskListCreateView(APIView):
    """List or create debt reminder and follow-up tasks."""
    permission_classes = [IsAuthenticated, HasShopAccess, IsCashier]

    def get(self, request, company_id):
        tasks = Task.objects.filter(company=request.company)
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        return Response(TaskSerializer(tasks, many=True).data)

    def post(self, request, company_id):
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = Task.objects.create(
            company=request.company,
            title=serializer.validated_data['title'],
            customer_id=serializer.validated_data.get('customer_id'),
            due_date=serializer.validated_data.get('due_date'),
        )
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
