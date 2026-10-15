from rest_framework import serializers
from .models import User

class UserMembershipSerializer(serializers.Serializer):
    company_id = serializers.UUIDField(source='company.id')
    company_name = serializers.CharField(source='company.name')
    role = serializers.CharField()

class AuthUserSerializer(serializers.ModelSerializer):
    memberships = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'phone_number',
            'is_platform_super_admin',
            'memberships',
        ]

    def get_memberships(self, obj):
        memberships = obj.company_memberships.select_related('company').filter(company__is_active=True)
        return UserMembershipSerializer(memberships, many=True).data

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
