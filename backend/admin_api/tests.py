from __future__ import annotations

from django.test import TestCase
from rest_framework.test import APIClient

from users.models import User


class AdminGuardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="Admin1234!",
            username="admin",
            display_name="Admin",
            role="admin",
        )
        self.normal = User.objects.create_user(
            email="normal@example.com",
            password="User1234!",
            username="normaluser",
            display_name="Normal",
            role="user",
        )

    def _login(self, email, password):
        resp = self.client.post(
            "/api/auth/login",
            {"email": email, "password": password},
            format="json",
        )
        token = resp.json()["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_admin_can_access_admin_novels(self):
        self._login("admin@example.com", "Admin1234!")
        resp = self.client.get("/api/admin/novels")
        self.assertEqual(resp.status_code, 200)

    def test_normal_user_forbidden(self):
        self._login("normal@example.com", "User1234!")
        resp = self.client.get("/api/admin/novels")
        self.assertEqual(resp.status_code, 403)

    def test_unauthenticated_forbidden(self):
        resp = self.client.get("/api/admin/novels")
        self.assertEqual(resp.status_code, 401)
