from __future__ import annotations

from django.test import TestCase
from rest_framework.test import APIClient

from users.models import User


class AuthEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_send_email_code_ok(self):
        resp = self.client.post(
            "/api/auth/email-code",
            {"email": "test@example.com", "purpose": "register"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        self.assertTrue(data["data"]["sent"])

    def test_send_email_code_missing_purpose(self):
        resp = self.client.post(
            "/api/auth/email-code",
            {"email": "test@example.com"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.json()["success"])

    def test_register_login_logout(self):
        from django.core.cache import cache

        email = "new@example.com"
        code = "123456"
        cache.set(f"email_code:register:{email}", code, timeout=300)

        resp = self.client.post(
            "/api/auth/register",
            {
                "email": email,
                "username": "newuser",
                "displayName": "New User",
                "code": code,
                "password": "Password123!",
                "confirmPassword": "Password123!",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["success"])
        user_id = resp.json()["data"]["userId"]
        self.assertTrue(user_id)

        resp = self.client.post(
            "/api/auth/login",
            {"email": email, "password": "Password123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        token = data["data"]["token"]
        self.assertTrue(token)
        self.assertEqual(data["data"]["user"]["email"], email)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = self.client.post("/api/auth/logout")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["success"])

    def test_login_invalid_credentials(self):
        resp = self.client.post(
            "/api/auth/login",
            {"email": "noexist@example.com", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)
        self.assertFalse(resp.json()["success"])


class UsersMeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="me@example.com",
            password="Test1234!",
            username="meuser",
            display_name="Me User",
        )

    def _login(self):
        resp = self.client.post(
            "/api/auth/login",
            {"email": self.user.email, "password": "Test1234!"},
            format="json",
        )
        token = resp.json()["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_get_me(self):
        self._login()
        resp = self.client.get("/api/users/me")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"]["email"], self.user.email)

    def test_update_me(self):
        self._login()
        resp = self.client.put(
            "/api/users/me",
            {"displayName": "New Name"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"]["displayName"], "New Name")

    def test_change_password(self):
        self._login()
        resp = self.client.put(
            "/api/users/me/password",
            {
                "oldPassword": "Test1234!",
                "newPassword": "NewPass5678!",
                "confirmPassword": "NewPass5678!",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["success"])
