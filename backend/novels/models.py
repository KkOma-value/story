from __future__ import annotations

import uuid

from django.db import models


class NovelStatus(models.TextChoices):
	PUBLISHED = "published", "published"
	SHELVED = "shelved", "shelved"
	DELETED = "deleted", "deleted"


class Novel(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

	title = models.CharField(max_length=255)
	author = models.CharField(max_length=255)
	category = models.CharField(max_length=64)
	tags = models.JSONField(default=list)
	intro = models.TextField()
	cover_url = models.URLField(blank=True, null=True)
	source_url = models.URLField(blank=True, null=True)

	status = models.CharField(max_length=16, choices=NovelStatus.choices, default=NovelStatus.PUBLISHED)

	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(auto_now_add=True)

	views = models.PositiveIntegerField(default=0)
	favorites_count = models.PositiveIntegerField(default=0)
	rating_count = models.PositiveIntegerField(default=0)
	avg_rating = models.FloatField(default=0)

	class Meta:
		indexes = [
			models.Index(fields=["status", "updated_at"]),
			models.Index(fields=["favorites_count"]),
			models.Index(fields=["views"]),
		]

	def __str__(self) -> str:
		return f"{self.title} ({self.id})"


class Chapter(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	novel = models.ForeignKey(Novel, on_delete=models.CASCADE, related_name="chapters")

	title = models.CharField(max_length=255)
	content = models.TextField(blank=True, default="")
	order = models.PositiveIntegerField(default=0)
	word_count = models.PositiveIntegerField(default=0)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["order"]
		indexes = [
			models.Index(fields=["novel", "order"]),
		]

	def __str__(self) -> str:
		return f"{self.novel.title} - {self.title}"
