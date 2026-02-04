from __future__ import annotations

from django.test import TestCase

from core.pagination import paginate_queryset
from core.responses import api_ok, api_error


class PaginationTests(TestCase):
    def test_paginate_basic(self):
        items = list(range(25))
        result = paginate_queryset(items, page=1, page_size=10)
        self.assertEqual(len(result.items), 10)
        self.assertEqual(result.total, 25)
        self.assertEqual(result.page, 1)
        self.assertEqual(result.page_size, 10)

    def test_paginate_last_page(self):
        items = list(range(25))
        result = paginate_queryset(items, page=3, page_size=10)
        self.assertEqual(len(result.items), 5)
        self.assertEqual(result.page, 3)

    def test_paginate_out_of_range(self):
        items = list(range(5))
        result = paginate_queryset(items, page=99, page_size=10)
        self.assertEqual(result.page, 1)
        self.assertEqual(len(result.items), 5)


class ResponsesTests(TestCase):
    def test_api_ok(self):
        resp = api_ok({"foo": "bar"})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["success"])
        self.assertEqual(resp.data["data"]["foo"], "bar")

    def test_api_error(self):
        resp = api_error("Something failed", status=400)
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data["success"])
        self.assertEqual(resp.data["message"], "Something failed")
