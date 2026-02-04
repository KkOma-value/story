"""
离线计算推荐结果的 Django Management Command

用法：
    python manage.py compute_recommendations                # 运行所有算法
    python manage.py compute_recommendations --algorithm=cf  # 只运行协同过滤
    python manage.py compute_recommendations --algorithm=content  # 只运行内容推荐

功能：
1. 计算协同过滤推荐（基于用户收藏/评分的物品相似度）
2. 计算内容推荐（基于小说简介/标签的TF-IDF相似度）
3. 将结果缓存到 RecommendationCache 表供API查询

建议定期执行（如每天凌晨）以更新推荐结果
"""

import logging
import time

from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '计算推荐结果并缓存到数据库'

    def add_arguments(self, parser):
        parser.add_argument(
            '--algorithm',
            type=str,
            default='all',
            choices=['cf', 'content', 'all'],
            help='选择要运行的算法: cf(协同过滤), content(内容推荐), all(全部)'
        )
        parser.add_argument(
            '--min-interactions',
            type=int,
            default=2,
            help='协同过滤：用户/物品最少需要的交互数'
        )
        parser.add_argument(
            '--top-k',
            type=int,
            default=20,
            help='每个小说保留的最相似小说数量'
        )
        parser.add_argument(
            '--n-recommendations',
            type=int,
            default=20,
            help='为每个用户生成的推荐数量'
        )

    def handle(self, *args, **options):
        algorithm = options['algorithm']
        min_interactions = options['min_interactions']
        top_k = options['top_k']
        n_recommendations = options['n_recommendations']

        self.stdout.write(self.style.NOTICE(f'Starting recommendation computation (algorithm={algorithm})...'))
        
        start_time = time.time()

        if algorithm in ('cf', 'all'):
            self._run_collaborative_filtering(min_interactions, top_k, n_recommendations)

        if algorithm in ('content', 'all'):
            self._run_content_based(top_k, n_recommendations)

        elapsed = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f'Recommendation computation completed in {elapsed:.2f}s'))

    def _run_collaborative_filtering(self, min_interactions, top_k, n_recommendations):
        """运行协同过滤推荐"""
        self.stdout.write(self.style.NOTICE('Running Collaborative Filtering...'))
        
        try:
            from recommendations.algorithms.collaborative_filtering import CollaborativeFilterRecommender
            
            recommender = CollaborativeFilterRecommender(
                min_interactions=min_interactions,
                top_k_similar=top_k
            )
            recommender.run()
            
            self.stdout.write(self.style.SUCCESS('Collaborative Filtering completed!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Collaborative Filtering failed: {e}'))
            logger.exception("CF computation error")

    def _run_content_based(self, top_k, n_recommendations):
        """运行内容推荐"""
        self.stdout.write(self.style.NOTICE('Running Content-Based Recommendation...'))
        
        try:
            from recommendations.algorithms.content_based import ContentBasedRecommender
            
            recommender = ContentBasedRecommender(
                max_features=3000,
                top_k_similar=top_k
            )
            recommender.run()
            
            self.stdout.write(self.style.SUCCESS('Content-Based Recommendation completed!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Content-Based Recommendation failed: {e}'))
            logger.exception("Content computation error")
