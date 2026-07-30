"""API tests for visitor passes, buildings, and admin auth."""
from datetime import datetime, timezone

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from apps.buildings.models import Building
from apps.visitors.models import VisitorPass


class AdminAuthTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            password="Admin@12345",
            is_staff=True,
            is_superuser=True,
        )
        self.user = User.objects.create_user(username="guest", password="Guest@12345")

    def test_admin_login_success(self):
        res = self.client.post(
            "/api/admin/login/",
            {"username": "admin", "password": "Admin@12345"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data["tokens"])

    def test_non_staff_login_rejected(self):
        res = self.client.post(
            "/api/admin/login/",
            {"username": "guest", "password": "Guest@12345"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class VisitorPassTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            password="Admin@12345",
            is_staff=True,
            is_superuser=True,
        )
        self.payload = {
            "full_name": "Ada Lovelace",
            "mobile": "9876543210",
            "email": "ada@example.com",
            "department": "Computer Science",
            "purpose": "Lab visit",
            "destination": "CS Lab",
            "visit_time": "2026-08-01T10:00:00Z",
        }

    def test_public_can_create_pass(self):
        res = self.client.post("/api/visitor-pass/", self.payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["status"], "pending")
        self.assertEqual(VisitorPass.objects.count(), 1)

    def test_admin_can_approve(self):
        visitor = VisitorPass.objects.create(
            full_name=self.payload["full_name"],
            mobile=self.payload["mobile"],
            email=self.payload["email"],
            department=self.payload["department"],
            purpose=self.payload["purpose"],
            destination=self.payload["destination"],
            visit_time=datetime(2026, 8, 1, 10, 0, tzinfo=timezone.utc),
        )
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(f"/api/visitor-pass/{visitor.id}/approve/", {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        visitor.refresh_from_db()
        self.assertEqual(visitor.status, VisitorPass.Status.APPROVED)

    def test_list_requires_admin(self):
        res = self.client.get("/api/visitor-pass/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class BuildingTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            password="Admin@12345",
            is_staff=True,
            is_superuser=True,
        )
        Building.objects.create(
            name="Library",
            category="library",
            latitude="26.1418000",
            longitude="78.2001000",
        )

    def test_public_list(self):
        res = self.client.get("/api/buildings/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data["count"], 1)

    def test_categories(self):
        res = self.client.get("/api/buildings/categories/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(any(c["value"] == "library" for c in res.data))

    def test_admin_create(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(
            "/api/buildings/",
            {
                "name": "Gate 2",
                "category": "gate",
                "latitude": 26.14,
                "longitude": 78.19,
                "floor_count": 1,
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)