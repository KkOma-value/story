"""
基于内容的推荐算法实现

使用小说的文本特征（简介、标签、分类）进行推荐：
1. 使用 jieba 对中文简介进行分词
2. 使用 TF-IDF 向量化小说特征
3. 计算余弦相似度找到相似小说
4. 基于用户历史偏好构建用户画像，推荐相似内容

适用场景：
- 冷启动：新小说没有交互数据时
- 内容匹配：推荐与用户已读小说内容相似的作品
"""

from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

import jieba
import numpy as np
from django.db import transaction
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

if TYPE_CHECKING:
    from uuid import UUID

logger = logging.getLogger(__name__)


class ContentBasedRecommender:
    """基于内容的推荐器"""

    def __init__(self, max_features: int = 3000, top_k_similar: int = 20):
        """
        Args:
            max_features: TF-IDF最大特征数
            top_k_similar: 每个小说保留的最相似小说数量
        """
        self.max_features = max_features
        self.top_k_similar = top_k_similar
        
        self.tfidf_vectorizer: TfidfVectorizer | None = None
        self.novel_vectors: np.ndarray | None = None
        self.novel_ids: list[str] = []
        self.novel_id_to_idx: dict[str, int] = {}
        self.similarity_matrix: np.ndarray | None = None

    def _tokenize_chinese(self, text: str) -> str:
        """中文分词处理"""
        # 清理文本
        text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9]', ' ', text)
        # jieba分词
        tokens = jieba.cut(text)
        return ' '.join(tokens)

    def _build_novel_text(self, novel) -> str:
        """构建小说的完整文本特征"""
        parts = []
        
        # 标题（权重高，重复3次）
        if novel.title:
            parts.extend([novel.title] * 3)
        
        # 分类（权重高，重复3次）
        if novel.category:
            parts.extend([novel.category] * 3)
        
        # 标签（权重中等，重复2次）
        if novel.tags:
            for tag in novel.tags:
                parts.extend([tag] * 2)
        
        # 简介
        if novel.intro:
            parts.append(novel.intro)
        
        # 作者
        if novel.author:
            parts.append(novel.author)
        
        full_text = ' '.join(parts)
        return self._tokenize_chinese(full_text)

    def load_novels(self):
        """从数据库加载所有已发布小说"""
        from novels.models import Novel
        
        novels = Novel.objects.filter(status='published').order_by('id')
        
        self.novel_ids = []
        texts = []
        
        for novel in novels:
            self.novel_ids.append(str(novel.id))
            texts.append(self._build_novel_text(novel))
        
        self.novel_id_to_idx = {nid: i for i, nid in enumerate(self.novel_ids)}
        
        logger.info(f"Loaded {len(self.novel_ids)} novels for content analysis")
        return texts

    def fit_transform(self, texts: list[str]) -> bool:
        """向量化所有小说文本"""
        if not texts:
            logger.warning("No texts to vectorize")
            return False
        
        # 创建TF-IDF向量器
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            min_df=2,  # 至少出现在2个文档中
            max_df=0.8,  # 不超过80%的文档
            ngram_range=(1, 2),  # 支持1-gram和2-gram
        )
        
        try:
            self.novel_vectors = self.tfidf_vectorizer.fit_transform(texts).toarray()
            logger.info(f"Created TF-IDF vectors: {self.novel_vectors.shape}")
            return True
        except Exception as e:
            logger.error(f"Failed to create TF-IDF vectors: {e}")
            return False

    def compute_similarity_matrix(self):
        """计算小说间的余弦相似度矩阵"""
        if self.novel_vectors is None:
            raise ValueError("Must fit_transform first")
        
        self.similarity_matrix = cosine_similarity(self.novel_vectors)
        
        # 对角线置零
        np.fill_diagonal(self.similarity_matrix, 0)
        
        logger.info(f"Computed content similarity matrix: {self.similarity_matrix.shape}")
        return self.similarity_matrix

    def get_similar_novels(self, novel_id: str, n: int = 10) -> list[tuple[str, float]]:
        """获取与指定小说内容最相似的N部小说
        
        Returns:
            List of (novel_id, similarity_score)
        """
        if self.similarity_matrix is None:
            return []
        
        if novel_id not in self.novel_id_to_idx:
            return []
        
        idx = self.novel_id_to_idx[novel_id]
        similarities = self.similarity_matrix[idx]
        
        top_indices = np.argsort(similarities)[::-1][:n]
        
        results = []
        for i in top_indices:
            if similarities[i] > 0:
                results.append((self.novel_ids[i], float(similarities[i])))
        
        return results

    def recommend_for_user(self, user_id: str, n: int = 20) -> list[tuple[str, float]]:
        """基于用户历史偏好推荐（Content-Based）
        
        构建用户画像：聚合用户交互过的小说向量
        推荐与用户画像最相似的未交互小说
        
        Returns:
            List of (novel_id, score)
        """
        from interactions.models import Favorite, Rating, ReadHistory
        
        if self.novel_vectors is None:
            return []
        
        favorite_weight = 0.8
        rating_weight = 0.2
        read_weight = 0.5

        weights_by_novel: dict[str, float] = {}

        favorites = Favorite.objects.filter(user_id=user_id, deleted_at__isnull=True).values_list('novel_id', flat=True)
        for novel_id in favorites:
            key = str(novel_id)
            weights_by_novel[key] = max(weights_by_novel.get(key, 0.0), favorite_weight)

        ratings = Rating.objects.filter(user_id=user_id).values_list('novel_id', 'score')
        for novel_id, score in ratings:
            key = str(novel_id)
            weighted_score = (score / 5.0) * rating_weight
            weights_by_novel[key] = max(weights_by_novel.get(key, 0.0), weighted_score)

        history = ReadHistory.objects.filter(user_id=user_id).values_list('novel_id', flat=True)
        for novel_id in history:
            key = str(novel_id)
            weights_by_novel[key] = max(weights_by_novel.get(key, 0.0), read_weight)

        if not weights_by_novel:
            # 冷启动用户
            return []
        
        # 构建用户画像向量（已交互小说向量的加权平均）
        user_vector = np.zeros(self.novel_vectors.shape[1])
        total_weight = 0.0
        for novel_id, weight in weights_by_novel.items():
            if novel_id in self.novel_id_to_idx:
                idx = self.novel_id_to_idx[novel_id]
                user_vector += self.novel_vectors[idx] * weight
                total_weight += weight

        if total_weight == 0:
            return []

        user_vector /= total_weight
        
        # 计算用户画像与所有小说的相似度
        scores = cosine_similarity([user_vector], self.novel_vectors)[0]
        
        # 排除已交互的小说
        for novel_id in weights_by_novel:
            if novel_id in self.novel_id_to_idx:
                scores[self.novel_id_to_idx[novel_id]] = -1
        
        # 获取top-N
        top_indices = np.argsort(scores)[::-1][:n]
        
        results = []
        for i in top_indices:
            if scores[i] > 0:
                results.append((self.novel_ids[i], float(scores[i])))
        
        return results

    def save_feature_vectors_to_db(self):
        """将小说特征向量保存到数据库"""
        from recommendations.models import NovelFeatureVector
        from novels.models import Novel
        
        if self.novel_vectors is None:
            logger.warning("No vectors to save")
            return
        
        # 清除旧数据
        NovelFeatureVector.objects.all().delete()
        
        novel_instances = {str(n.id): n for n in Novel.objects.filter(id__in=self.novel_ids)}
        
        batch = []
        for i, novel_id in enumerate(self.novel_ids):
            if novel_id not in novel_instances:
                continue
            
            # 稀疏表示：只保存非零元素
            vector = self.novel_vectors[i]
            sparse_dict = {int(j): float(v) for j, v in enumerate(vector) if v > 0}
            
            batch.append(NovelFeatureVector(
                novel=novel_instances[novel_id],
                vector_data=sparse_dict
            ))
        
        if batch:
            with transaction.atomic():
                NovelFeatureVector.objects.bulk_create(batch, batch_size=500)
            logger.info(f"Saved {len(batch)} feature vectors")

    def save_similarity_to_db(self):
        """将内容相似度矩阵保存到数据库"""
        from recommendations.models import NovelSimilarity
        from novels.models import Novel
        
        if self.similarity_matrix is None:
            logger.warning("No similarity matrix to save")
            return
        
        # 清除旧数据
        NovelSimilarity.objects.filter(algorithm='content').delete()
        
        novel_instances = {str(n.id): n for n in Novel.objects.filter(id__in=self.novel_ids)}
        
        batch = []
        for i, novel_a_id in enumerate(self.novel_ids):
            if novel_a_id not in novel_instances:
                continue
            
            similarities = self.similarity_matrix[i]
            top_indices = np.argsort(similarities)[::-1][:self.top_k_similar]
            
            for j in top_indices:
                if similarities[j] <= 0.1:  # 相似度阈值
                    break
                
                novel_b_id = self.novel_ids[j]
                if novel_b_id not in novel_instances:
                    continue
                
                batch.append(NovelSimilarity(
                    novel_a=novel_instances[novel_a_id],
                    novel_b=novel_instances[novel_b_id],
                    similarity=float(similarities[j]),
                    algorithm='content'
                ))
        
        if batch:
            with transaction.atomic():
                NovelSimilarity.objects.bulk_create(batch, batch_size=1000)
            logger.info(f"Saved {len(batch)} content similarity records")

    def save_recommendations_to_db(self, n_recommendations: int = 20):
        """为所有用户计算内容推荐并保存到数据库"""
        from recommendations.models import RecommendationCache
        from novels.models import Novel
        from users.models import User
        
        # 清除旧数据
        RecommendationCache.objects.filter(algorithm='content').delete()
        
        all_users = User.objects.filter(status='active').values_list('id', flat=True)
        novel_instances = {str(n.id): n for n in Novel.objects.filter(status='published')}
        user_instances = {str(u.id): u for u in User.objects.filter(status='active')}
        
        batch = []
        processed = 0
        
        for user_id in all_users:
            user_id_str = str(user_id)
            recommendations = self.recommend_for_user(user_id_str, n_recommendations)
            
            for novel_id, score in recommendations:
                if novel_id in novel_instances and user_id_str in user_instances:
                    batch.append(RecommendationCache(
                        user=user_instances[user_id_str],
                        novel=novel_instances[novel_id],
                        score=score,
                        algorithm='content'
                    ))
            
            processed += 1
            if processed % 100 == 0:
                logger.info(f"Processed {processed} users")
        
        if batch:
            with transaction.atomic():
                RecommendationCache.objects.bulk_create(batch, batch_size=1000)
            logger.info(f"Saved {len(batch)} content recommendation records for {processed} users")

    def run(self):
        """执行完整的内容推荐计算流程"""
        logger.info("Starting Content-Based recommendation computation...")
        
        # 1. 加载小说数据
        texts = self.load_novels()
        if not texts:
            logger.warning("No novels to process")
            return
        
        # 2. TF-IDF向量化
        if not self.fit_transform(texts):
            logger.warning("Failed to vectorize, skipping content computation")
            return
        
        # 3. 计算相似度矩阵
        self.compute_similarity_matrix()
        
        # 4. 保存特征向量
        self.save_feature_vectors_to_db()
        
        # 5. 保存相似度
        self.save_similarity_to_db()
        
        # 6. 为用户生成推荐并保存
        self.save_recommendations_to_db()
        
        logger.info("Content-Based recommendation computation completed!")
