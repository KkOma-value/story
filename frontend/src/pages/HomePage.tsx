import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Novel } from '../types';
import { NovelCard } from '../components/NovelCard';
import { Hero } from '../components/Hero';

// Clean Icons
const FireIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

interface SectionProps {
  title: string;
  subTitle?: string;
  icon: React.ReactNode;
  iconColor: 'gold' | 'fire' | 'mystic';
  novels: Novel[];
  loading: boolean;
  moreLink?: string;
}

const Section: React.FC<SectionProps> = ({ title, subTitle, icon, iconColor, novels, loading, moreLink }) => {
  const navigate = useNavigate();

  // Simplified color mapping for Black-Gold theme
  const colorClasses = {
    gold: 'text-accent drop-shadow-sm',
    fire: 'text-action drop-shadow-sm',
    mystic: 'text-text-primary drop-shadow-sm',
  };

  return (
    <section className="mb-16 relative">
      {/* 标题栏 */}
      <div className="flex items-end justify-between mb-6 pb-2 border-b border-dark-border relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl bg-white border-2 border-organic-ink/10 shadow-sm ${colorClasses[iconColor]}`}>
            {icon}
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-organic-ink tracking-wider">{title}</h2>
            {subTitle && (
              <p className="text-sm text-organic-ink/50 mt-1 font-body font-bold tracking-wider">{subTitle}</p>
            )}
          </div>
        </div>
        {moreLink && (
          <button
            onClick={() => navigate(moreLink)}
            className="flex items-center gap-1 text-organic-ink/60 hover:text-organic-aqua transition-all duration-300 group px-4 py-2 bg-white border-2 border-organic-ink/10 rounded-full hover:shadow-[2px_2px_0px_#678983] hover:-translate-y-0.5"
          >
            <span className="text-sm font-bold tracking-wide">查看更多</span>
            <span className="transform group-hover:translate-x-0.5 transition-transform">
              <ChevronRightIcon />
            </span>
          </button>
        )}
      </div>

      {/* 内容区 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : novels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-organic-ink/50 bg-white/50 rounded-2xl border-2 border-dashed border-organic-ink/10">
          <p className="font-body text-sm font-bold">暂无记述</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {novels.map((novel, index) => (
            <div
              key={novel.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <NovelCard
                novel={novel}
                onClick={() => navigate(`/novels/${novel.id}`)}
                variant="default"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// 分类快捷入口 (极简风格)
const CategoryQuickLinks: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    { id: '玄幻', name: '太古玄幻', icon: '⚔️', desc: '万族争霸' },
    { id: '仙侠', name: '修真文明', icon: '🏔️', desc: '问道长生' },
    { id: '都市', name: '都市异能', icon: '🏙️', desc: '红尘炼心' },
    { id: '科幻', name: '星际科幻', icon: '🚀', desc: '机械飞升' },
    { id: '网游', name: '虚拟网游', icon: '🎮', desc: '数据封神' },
    { id: '历史', name: '历史架空', icon: '📜', desc: '乱世枭雄' },
  ];

  return (
    <section className="mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => navigate(`/category?cat=${cat.id}`)}
            className={`
              group relative flex flex-col items-center gap-2 p-5 rounded-3xl border-2 border-organic-ink/10 bg-white shadow-[4px_4px_0px_#E6DDC4]
              transition-all duration-300 cursor-pointer overflow-hidden
              hover:border-organic-aqua hover:shadow-[4px_4px_0px_#678983] hover:-translate-y-1 hover:-translate-x-1
            `}
          >
            <span className="relative z-10 text-3xl mb-2 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300 filter grayscale group-hover:grayscale-0">
              {cat.icon}
            </span>
            <div className="relative z-10 text-center">
              <h3 className="font-body font-bold text-base text-organic-ink tracking-wide">{cat.name}</h3>
              <p className="text-xs text-organic-ink/50 mt-1 font-bold tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                {cat.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const [personalized, setPersonalized] = useState<Novel[]>([]);
  const [hot, setHot] = useState<Novel[]>([]);
  const [latest, setLatest] = useState<Novel[]>([]);
  const [loading, setLoading] = useState({ personalized: true, hot: true, latest: true });

  useEffect(() => {
    // 加载推荐数据
    // 个性化推荐需要登录，失败时静默降级为热门推荐
    api.getRecommendations({ type: 'personalized', limit: 5 })
      .then((data) => setPersonalized(data))
      .catch(() => {
        // 未登录或失败时，使用热门推荐作为降级
        api.getRecommendations({ type: 'hot', limit: 5 })
          .then((data) => setPersonalized(data))
          .catch(() => setPersonalized([]));
      })
      .finally(() => setLoading((l) => ({ ...l, personalized: false })));

    api.getRecommendations({ type: 'hot', limit: 5 })
      .then((data) => setHot(data))
      .catch(() => console.error('加载热门推荐失败'))
      .finally(() => setLoading((l) => ({ ...l, hot: false })));

    api.getRecommendations({ type: 'latest', limit: 5 })
      .then((data) => setLatest(data))
      .catch(() => console.error('加载最新推荐失败'))
      .finally(() => setLoading((l) => ({ ...l, latest: false })));
  }, []);

  return (
    <div className="min-h-screen max-w-[1400px] mx-auto pt-6">
      <Hero />
      <div className="relative z-10 -mt-10 mb-16 px-4">
        <CategoryQuickLinks />
      </div>

      <Section

        title="道友机缘"
        subTitle="天道酬勤，为你精选"
        icon={<StarIcon />}
        iconColor="gold"
        novels={personalized}
        loading={loading.personalized}
      />
      <Section
        title="风云热榜"
        subTitle="诸天万界，谁主沉浮"
        icon={<FireIcon />}
        iconColor="fire"
        novels={hot}
        loading={loading.hot}
        moreLink="/ranking"
      />
      <Section
        title="初入仙途"
        subTitle="新书入库，潜力无限"
        icon={<ClockIcon />}
        iconColor="mystic"
        novels={latest}
        loading={loading.latest}
      />
    </div>
  );
};

