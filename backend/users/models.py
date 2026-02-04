from __future__ import annotations

import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class UserRole(models.TextChoices):
	USER = "user", "user"
	ADMIN = "admin", "admin"


class UserStatus(models.TextChoices):
	ACTIVE = "active", "active"
	BANNED = "banned", "banned"
	PERMANENT_BANNED = "permanent_banned", "permanent_banned"
	DELETED = "deleted", "deleted"


class UserManager(BaseUserManager):
	use_in_migrations = True

	def _create_user(self, email: str, password: str | None, **extra_fields):
		if not email:
			raise ValueError("Email is required")
		email = self.normalize_email(email)

		user = self.model(email=email, **extra_fields)
		if password:
			user.set_password(password)
		else:
			user.set_unusable_password()
		user.save(using=self._db)
		return user

	def create_user(self, email: str, password: str | None = None, **extra_fields):
		extra_fields.setdefault("role", UserRole.USER)
		extra_fields.setdefault("status", UserStatus.ACTIVE)
		extra_fields.setdefault("is_staff", False)
		extra_fields.setdefault("is_superuser", False)
		extra_fields.setdefault("is_active", True)
		return self._create_user(email, password, **extra_fields)

	def create_superuser(self, email: str, password: str | None, **extra_fields):
		extra_fields.setdefault("role", UserRole.ADMIN)
		extra_fields.setdefault("status", UserStatus.ACTIVE)
		extra_fields.setdefault("is_staff", True)
		extra_fields.setdefault("is_superuser", True)
		extra_fields.setdefault("is_active", True)
		return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

	email = models.EmailField(unique=True)
	username = models.CharField(max_length=64)
	display_name = models.CharField(max_length=64)
	avatar_url = models.URLField(blank=True, null=True)
	bio = models.TextField(blank=True, null=True)

	role = models.CharField(max_length=16, choices=UserRole.choices, default=UserRole.USER)
	status = models.CharField(max_length=32, choices=UserStatus.choices, default=UserStatus.ACTIVE)

	is_staff = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True)
	date_joined = models.DateTimeField(auto_now_add=True)

	objects = UserManager()

	USERNAME_FIELD = "email"
	REQUIRED_FIELDS = ["username", "display_name"]

	def __str__(self) -> str:
		return f"{self.email} ({self.id})"

	@property
	def displayName(self) -> str:  # for admin/debug only
		return self.display_name
