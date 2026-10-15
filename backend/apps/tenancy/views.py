from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Company, CompanyMember
from .serializers import CompanySerializer, CompanyMemberSerializer, InviteMemberSerializer
from .permissions import HasShopAccess, IsShopOwner
from apps.identity.models import User

class CompanyListCreateView(APIView):
    """
    GET: List companies where the current user has membership.
    POST: Create a new shop. The creator atomically becomes Shop Owner.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'is_platform_super_admin', False):
            companies = Company.objects.filter(is_active=True)
        else:
            companies = Company.objects.filter(
                memberships__user=request.user,
                memberships__is_active=True,
                is_active=True
            ).distinct()
        return Response(CompanySerializer(companies, many=True).data)

    def post(self, request):
        serializer = CompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            company = serializer.save()
            CompanyMember.objects.create(
                company=company,
                user=request.user,
                role=CompanyMember.ROLE_SHOP_OWNER,
                is_active=True
            )
        return Response(CompanySerializer(company).data, status=status.HTTP_201_CREATED)

class CompanyDetailView(APIView):
    """Retrieve or update shop profile."""
    permission_classes = [IsAuthenticated, HasShopAccess]

    def get(self, request, company_id):
        return Response(CompanySerializer(request.company).data)

    def patch(self, request, company_id):
        # Only Shop Owner or Platform Super Admin can update shop profile
        if not IsShopOwner().has_permission(request, self):
            return Response(
                {"detail": "Only a Shop Owner can modify shop settings."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = CompanySerializer(request.company, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class CompanyMemberListCreateView(APIView):
    """List or invite staff members (Shop Manager, Cashier)."""
    permission_classes = [IsAuthenticated, HasShopAccess]

    def get(self, request, company_id):
        members = CompanyMember.objects.filter(
            company=request.company,
            is_active=True
        ).select_related('user')
        return Response(CompanyMemberSerializer(members, many=True).data)

    def post(self, request, company_id):
        if not IsShopOwner().has_permission(request, self):
            return Response(
                {"detail": "Only a Shop Owner can invite staff members."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        role = serializer.validated_data['role']
        full_name = serializer.validated_data.get('full_name', '')

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'full_name': full_name}
            )
            member, m_created = CompanyMember.objects.get_or_create(
                company=request.company,
                user=user,
                defaults={'role': role, 'is_active': True}
            )
            if not m_created:
                member.role = role
                member.is_active = True
                member.save()

        return Response(CompanyMemberSerializer(member).data, status=status.HTTP_201_CREATED)
