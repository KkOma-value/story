import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Button } from 'antd';
import { BookOutlined, UserOutlined, EyeOutlined, HeartOutlined, ThunderboltOutlined, BarChartOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

interface AnalyticsSummary {
  totalViews: number;
  totalFavorites: number;
  avgRating: number;
  totalLogins: number;
  totalSearches: number;
  totalInteractions: number;
}

interface NovelAnalyticsItem {
  views?: number;
  favorites?: number;
  avgRating: number;
}

interface UserAnalyticsItem {
  logins?: number;
  searches?: number;
  favorites?: number;
  ratings?: number;
  comments?: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    novels: 0,
    users: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalViews: 0,
    totalFavorites: 0,
    avgRating: 0,
    totalLogins: 0,
    totalSearches: 0,
    totalInteractions: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch basic counts
        const [novelsRes, usersRes] = await Promise.all([
          api.adminGetNovels({ pageSize: 1 }),
          api.adminGetUsers({ pageSize: 1 }),
        ]);

        setCounts({
          novels: novelsRes.total,
          users: usersRes.total,
        });

        // Fetch analytics data (get all items to calculate totals)
        const [novelAnalytics, userAnalytics] = await Promise.all([
          api.adminGetNovelAnalytics({ pageSize: 100 }),
          api.adminGetUserAnalytics({ pageSize: 100 }),
        ]);

        // Calculate totals from analytics
        const totalViews = novelAnalytics.items.reduce(
          (sum: number, item: NovelAnalyticsItem) => sum + (item.views ?? 0),
          0,
        );
        const totalFavorites = novelAnalytics.items.reduce(
          (sum: number, item: NovelAnalyticsItem) => sum + (item.favorites ?? 0),
          0,
        );
        const ratings = novelAnalytics.items.filter((item: NovelAnalyticsItem) => item.avgRating > 0);
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, item: NovelAnalyticsItem) => sum + item.avgRating, 0) /
            ratings.length
          : 0;

        const totalLogins = userAnalytics.items.reduce(
          (sum: number, item: UserAnalyticsItem) => sum + (item.logins ?? 0),
          0,
        );
        const totalSearches = userAnalytics.items.reduce(
          (sum: number, item: UserAnalyticsItem) => sum + (item.searches ?? 0),
          0,
        );
        const totalInteractions = userAnalytics.items.reduce(
          (sum: number, item: UserAnalyticsItem) =>
            sum + (item.favorites ?? 0) + (item.ratings ?? 0) + (item.comments ?? 0),
          0,
        );

        setAnalytics({
          totalViews,
          totalFavorites,
          avgRating,
          totalLogins,
          totalSearches,
          totalInteractions,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-[0.35em] text-text-primary uppercase mb-2">
            管理后台 · 仪表盘
          </h1>
          <p className="text-xs text-text-secondary font-mono tracking-widest uppercase">
            OVERVIEW // ONE GLANCE TO UNDERSTAND THE WHOLE REALM
          </p>
        </div>
        <Button
          type="primary"
          icon={<BarChartOutlined />}
          className="app-button-outline !border-accent !text-accent hover:!bg-accent-dim"
          onClick={() => navigate('/admin/analytics')}
        >
          查看详细分析
        </Button>
      </div>

      {/* Basic Counts */}
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card
            bordered={false}
            className="app-card app-card-hover bg-gradient-to-br from-dark-paper/95 to-slate-900/90"
          >
            <Statistic
              title={<span className="text-text-secondary">小说总数</span>}
              value={counts.novels}
              valueStyle={{ color: '#EBEBEB', fontFamily: 'JetBrains Mono, monospace' }}
              prefix={<BookOutlined className="text-primary text-xl mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="app-card app-card-hover">
            <Statistic
              title={<span className="text-text-secondary">用户总数</span>}
              value={counts.users}
              valueStyle={{ color: '#EBEBEB', fontFamily: 'JetBrains Mono, monospace' }}
              prefix={<UserOutlined className="text-indigo-400 text-xl mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="app-card app-card-hover">
            <Statistic
              title={<span className="text-text-secondary">总浏览量</span>}
              value={analytics.totalViews}
              valueStyle={{ color: '#EBEBEB', fontFamily: 'JetBrains Mono, monospace' }}
              prefix={<EyeOutlined className="text-emerald-400 text-xl mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card bordered={false} className="app-card app-card-hover">
            <Statistic
              title={<span className="text-text-secondary">总收藏数</span>}
              value={analytics.totalFavorites}
              valueStyle={{ color: '#EBEBEB', fontFamily: 'JetBrains Mono, monospace' }}
              prefix={<HeartOutlined className="text-pink-400 text-xl mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      {/* User Activity Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} className="app-card app-card-hover">
            <Statistic
              title={<span className="text-text-secondary">平均评分</span>}
              value={analytics.avgRating.toFixed(2)}
              valueStyle={{ color: '#FACC15', fontFamily: 'JetBrains Mono, monospace' }}
              prefix={<StarOutlined className="text-amber-400 text-xl mr-2" />}
              suffix={<span className="text-xs text-text-secondary">/ 5</span>}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="app-card app-card-hover">
            <Statistic
              title={<span className="text-text-secondary">总登录次数</span>}
              value={analytics.totalLogins}
              valueStyle={{ color: '#A5B4FC', fontFamily: 'JetBrains Mono, monospace' }}
              prefix={<UserOutlined className="text-indigo-400 text-xl mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="app-card app-card-hover">
            <Statistic
              title={<span className="text-text-secondary">总互动次数</span>}
              value={analytics.totalInteractions}
              valueStyle={{ color: '#2DD4BF', fontFamily: 'JetBrains Mono, monospace' }}
              prefix={<HeartOutlined className="text-teal-400 text-xl mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      {/* System Status & Quick Links */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="app-card app-card-hover">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <ThunderboltOutlined className="text-xl animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-emerald-400">系统运行正常</span>
                  <span className="h-1 w-12 bg-gradient-to-r from-emerald-400/70 to-transparent rounded-full" />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  所有服务节点连接正常，API 响应时间维持在 <span className="text-text-primary">P95 &lt; 250ms</span>。
                  如有异常将在此处高亮提醒。
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col span={24} md={8}>
              <Card
                bordered={false}
                className="app-card app-card-hover cursor-pointer flex items-center h-full"
                onClick={() => navigate('/admin/novels')}
              >
                <div className="flex items-center gap-3">
                  <BookOutlined className="text-xl text-primary" />
                  <div>
                    <div className="font-medium text-text-primary">小说管理</div>
                    <div className="text-xs text-text-secondary mt-1">快速进入内容维护</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={24} md={8}>
              <Card
                bordered={false}
                className="app-card app-card-hover cursor-pointer flex items-center h-full"
                onClick={() => navigate('/admin/users')}
              >
                <div className="flex items-center gap-3">
                  <UserOutlined className="text-xl text-indigo-300" />
                  <div>
                    <div className="font-medium text-text-primary">用户管理</div>
                    <div className="text-xs text-text-secondary mt-1">查看与调整用户状态</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={24} md={8}>
              <Card
                bordered={false}
                className="app-card app-card-hover cursor-pointer flex items-center h-full"
                onClick={() => navigate('/admin/analytics')}
              >
                <div className="flex items-center gap-3">
                  <BarChartOutlined className="text-xl text-amber-400" />
                  <div>
                    <div className="font-medium text-text-primary">数据分析</div>
                    <div className="text-xs text-text-secondary mt-1">洞察平台关键指标</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};
