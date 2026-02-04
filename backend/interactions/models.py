from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models

from novels.models import Novel


class Favorite(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	novel = models.ForeignKey(Novel, on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)
	deleted_at = models.DateTimeField(blank=True, null=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=["user", "novel"], name="uq_favorite_user_novel"),
		]
		indexes = [
			models.Index(fields=["user", "deleted_at"]),
			models.Index(fields=["novel", "deleted_at"]),
		]


class Rating(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	novel = models.ForeignKey(Novel, on_delete=models.CASCADE)
	score = models.PositiveSmallIntegerField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=["user", "novel"], name="uq_rating_user_novel"),
		]


class Comment(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	novel = models.ForeignKey(Novel, on_delete=models.CASCADE)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	user_display_name = models.CharField(max_length=64)

	content = models.TextField()
	parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="children")
	created_at = models.DateTimeField(auto_now_add=True)
	deleted = models.BooleanField(default=False)

	class Meta:
		indexes = [
			models.Index(fields=["novel", "created_at"]),
			models.Index(fields=["parent", "created_at"]),
		]


class ReadHistory(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	novel = models.ForeignKey(Novel, on_delete=models.CASCADE)
	last_read_at = models.DateTimeField(auto_now=True)
	last_chapter = models.CharField(max_length=255, blank=True, default="")
	progress = models.PositiveSmallIntegerField(default=0)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=["user", "novel"], name="uq_read_history_user_novel"),
		]
		indexes = [
			models.Index(fields=["user", "last_read_at"]),
		]
