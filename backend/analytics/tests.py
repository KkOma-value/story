from __future__ import annotations

from django.test import TestCase
from rest_framework.test import APIClient

from users.models import User


class AnalyticsEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email="analytics_admin@example.com",
            password="Admin1234!",
            username="analyticsadmin",
            display_name="Analytics Admin",
            role="admin",
        )

    def _login(self):
        resp = self.client.post(
            "/api/auth/login",
            {"email": self.admin.email, "password": "Admin1234!"},
            format="json",
        )
        token = resp.json()["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_novel_analytics(self):
        self._login()
        resp = self.client.get("/api/admin/analytics/novels")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("items", resp.json()["data"])

    def test_user_analytics(self):
        self._login()
        resp = self.client.get("/api/admin/analytics/users")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("items", resp.json()["data"])
