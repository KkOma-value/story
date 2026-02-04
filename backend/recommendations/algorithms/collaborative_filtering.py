"""
协同过滤推荐算法实现

基于用户行为数据（收藏、评分）进行推荐：
1. Item-based CF: 根据用户历史喜欢的小说，推荐相似的小说
2. User-based CF: 根据相似用户的偏好，推荐其他用户喜欢的小说

使用 scikit-surprise 库进行矩阵分解和相似度计算
"""

from __future__ import annotations

import logging
from collections import defaultdict
from typing import TYPE_CHECKING

import numpy as np
import pandas as pd
from django.db import transaction
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix

if TYPE_CHECKING:
    from uuid import UUID

logger = logging.getLogger(__name__)


class CollaborativeFilterRecommender:
    """协同过滤推荐器"""

    def __init__(self, min_interactions: int = 2, top_k_similar: int = 20):
        """
        Args:
            min_interactions: 用户/物品最少需要的交互数才参与计算
            top_k_similar: 每个小说保留的最相似小说数量
        """
        self.min_interactions = min_interactions
        self.top_k_similar = top_k_similar
        
        # 数据矩阵
        self.user_item_matrix: csr_matrix | None = None
        self.user_ids: list[str] = []
        self.novel_ids: list[str] = []
        self.user_id_to_idx: dict[str, int] = {}
        self.novel_id_to_idx: dict[str, int] = {}
        
        # 相似度矩阵
        self.item_similarity: np.ndarray | None = None

    def load_interactions(self) -> pd.DataFrame:
        """从数据库加载用户交互数据"""
        from interactions.models import Favorite, Rating, ReadHistory
        
        interactions = []
        favorite_weight = 0.8
        rating_weight = 0.2
        read_weight = 0.5
        
        # 收藏数据 (权重 0.8)
        favorites = Favorite.objects.filter(deleted_at__isnull=True).values_list('user_id', 'novel_id')
        for user_id, novel_id in favorites:
            interactions.append({
                'user_id': str(user_id),
                'novel_id': str(novel_id),
                'score': favorite_weight
            })
        
        # 评分数据 (权重归一化到 0-1)
        ratings = Rating.objects.all().values_list('user_id', 'novel_id', 'score')
        for user_id, novel_id, score in ratings:
            interactions.append({
                'user_id': str(user_id),
                'novel_id': str(novel_id),
                'score': (score / 5.0) * rating_weight  # 归一化到0-1并加权
            })

        # 阅读历史数据（隐式正向反馈）
        history = ReadHistory.objects.all().values_list('user_id', 'novel_id')
        for user_id, novel_id in history:
            interactions.append({
                'user_id': str(user_id),
                'novel_id': str(novel_id),
                'score': read_weight
            })
        
        df = pd.DataFrame(interactions)
        
        if df.empty:
            logger.warning("No interaction data found")
            return df
        
        # 合并同一用户对同一小说的多次交互（取最大值）
        df = df.groupby(['user_id', 'novel_id'])['score'].max().reset_index()
        
        logger.info(f"Loaded {len(df)} interactions from {df['user_id'].nunique()} users and {df['novel_id'].nunique()} novels")
        
        return df

    def build_user_item_matrix(self, df: pd.DataFrame) -> bool:
        """构建用户-物品交互矩阵"""
        if df.empty:
            logger.warning("Empty dataframe, cannot build matrix")
            return False
        
        # 过滤低频用户和物品
        user_counts = df.groupby('user_id').size()
        novel_counts = df.groupby('novel_id').size()
        
        valid_users = user_counts[user_counts >= self.min_interactions].index
        valid_novels = novel_counts[novel_counts >= self.min_interactions].index
        
        df_filtered = df[df['user_id'].isin(valid_users) & df['novel_id'].isin(valid_novels)]
        
        if df_filtered.empty:
            logger.warning("No valid interactions after filtering")
            return False
        
        # 创建ID映射
        self.user_ids = df_filtered['user_id'].unique().tolist()
        self.novel_ids = df_filtered['novel_id'].unique().tolist()
        self.user_id_to_idx = {uid: i for i, uid in enumerate(self.user_ids)}
        self.novel_id_to_idx = {nid: i for i, nid in enumerate(self.novel_ids)}
        
        # 构建稀疏矩阵
        row_indices = df_filtered['user_id'].map(self.user_id_to_idx).values
        col_indices = df_filtered['novel_id'].map(self.novel_id_to_idx).values
        values = df_filtered['score'].values
        
        self.user_item_matrix = csr_matrix(
            (values, (row_indices, col_indices)),
            shape=(len(self.user_ids), len(self.novel_ids))
        )
        
        logger.info(f"Built user-item matrix: {self.user_item_matrix.shape}")
        return True

    def compute_item_similarity(self) -> np.ndarray:
        """计算物品相似度矩阵（Item-based CF）
        
        使用余弦相似度计算小说之间的相似性
        """
        if self.user_item_matrix is None:
            raise ValueError("Must build user-item matrix first")
        
        # 转置矩阵：从用户-物品变为物品-用户
        item_user_matrix = self.user_item_matrix.T.toarray()
        
        # 计算余弦相似度
        self.item_similarity = cosine_similarity(item_user_matrix)
        
        # 对角线置零（自己和自己的相似度不参与推荐）
        np.fill_diagonal(self.item_similarity, 0)
        
        logger.info(f"Computed item similarity matrix: {self.item_similarity.shape}")
        return self.item_similarity

    def get_similar_novels(self, novel_id: str, n: int = 10) -> list[tuple[str, float]]:
        """获取与指定小说最相似的N部小说
        
        Returns:
            List of (novel_id, similarity_score)
        """
        if self.item_similarity is None:
            return []
        
        if novel_id not in self.novel_id_to_idx:
            return []
        
        idx = self.novel_id_to_idx[novel_id]
        similarities = self.item_similarity[idx]
        
        # 获取top-N
        top_indices = np.argsort(similarities)[::-1][:n]
        
        results = []
        for i in top_indices:
            if similarities[i] > 0:
                results.append((self.novel_ids[i], float(similarities[i])))
        
        return results

    def recommend_for_user(self, user_id: str, n: int = 20) -> list[tuple[str, float]]:
        """为用户生成推荐列表（Item-based CF）
        
        基于用户已交互的小说，推荐相似的未交互小说
        
        Returns:
            List of (novel_id, score)
        """
        if self.user_item_matrix is None or self.item_similarity is None:
            return []
        
        if user_id not in self.user_id_to_idx:
            # 冷启动用户，返回空列表（外层会fallback到热门推荐）
            return []
        
        user_idx = self.user_id_to_idx[user_id]
        user_vector = self.user_item_matrix[user_idx].toarray().flatten()
        
        # 计算推荐分数：用户向量与物品相似度矩阵的加权和
        scores = self.item_similarity.T @ user_vector
        
        # 排除已交互的小说
        interacted_mask = user_vector > 0
        scores[interacted_mask] = -1
        
        # 获取top-N
        top_indices = np.argsort(scores)[::-1][:n]
        
        results = []
        for i in top_indices:
            if scores[i] > 0:
                results.append((self.novel_ids[i], float(scores[i])))
        
        return results

    def save_similarity_to_db(self):
        """将物品相似度矩阵保存到数据库"""
        from recommendations.models import NovelSimilarity
        from novels.models import Novel
        
        if self.item_similarity is None:
            logger.warning("No similarity matrix to save")
            return
        
        # 清除旧数据
        NovelSimilarity.objects.filter(algorithm='item_cf').delete()
        
        # 构建novel_id到Novel实例的映射
        novel_instances = {str(n.id): n for n in Novel.objects.filter(id__in=self.novel_ids)}
        
        # 保存top-K相似对
        batch = []
        for i, novel_a_id in enumerate(self.novel_ids):
            if novel_a_id not in novel_instances:
                continue
            
            similarities = self.item_similarity[i]
            top_indices = np.argsort(similarities)[::-1][:self.top_k_similar]
            
            for j in top_indices:
                if similarities[j] <= 0:
                    break
                
                novel_b_id = self.novel_ids[j]
                if novel_b_id not in novel_instances:
                    continue
                
                batch.append(NovelSimilarity(
                    novel_a=novel_instances[novel_a_id],
                    novel_b=novel_instances[novel_b_id],
                    similarity=float(similarities[j]),
                    algorithm='item_cf'
                ))
        
        # 批量插入
        if batch:
            with transaction.atomic():
                NovelSimilarity.objects.bulk_create(batch, batch_size=1000)
            logger.info(f"Saved {len(batch)} item-CF similarity records")

    def save_recommendations_to_db(self, n_recommendations: int = 20):
        """为所有用户计算推荐并保存到数据库"""
        from recommendations.models import RecommendationCache
        from novels.models import Novel
        from users.models import User
        
        # 清除旧数据
        RecommendationCache.objects.filter(algorithm='cf').delete()
        
        # 获取所有活跃用户
        all_users = User.objects.filter(status='active').values_list('id', flat=True)
        
        # Novel实例映射
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
                        algorithm='cf'
                    ))
            
            processed += 1
            if processed % 100 == 0:
                logger.info(f"Processed {processed} users")
        
        # 批量插入
        if batch:
            with transaction.atomic():
                RecommendationCache.objects.bulk_create(batch, batch_size=1000)
            logger.info(f"Saved {len(batch)} CF recommendation records for {processed} users")

    def run(self):
        """执行完整的协同过滤推荐计算流程"""
        logger.info("Starting Collaborative Filtering recommendation computation...")
        
        # 1. 加载交互数据
        df = self.load_interactions()
        if df.empty:
            logger.warning("No interactions, skipping CF computation")
            return
        
        # 2. 构建用户-物品矩阵
        if not self.build_user_item_matrix(df):
            logger.warning("Failed to build matrix, skipping CF computation")
            return
        
        # 3. 计算物品相似度
        self.compute_item_similarity()
        
        # 4. 保存相似度到数据库
        self.save_similarity_to_db()
        
        # 5. 为用户生成推荐并保存
        self.save_recommendations_to_db()
        
        logger.info("Collaborative Filtering computation completed!")
