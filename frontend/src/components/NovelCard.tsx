import React from 'react';
import type { Novel } from '../types';

// Ink Icons -> Organic Theme
const FireIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

interface Props {
  novel: Novel;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'horizontal';
}

// 默认竖版卡片
const DefaultCard: React.FC<Props> = ({ novel, onClick }) => (
  <div
    onClick={onClick}
    className="group flex flex-col gap-3 cursor-pointer w-full bg-white border-2 border-organic-ink/10 shadow-[4px_4px_0px_#E6DDC4] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:border-organic-aqua hover:shadow-[4px_4px_0px_#678983]"
  >
    {/* 封面容器 */}
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-organic-ink/5 w-full bg-organic-wood/30">
      <img
        alt={novel.title}
        src={novel.coverUrl || 'https://placehold.co/240x320/F0E9D2/181D31?text=Cover'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* 状态印章 (左上角) */}
      {novel.status === 'completed' && (
        <div className="absolute top-0 left-0 bg-organic-sand px-2 py-1 border-r-2 border-b-2 border-organic-ink/10 rounded-br-xl">
          <span className="text-[10px] text-organic-ink font-bold">完结</span>
        </div>
      )}

      {/* 评分 (右上角) */}
      <div className="absolute top-0 right-0 bg-organic-aqua text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl border-l-2 border-b-2 border-organic-ink/10 shadow-sm">
        {(novel.rating ?? 0).toFixed(1)}
      </div>
    </div>

    {/* 信息 */}
    <div className="space-y-1 w-full px-1">
      <h3 className="font-body text-base font-bold text-organic-ink truncate group-hover:text-organic-aqua transition-colors">
        {novel.title}
      </h3>
      <div className="flex items-center justify-between text-xs text-organic-ink/60 pt-1 font-semibold">
        <span className="truncate max-w-[60%]">{novel.author}</span>
        <span className="px-2 py-0.5 rounded-full bg-organic-sand/50 border border-organic-ink/10 text-organic-ink/80">{novel.category}</span>
      </div>
    </div>
  </div>
);

// 紧凑卡片
const CompactCard: React.FC<Props> = ({ novel, onClick }) => (
  <div
    onClick={onClick}
    className="group flex gap-4 p-3 rounded-2xl bg-white border-2 border-organic-ink/5 hover:border-organic-aqua shadow-sm hover:shadow-[2px_2px_0px_#678983] cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
  >
    <div className="w-16 h-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-organic-ink/5 bg-organic-wood/30 relative">
      <img
        alt={novel.title}
        src={novel.coverUrl || 'https://placehold.co/120x160/F0E9D2/181D31?text=Book'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
      <div>
        <h4 className="font-body font-bold text-sm text-organic-ink truncate group-hover:text-organic-aqua transition-colors">
          {novel.title}
        </h4>
        <p className="text-xs text-organic-ink/60 mt-1 truncate font-semibold">
          {novel.category} · {novel.author}
        </p>
      </div>
      <div className="flex items-center justify-between text-xs mt-2">
        <span className="text-organic-aqua font-bold flex items-center gap-1">
          <FireIcon />
          <span>{((novel.views ?? 0) / 10000).toFixed(1)}w</span>
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border-2 ${novel.status === 'completed' ? 'border-organic-sand bg-organic-sand text-organic-ink' : 'border-organic-aqua/20 text-organic-aqua/80'}`}>
          {novel.status === 'completed' ? '完' : '连'}
        </span>
      </div>
    </div>
  </div>
);

// 横向卡片
const HorizontalCard: React.FC<Props> = ({ novel, onClick }) => (
  <div
    onClick={onClick}
    className="group flex gap-5 p-5 bg-white border-2 border-organic-ink/10 shadow-[4px_4px_0px_#E6DDC4] rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:border-organic-aqua hover:shadow-[4px_4px_0px_#678983] w-full"
  >
    <div className="w-28 h-36 flex-shrink-0 overflow-hidden rounded-xl border-2 border-organic-ink/5 bg-organic-wood/30 relative">
      <img
        alt={novel.title}
        src={novel.coverUrl || 'https://placehold.co/160x213/F0E9D2/181D31?text=Book'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {novel.status === 'completed' && (
        <div className="absolute top-0 left-0 bg-organic-sand px-2 py-1 border-r-2 border-b-2 border-organic-ink/10 rounded-br-xl">
          <span className="text-[10px] font-bold text-organic-ink">完结</span>
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
      <div>
        <h4 className="font-body font-bold text-lg text-organic-ink mb-2 group-hover:text-organic-aqua transition-colors line-clamp-2">
          {novel.title}
        </h4>
        <div className="flex items-center gap-3 text-sm text-organic-ink/70 font-semibold mb-2">
          <span>{novel.author}</span>
          <span className="w-1 h-1 rounded-full bg-organic-ink/30"></span>
          <span className="px-2 py-0.5 bg-organic-sand/50 rounded-full text-xs">{novel.category}</span>
        </div>
        <p className="text-sm text-organic-ink/60 line-clamp-2 mt-2 leading-relaxed font-medium">
          {novel.intro || '暂无简介...'}
        </p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-organic-aqua font-bold text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>{(novel.rating ?? 0).toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1 text-organic-ink/50 font-bold text-sm">
            <FireIcon />
            <span>{((novel.views ?? 0) / 10000).toFixed(1)}w</span>
          </span>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-bold border-2 ${novel.status === 'completed' ? 'border-organic-sand bg-organic-sand text-organic-ink' : 'border-organic-aqua/20 text-organic-aqua/80'}`}>
          {novel.status === 'completed' ? '已完结' : '连载中'}
        </span>
      </div>
    </div>
  </div>
);

export const NovelCard: React.FC<Props> = ({ novel, onClick, variant = 'default' }) => {
  switch (variant) {
    case 'compact':
      return <CompactCard novel={novel} onClick={onClick} />;
    case 'horizontal':
      return <HorizontalCard novel={novel} onClick={onClick} />;
    default:
      return <DefaultCard novel={novel} onClick={onClick} />;
  }
};
