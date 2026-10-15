from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.identity.models import User
from apps.tenancy.models import Company, CompanyMember

class TenancyManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(email="user1@idrok.uz", password="Password123!", full_name="User One")
        self.user2 = User.objects.create_user(email="user2@idrok.uz", password="Password123!", full_name="User Two")
        self.superadmin = User.objects.create_superuser(email="admin@idrok.uz", password="Password123!", full_name="Super Admin")

    def test_create_company_atomically_assigns_owner(self):
        """Creating a company atomically assigns the creator as Shop Owner."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            "/api/v1/companies",
            data={"name": "Chilonzor Savdo Markazi", "phone": "+998901234567"},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        company_id = response.data['id']

        member = CompanyMember.objects.filter(company_id=company_id, user=self.user1).first()
        self.assertIsNotNone(member)
        self.assertEqual(member.role, CompanyMember.ROLE_SHOP_OWNER)

    def test_owner_can_invite_cashier_and_manager(self):
        """Shop Owner can invite Shop Manager and Cashier."""
        company = Company.objects.create(name="Samarqand Non")
        CompanyMember.objects.create(company=company, user=self.user1, role=CompanyMember.ROLE_SHOP_OWNER)

        self.client.force_authenticate(user=self.user1)

        # Invite Cashier
        response = self.client.post(
            f"/api/v1/companies/{company.id}/members/invite",
            data={"email": "newcashier@idrok.uz", "role": "cashier", "full_name": "New Cashier"},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], "cashier")

        # Cashier cannot invite other members
        cashier_user = User.objects.get(email="newcashier@idrok.uz")
        self.client.force_authenticate(user=cashier_user)
        bad_response = self.client.post(
            f"/api/v1/companies/{company.id}/members/invite",
            data={"email": "another@idrok.uz", "role": "cashier"},
            format='json'
        )
        self.assertEqual(bad_response.status_code, status.HTTP_403_FORBIDDEN)
