from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models

from novels.models import Novel


class RecommendationCache(models.Model):
    """用户个性化推荐缓存表
    
    存储离线计算的推荐结果，API直接查询此表返回推荐
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendation_cache')
    novel = models.ForeignKey(Novel, on_delete=models.CASCADE, related_name='recommended_to')
    score = models.FloatField(help_text="推荐分数，值越大越推荐")
    algorithm = models.CharField(max_length=32, help_text="算法类型: cf, content, hybrid")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recommendation_cache'
        indexes = [
            models.Index(fields=['user', 'algorithm', '-score']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'novel', 'algorithm'], name='uq_rec_user_novel_algo'),
        ]

    def __str__(self) -> str:
        return f"Recommend {self.novel.title} to User {self.user_id} (score={self.score:.3f})"


class NovelSimilarity(models.Model):
    """小说相似度矩阵缓存
    
    存储小说间的相似度，用于 Item-CF 和 Content-Based 推荐
    只存储相似度较高的 top-N 对，避免存储全量矩阵
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    novel_a = models.ForeignKey(Novel, on_delete=models.CASCADE, related_name='similarities_as_a')
    novel_b = models.ForeignKey(Novel, on_delete=models.CASCADE, related_name='similarities_as_b')
    similarity = models.FloatField(help_text="相似度分数，范围0-1")
    algorithm = models.CharField(max_length=32, help_text="算法类型: item_cf, content")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'novel_similarity'
        indexes = [
            models.Index(fields=['novel_a', 'algorithm', '-similarity']),
            models.Index(fields=['novel_b', 'algorithm']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['novel_a', 'novel_b', 'algorithm'], name='uq_sim_novels_algo'),
        ]

    def __str__(self) -> str:
        return f"{self.novel_a.title} ~ {self.novel_b.title} ({self.similarity:.3f})"


class NovelFeatureVector(models.Model):
    """小说特征向量缓存
    
    存储小说的TF-IDF向量，用于Content-Based推荐
    向量以JSON格式存储（稀疏表示）
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    novel = models.OneToOneField(Novel, on_delete=models.CASCADE, related_name='feature_vector')
    vector_data = models.JSONField(help_text="稀疏向量: {index: value, ...}")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'novel_feature_vector'

    def __str__(self) -> str:
        return f"Vector for {self.novel.title}"
