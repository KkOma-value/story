"""
推荐算法单元测试
"""

from __future__ import annotations

from django.test import TestCase
from rest_framework.test import APIClient

from novels.models import Novel
from users.models import User
from interactions.models import Favorite, Rating, ReadHistory


class RecommendationsTests(TestCase):
    """推荐API基础测试"""
    
    def setUp(self):
        self.client = APIClient()
        # 创建测试小说
        for i in range(10):
            Novel.objects.create(
                title=f"测试小说{i}",
                author=f"作者{i}",
                category="玄幻" if i % 2 == 0 else "都市",
                tags=["修仙", "热血"] if i % 2 == 0 else ["都市", "爽文"],
                intro=f"这是测试小说{i}的简介，用于测试推荐算法",
                favorites_count=10 - i,
                views=100 - i * 10,
                avg_rating=float(i % 5),
            )

    def test_hot(self):
        """测试热门推荐"""
        resp = self.client.get("/api/recommendations/hot", {"limit": 5})
        self.assertEqual(resp.status_code, 200)
        items = resp.json()["data"]
        self.assertEqual(len(items), 5)
        # 验证按加权热度排序
        novels = list(Novel.objects.all())
        favs = [n.favorites_count for n in novels]
        views = [n.views for n in novels]
        ratings = [n.avg_rating for n in novels]
        fav_min, fav_max = min(favs), max(favs)
        view_min, view_max = min(views), max(views)
        rating_min, rating_max = min(ratings), max(ratings)

        def norm(value, min_v, max_v):
            if max_v == min_v:
                return 0
            return (value - min_v) / (max_v - min_v)

        scored = []
        for novel in novels:
            score = (
                0.5 * norm(novel.favorites_count, fav_min, fav_max)
                + 0.3 * norm(novel.views, view_min, view_max)
                + 0.2 * norm(novel.avg_rating, rating_min, rating_max)
            )
            scored.append((score, novel.title))

        expected_title = sorted(scored, key=lambda x: x[0], reverse=True)[0][1]
        self.assertEqual(items[0]["title"], expected_title)

    def test_latest(self):
        """测试最新推荐"""
        resp = self.client.get("/api/recommendations/latest", {"limit": 5})
        self.assertEqual(resp.status_code, 200)
        items = resp.json()["data"]
        self.assertEqual(len(items), 5)


class CollaborativeFilteringTests(TestCase):
    """协同过滤算法测试"""
    
    def setUp(self):
        # 创建测试用户
        self.user1 = User.objects.create_user(
            email="user1@test.com",
            password="testpass123",
            username="user1",
            display_name="User 1"
        )
        self.user2 = User.objects.create_user(
            email="user2@test.com",
            password="testpass123",
            username="user2",
            display_name="User 2"
        )
        
        # 创建测试小说
        self.novels = []
        for i in range(5):
            novel = Novel.objects.create(
                title=f"CF测试小说{i}",
                author=f"作者{i}",
                category="玄幻",
                tags=["测试"],
                intro=f"这是CF测试小说{i}的简介",
            )
            self.novels.append(novel)
        
        # 创建交互数据
        # User1 收藏了小说 0, 1, 2
        for i in range(3):
            Favorite.objects.create(user=self.user1, novel=self.novels[i])
        
        # User2 收藏了小说 0, 1, 3, 4
        for i in [0, 1, 3, 4]:
            Favorite.objects.create(user=self.user2, novel=self.novels[i])

        # 添加阅读历史（隐式信号）
        ReadHistory.objects.create(user=self.user1, novel=self.novels[3])

    def test_load_interactions(self):
        """测试加载交互数据"""
        from recommendations.algorithms.collaborative_filtering import CollaborativeFilterRecommender
        
        recommender = CollaborativeFilterRecommender(min_interactions=1)
        df = recommender.load_interactions()
        
        self.assertFalse(df.empty)
        self.assertEqual(len(df), 8)  # 7个收藏记录 + 1条阅读历史

    def test_build_matrix(self):
        """测试构建用户-物品矩阵"""
        from recommendations.algorithms.collaborative_filtering import CollaborativeFilterRecommender
        
        recommender = CollaborativeFilterRecommender(min_interactions=1)
        df = recommender.load_interactions()
        result = recommender.build_user_item_matrix(df)
        
        self.assertTrue(result)
        self.assertIsNotNone(recommender.user_item_matrix)

    def test_item_similarity(self):
        """测试物品相似度计算"""
        from recommendations.algorithms.collaborative_filtering import CollaborativeFilterRecommender
        
        recommender = CollaborativeFilterRecommender(min_interactions=1)
        df = recommender.load_interactions()
        recommender.build_user_item_matrix(df)
        similarity = recommender.compute_item_similarity()
        
        self.assertIsNotNone(similarity)
        # 小说0和小说1被两个用户同时收藏，应该有较高相似度
        novel0_id = str(self.novels[0].id)
        novel1_id = str(self.novels[1].id)
        if novel0_id in recommender.novel_id_to_idx and novel1_id in recommender.novel_id_to_idx:
            idx0 = recommender.novel_id_to_idx[novel0_id]
            idx1 = recommender.novel_id_to_idx[novel1_id]
            self.assertGreater(similarity[idx0][idx1], 0)


