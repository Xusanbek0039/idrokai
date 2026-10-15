from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_user_id = serializers.UUIDField(source='assigned_to.id', allow_null=True, required=False)

    class Meta:
        model = Task
        fields = [
            'id',
            'company_id',
            'title',
            'customer_id',
            'assigned_to_user_id',
            'due_date',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'company_id', 'created_at', 'updated_at']
