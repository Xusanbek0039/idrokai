from rest_framework import serializers
from .models import Company, CompanyMember
from apps.identity.models import User

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'phone',
            'address',
            'currency',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CompanyMemberSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = CompanyMember
        fields = [
            'id',
            'user_id',
            'email',
            'full_name',
            'role',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'user_id', 'email', 'full_name', 'created_at']

class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=[
        (CompanyMember.ROLE_SHOP_MANAGER, 'Shop Manager'),
        (CompanyMember.ROLE_CASHIER, 'Cashier'),
    ])
    full_name = serializers.CharField(required=False, allow_blank=True)
