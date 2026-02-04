from __future__ import annotations

import csv
import json
import uuid
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import connection

from novels.models import Novel


def _parse_int(value: str | None, default: int = 0) -> int:
    if value is None:
        return default
    value = str(value).strip()
    if not value:
        return default
    try:
        return int(float(value))
    except ValueError:
        return default


def _parse_datetime(value: str | None) -> datetime | None:
    if value is None:
        return None
    value = str(value).strip()
    if not value:
        return None

    # Common formats in the dataset
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            pass

    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _stable_uuid_from_source_id(source_book_id: str) -> uuid.UUID:
    # Deterministic ID so repeated imports update the same record.
    return uuid.uuid5(uuid.NAMESPACE_URL, f"story:novel:{source_book_id}")


class Command(BaseCommand):
    help = "Import novels from backend/sql/novels_mysql.csv into the current Django database (SQLite by default)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            default=str(Path("backend/sql/novels_mysql.csv")),
            help="Path to novels CSV (default: backend/sql/novels_mysql.csv)",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Bulk upsert batch size (default: 500)",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Only import first N rows (0 = no limit)",
        )
        parser.add_argument(
            "--truncate",
            action="store_true",
            help="Delete existing Novel rows before import",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["path"]).resolve()
        batch_size: int = options["batch_size"]
        limit: int = options["limit"]
        truncate: bool = options["truncate"]

        if not csv_path.exists():
            raise CommandError(f"CSV not found: {csv_path}")

        if truncate:
            self.stdout.write(self.style.WARNING("Deleting existing Novel rows..."))
            Novel.objects.all().delete()

        imported = 0
        buffer: list[Novel] = []

        update_fields = [
            "title",
            "author",
            "category",
            "tags",
            "intro",
            "cover_url",
            "source_url",
            "status",
            "views",
            "favorites_count",
            "rating_count",
            "avg_rating",
        ]

        def flush():
            nonlocal imported
            if not buffer:
                return

            # Upsert by deterministic UUID primary key.
            if connection.features.supports_update_conflicts and connection.features.supports_update_conflicts_with_target:
                Novel.objects.bulk_create(
                    buffer,
                    batch_size=len(buffer),
                    update_conflicts=True,
                    unique_fields=["id"],
                    update_fields=update_fields,
                )
            else:
                for item in buffer:
                    defaults = {field: getattr(item, field) for field in update_fields}
                    Novel.objects.update_or_create(id=item.id, defaults=defaults)
            imported += len(buffer)
            buffer.clear()

        self.stdout.write(f"Importing novels from {csv_path} ...")

        with csv_path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            required = {"source_book_id", "title", "author", "category", "intro"}
            if not required.issubset(set(reader.fieldnames or [])):
                raise CommandError(f"CSV header missing required columns: {sorted(required)}")

            for row in reader:
                if limit and imported + len(buffer) >= limit:
                    break

                source_book_id = (row.get("source_book_id") or "").strip()
                if not source_book_id:
                    continue

                deterministic_id = _stable_uuid_from_source_id(source_book_id)

                category = (row.get("category") or "").strip()[:64]
                subcategory = (row.get("subcategory") or "").strip()[:64]

                # The MySQL CSV stores a JSON object in tags_json; the Django app expects a list of strings.
                tags: list[str] = []
                if category:
                    tags.append(category)
                if subcategory and subcategory != category:
                    tags.append(subcategory)

                # Try to extract some tags from tags_json if it's a JSON array.
                raw_tags_json = (row.get("tags_json") or "").strip()
                if raw_tags_json:
                    try:
                        parsed = json.loads(raw_tags_json)
                        if isinstance(parsed, list):
                            tags.extend([str(x).strip() for x in parsed if str(x).strip()])
                    except json.JSONDecodeError:
                        pass

                novel = Novel(
                    id=deterministic_id,
                    title=(row.get("title") or "").strip()[:255],
                    author=(row.get("author") or "").strip()[:255],
                    category=category,
                    tags=tags,
                    intro=(row.get("intro") or "").strip(),
                    cover_url=None,
                    source_url=(row.get("source_url") or "").strip() or None,
                    status=(row.get("status") or "published").strip()[:16] or "published",
                    views=_parse_int(row.get("views_proxy"), default=0),
                    favorites_count=_parse_int(row.get("favorites_count"), default=0),
                    rating_count=_parse_int(row.get("rating_count"), default=0),
                    avg_rating=float(row.get("avg_rating") or 0) if str(row.get("avg_rating") or "").strip() else 0.0,
                )

                # We cannot directly set updated_at/created_at because the model uses auto_now/auto_now_add.
                # However, we still parse the value so it's easy to adapt later if needed.
                _ = _parse_datetime(row.get("updated_at"))

                buffer.append(novel)

                if len(buffer) >= batch_size:
                    flush()
                    self.stdout.write(f"Imported {imported} ...")

            flush()

        self.stdout.write(self.style.SUCCESS(f"Done. Imported/updated {imported} novels."))
