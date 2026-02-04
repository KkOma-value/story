"""测试序列化器修复"""
import os
import sys
import django

# 设置Django环境
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from novels.models import Novel
from novels.serializers import NovelSerializer
import json

# 获取前5条数据
novels = Novel.objects.filter(status='published').order_by('-updated_at')[:5]

# 序列化
serializer = NovelSerializer(novels, many=True)
data = serializer.data

# 输出格式化的JSON
print(json.dumps(data, indent=2, ensure_ascii=False))