class ContentBasedTests(TestCase):
    """基于内容推荐算法测试"""
    
    def setUp(self):
        # 创建测试小说（不同分类和标签）
        Novel.objects.create(
            title="修仙大道",
            author="玄幻作者",
            category="玄幻",
            tags=["修仙", "热血", "升级"],
            intro="主角踏上修仙之路，历经磨难终成大道",
        )
        Novel.objects.create(
            title="仙路漫漫",
            author="玄幻作者2",
            category="玄幻",
            tags=["修仙", "冒险", "升级"],
            intro="修仙世界的冒险之旅，修炼成仙的艰辛历程",
        )
        Novel.objects.create(
            title="都市神医",
            author="都市作者",
            category="都市",
            tags=["医术", "都市", "爽文"],
            intro="天才神医重生都市，医术惊天下",
        )

    def test_load_novels(self):
        """测试加载小说数据"""
        from recommendations.algorithms.content_based import ContentBasedRecommender
        
        recommender = ContentBasedRecommender()
        texts = recommender.load_novels()
        
        self.assertEqual(len(texts), 3)

    def test_tfidf_vectorization(self):
        """测试TF-IDF向量化"""
        from recommendations.algorithms.content_based import ContentBasedRecommender
        
        recommender = ContentBasedRecommender(max_features=100)
        texts = recommender.load_novels()
        result = recommender.fit_transform(texts)
        
        self.assertTrue(result)
        self.assertIsNotNone(recommender.novel_vectors)

    def test_content_similarity(self):
        """测试内容相似度计算"""
        from recommendations.algorithms.content_based import ContentBasedRecommender
        
        recommender = ContentBasedRecommender(max_features=100)
        texts = recommender.load_novels()
        recommender.fit_transform(texts)
        similarity = recommender.compute_similarity_matrix()
        
        self.assertIsNotNone(similarity)
        # 两部玄幻修仙小说应该比都市小说更相似
        # (具体相似度值取决于文本内容)


class RecommendationCacheTests(TestCase):
    """推荐缓存API测试"""
    
    def setUp(self):
        self.client = APIClient()
        
        # 创建测试用户
        self.user = User.objects.create_user(
            email="cachetest@test.com",
            password="testpass123",
            username="cachetest",
            display_name="Cache Test User"
        )
        
        # 创建测试小说
        self.novels = []
        for i in range(5):
            novel = Novel.objects.create(
                title=f"缓存测试小说{i}",
                author=f"作者{i}",
                category="玄幻",
                tags=["测试"],
                intro=f"这是缓存测试小说{i}的简介",
                favorites_count=10 - i,
            )
            self.novels.append(novel)

    def test_personalized_without_cache(self):
        """测试无缓存时的个性化推荐（冷启动）"""
        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/recommendations/personalized", {"limit": 5})
        
        self.assertEqual(resp.status_code, 200)
        items = resp.json()["data"]
        # 冷启动应返回热门推荐
        self.assertGreater(len(items), 0)

    def test_personalized_with_cache(self):
        """测试有缓存时的个性化推荐"""
        from recommendations.models import RecommendationCache
        
        # 添加缓存数据
        RecommendationCache.objects.create(
            user=self.user,
            novel=self.novels[2],
            score=1.0,
            algorithm='cf'
        )
        RecommendationCache.objects.create(
            user=self.user,
            novel=self.novels[3],
            score=1.0,
            algorithm='content'
        )
        
        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/recommendations/personalized", {"limit": 5})
        
        self.assertEqual(resp.status_code, 200)
        items = resp.json()["data"]
        self.assertGreater(len(items), 0)
        # 混合推荐按加权分数排序
        self.assertEqual(items[0]["title"], "缓存测试小说2")
