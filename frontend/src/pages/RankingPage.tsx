import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { Novel } from '../types';
import type { RecommendationRequest } from '../types';

// 榜单类型 (玄幻风格)
const RANKING_TYPES = [
  { id: 'hot', name: '天榜', icon: '⚡', description: '震古烁今 · 风云人物', color: 'text-rank-gold' },
  { id: 'new', name: '地榜', icon: '🌱', description: '潜龙在渊 · 后起之秀', color: 'text-rank-silver' },
  { id: 'completed', name: '仙班', icon: '☁️', description: '证道飞升 · 完结经典', color: 'text-accent' },
  { id: 'rating', name: '道心', icon: '📜', description: '千锤百炼 · 口碑载道', color: 'text-action' },
  { id: 'monthly', name: '功德', icon: '📿', description: '众生愿力 · 月票排行', color: 'text-rank-bronze' },
  { id: 'reward', name: '财阀', icon: '💎', description: '富甲一方 · 灵石打赏', color: 'text-blue-400' },
];

// 排名徽章组件 (境界风格)
const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-yellow-500/20 blur-xl animate-pulse-slow" />
        <div className="w-10 h-10 rounded-full border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-700 to-yellow-900 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
          <span className="font-shan text-xl text-yellow-100 drop-shadow-md">壹</span>
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full border-2 border-gray-400/50 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-md">
        <span className="font-shan text-lg text-gray-100">贰</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-9 h-9 rounded-full border-2 border-orange-700/50 bg-gradient-to-br from-orange-800 to-orange-900 flex items-center justify-center shadow-md">
        <span className="font-shan text-lg text-orange-200">叁</span>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-text-muted bg-white/5 border border-white/5 text-sm">
      {rank}
    </div>
  );
};

// 排行榜项组件 (玉简风格)
const RankingItem: React.FC<{
  novel: Novel;
  rank: number;
  onClick: () => void;
}> = ({ novel, rank, onClick }) => (
  <div
    onClick={onClick}
    className={`
      group flex items-center gap-4 md:gap-6 p-4 rounded-lg border transition-all duration-300 cursor-pointer relative overflow-hidden
      ${rank <= 3 ? 'bg-dark-paper border-accent/20 hover:border-accent/50 hover:shadow-ink' : 'bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10'}
    `}
  >
    {/* 动态流光背景 */}
    {rank <= 3 && <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}

    {/* 排名 */}
    <div className="flex-shrink-0 w-16 flex justify-center relative z-10">
      <RankBadge rank={rank} />
    </div>

    {/* 封面 */}
    <div className="flex-shrink-0 w-16 h-24 rounded-sm overflow-hidden border border-white/10 relative group-hover:scale-105 transition-transform duration-300 shadow-md">
      <img
        alt={novel.title}
        src={novel.coverUrl || 'https://placehold.co/120x160/0F2631/E6EDF3?text=Book'}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
    </div>

    {/* 信息 */}
    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 relative z-10">
      <div className="flex items-center gap-3">
        <h3 className={`font-display font-bold text-lg truncate transition-colors ${rank <= 3 ? 'text-text-primary group-hover:text-accent' : 'text-text-secondary group-hover:text-text-primary'}`}>
          {novel.title}
        </h3>
        {novel.status === 'completed' && (
          <span className="px-1.5 py-0.5 rounded-[2px] bg-action/20 text-action text-[10px] border border-action/20 font-serif">完结</span>
        )}
      </div>

      <p className="text-text-secondary text-sm flex items-center gap-2 font-serif">
        <span className="text-text-muted group-hover:text-text-secondary transition-colors">{novel.author}</span>
        <span className="w-px h-3 bg-white/10" />
        <span className="text-text-muted group-hover:text-text-secondary transition-colors">{novel.category}</span>
      </p>

      <p className="text-text-muted text-xs line-clamp-1 hidden md:block opacity-60 font-serif italic">
        {novel.intro}
      </p>
    </div>

    {/* 热度指标 */}
    <div className="hidden sm:flex flex-col items-end gap-1 min-w-[100px] relative z-10">
      <span className={`font-mono font-bold text-lg ${rank <= 3 ? 'text-action drop-shadow-[0_0_8px_rgba(231,76,60,0.5)]' : 'text-text-secondary'}`}>
        {(novel.views / 10000).toFixed(1)}万
      </span>
      <span className="text-text-muted text-xs uppercase tracking-wider font-display">香火值</span>
    </div>
  </div>
);

