"""Django management command to test serializer"""
from django.core.management.base import BaseCommand
from novels.models import Novel
from novels.serializers import NovelSerializer
import json


class Command(BaseCommand):
    help = 'Test novel serializer'

    def handle(self, *args, **options):
        novels = Novel.objects.filter(status='published').order_by('-updated_at')[:5]
        serializer = NovelSerializer(novels, many=True)
        data = serializer.data
        print(json.dumps(data, indent=2, ensure_ascii=False))
