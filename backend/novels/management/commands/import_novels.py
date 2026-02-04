"""
数据导入命令：从 novels 表导入数据到 Django 的 novels_novel 表

用法：python manage.py import_novels
"""

import json
import logging

from django.core.management.base import BaseCommand
from django.db import connection, transaction

from novels.models import Novel

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '从 MySQL novels 表导入小说数据到 Django novels_novel 表'

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=500,
            help='批量插入大小'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='限制导入数量（0表示全部）'
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']
        limit = options['limit']

        self.stdout.write(self.style.NOTICE('Starting novel data import...'))

        # 检查目标表是否为空
        existing_count = Novel.objects.count()
        if existing_count > 0:
            self.stdout.write(self.style.WARNING(f'Target table already has {existing_count} records. Skipping import.'))
            return

        # 从 novels 表读取数据
        with connection.cursor() as cursor:
            query = """
                SELECT 
                    source_book_id, title, author, category, intro, tags_json,
                    favorites_count, views_proxy, status, updated_at, 
                    rating_count, avg_rating, created_at
                FROM novels
            """
            if limit > 0:
                query += f" LIMIT {limit}"
            
            cursor.execute(query)
            rows = cursor.fetchall()

        self.stdout.write(f'Found {len(rows)} novels to import')

        # 批量导入
        batch = []
        imported = 0

        for row in rows:
            (source_book_id, title, author, category, intro, tags_json,
             favorites_count, views_proxy, status, updated_at,
             rating_count, avg_rating, created_at) = row

            # 解析 tags
            tags = []
            if tags_json:
                try:
                    tags_data = json.loads(tags_json)
                    if isinstance(tags_data, dict) and 'tags' in tags_data:
                        tags = tags_data['tags'] if isinstance(tags_data['tags'], list) else []
                    elif isinstance(tags_data, list):
                        tags = tags_data
                except Exception:
                    pass

            # 映射状态
            novel_status = 'published'
            if status and 'deleted' in str(status).lower():
                novel_status = 'deleted'
            elif status and 'shelved' in str(status).lower():
                novel_status = 'shelved'

            batch.append(Novel(
                title=title or '未知标题',
                author=author or '未知作者',
                category=category or '其他',
                tags=tags,
                intro=intro or '',
                status=novel_status,
                views=views_proxy or 0,
                favorites_count=favorites_count or 0,
                rating_count=rating_count or 0,
                avg_rating=float(avg_rating) if avg_rating else 0.0,
            ))

            if len(batch) >= batch_size:
                with transaction.atomic():
                    Novel.objects.bulk_create(batch)
                imported += len(batch)
                self.stdout.write(f'Imported {imported} novels...')
                batch = []

        # 插入剩余数据
        if batch:
            with transaction.atomic():
                Novel.objects.bulk_create(batch)
            imported += len(batch)

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {imported} novels!'))