export const RankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  const currentType = searchParams.get('type') || 'hot';

  useEffect(() => {
    setLoading(true);
    // 根据榜单类型获取不同的数据
    api.getRecommendations({ type: currentType as RecommendationRequest['type'], limit: 20 })
      .then((data) => setNovels(data))
      .catch(() => setNovels([]))
      .finally(() => setLoading(false));
  }, [currentType]);

  const currentRanking = RANKING_TYPES.find(r => r.id === currentType);

  return (
    <div className="animate-fade-in min-h-screen pb-10">
      {/* 页面标题 */}
      <div className="mb-10 text-center relative py-10">
        <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
          <span className="font-shan text-9xl text-accent">榜</span>
        </div>
        <h1 className="font-display text-5xl font-bold text-transparent bg-clip-text bg-mystic-gradient mb-4 tracking-wide relative z-10 drop-shadow-lg">
          鸿蒙金榜
        </h1>
        <p className="text-text-secondary text-lg font-serif tracking-widest relative z-10">
          诸天万界 · 谁主沉浮
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧侧边栏 - 榜单切换 */}
        <div className="lg:col-span-1 space-y-3 sticky top-24 self-start">
          {RANKING_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSearchParams({ type: type.id })}
              className={`
                w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 cursor-pointer group hover:pl-6
                ${currentType === type.id
                  ? 'bg-white/10 border-accent/50 text-text-primary shadow-glow-purple'
                  : 'bg-transparent border-transparent text-text-muted hover:bg-white/5'
                }
              `}
            >
              <span className={`text-2xl filter ${currentType !== type.id && 'grayscale opacity-50'} group-hover:grayscale-0 group-hover:opacity-100 transition-all`}>
                {type.icon}
              </span>
              <div className="text-left">
                <div className={`font-display font-bold text-lg tracking-widest ${currentType === type.id ? type.color : 'text-text-secondary'}`}>
                  {type.name}
                </div>
                <div className="text-[10px] text-text-muted opacity-60 font-serif tracking-wider">
                  {type.description.split('·')[0]}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 右侧列表 */}
        <div className="lg:col-span-3">
          {/* 当前榜单Header */}
          <div className="mb-8 p-8 rounded-xl bg-dark-paper border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] group-hover:bg-accent/10 transition-colors" />

            <div className="relative z-10 flex items-center gap-6">
              <span className="text-6xl animate-bounce-slow filter drop-shadow-md">{currentRanking?.icon}</span>
              <div>
                <h2 className="font-display text-3xl font-bold text-text-primary mb-2 tracking-widest">
                  {currentRanking?.name}
                </h2>
                <p className="text-text-secondary font-serif">{currentRanking?.description}</p>
              </div>
              <div className="ml-auto flex flex-col items-end text-right hidden sm:flex">
                <span className="text-xs text-text-muted uppercase tracking-widest mb-1">Update</span>
                <span className="font-mono text-accent">每日寅时 · 天道发布</span>
              </div>
            </div>
          </div>

          {/* 列表内容 */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Spin size="large" />
            </div>
          ) : novels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-text-muted bg-white/5 border border-dashed border-white/10 rounded-lg">
              <span className="font-shan text-4xl mb-4 text-text-muted/30">空</span>
              <p className="text-lg font-serif">暂无上榜记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {novels.map((novel, index) => (
                <div
                  key={novel.id}
                  className="animate-fade-in-right"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <RankingItem
                    novel={novel}
                    rank={index + 1}
                    onClick={() => navigate(`/novels/${novel.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
