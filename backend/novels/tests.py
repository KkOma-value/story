from __future__ import annotations

from django.test import TestCase
from rest_framework.test import APIClient

from novels.models import Novel


class NovelSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Novel.objects.create(
            title="测试小说",
            author="张三",
            category="玄幻",
            tags=["修真", "升级"],
            intro="这是一本测试小说",
        )

    def test_search_returns_list(self):
        resp = self.client.get("/api/novels/search", {"q": "测试"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()["data"]
        self.assertIn("items", data)
        self.assertIn("total", data)
        self.assertGreaterEqual(data["total"], 1)

    def test_search_no_results(self):
        resp = self.client.get("/api/novels/search", {"q": "不存在的关键词xyz"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"]["total"], 0)


class NovelDetailTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.novel = Novel.objects.create(
            title="详情测试",
            author="李四",
            category="都市",
            tags=["商战"],
            intro="详情介绍",
        )

    def test_get_detail(self):
        resp = self.client.get(f"/api/novels/{self.novel.id}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"]["title"], "详情测试")

    def test_detail_not_found(self):
        resp = self.client.get("/api/novels/00000000-0000-0000-0000-000000000000")
        self.assertEqual(resp.status_code, 404)
        self.assertFalse(resp.json()["success"])
