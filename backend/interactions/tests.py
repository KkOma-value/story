from __future__ import annotations

from django.test import TestCase
from rest_framework.test import APIClient

from novels.models import Novel
from users.models import User


class FavoriteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="fav@example.com",
            password="Pass1234!",
            username="favuser",
            display_name="Fav User",
        )
        self.novel = Novel.objects.create(
            title="收藏测试",
            author="作者A",
            category="玄幻",
            tags=[],
            intro="简介",
        )

    def _login(self):
        resp = self.client.post(
            "/api/auth/login",
            {"email": self.user.email, "password": "Pass1234!"},
            format="json",
        )
        token = resp.json()["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_favorite_toggle(self):
        self._login()
        resp = self.client.post(f"/api/novels/{self.novel.id}/favorite")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["success"])

        resp = self.client.delete(f"/api/novels/{self.novel.id}/favorite")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["success"])


class RatingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="rate@example.com",
            password="Pass1234!",
            username="rateuser",
            display_name="Rate User",
        )
        self.novel = Novel.objects.create(
            title="评分测试",
            author="作者B",
            category="都市",
            tags=[],
            intro="简介",
        )

    def _login(self):
        resp = self.client.post(
            "/api/auth/login",
            {"email": self.user.email, "password": "Pass1234!"},
            format="json",
        )
        token = resp.json()["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_rate_novel(self):
        self._login()
        resp = self.client.put(
            f"/api/novels/{self.novel.id}/rating",
            {"score": 5},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["success"])

    def test_rate_invalid_score(self):
        self._login()
        resp = self.client.put(
            f"/api/novels/{self.novel.id}/rating",
            {"score": 10},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.json()["success"])


class CommentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="comment@example.com",
            password="Pass1234!",
            username="commentuser",
            display_name="Comment User",
        )
        self.novel = Novel.objects.create(
            title="评论测试",
            author="作者C",
            category="武侠",
            tags=[],
            intro="简介",
        )

    def _login(self):
        resp = self.client.post(
            "/api/auth/login",
            {"email": self.user.email, "password": "Pass1234!"},
            format="json",
        )
        token = resp.json()["data"]["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_create_comment(self):
        self._login()
        resp = self.client.post(
            f"/api/novels/{self.novel.id}/comments",
            {"content": "好评！", "parentId": None},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["data"]["commentId"])

    def test_list_comments_public(self):
        resp = self.client.get(f"/api/novels/{self.novel.id}/comments")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("items", resp.json()["data"])
