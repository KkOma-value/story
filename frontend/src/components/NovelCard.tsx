import React from 'react';
import type { Novel } from '../types';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import { CardSpotlight } from './ui/card-spotlight';
import { HoverBorderGradient } from './ui/hover-border-gradient';

// Ink Icons
const FireIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
  </svg>
);

interface Props {
  novel: Novel;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'horizontal';
}

// 默认竖版卡片 (书架/推荐) - 使用 3D Card Effect
const DefaultCard: React.FC<Props> = ({ novel, onClick }) => (
  <CardContainer className="w-full" containerClassName="w-full">
    <CardBody className="w-full h-auto">
      <div className="group relative flex flex-col gap-3" onClick={onClick}>
        {/* 封面容器 - 使用 CardItem 创建 3D 效果 */}
        <CardItem
          translateZ="50"
          className="relative aspect-[3/4] overflow-hidden rounded-sm bg-dark-paper border border-white/5 group-hover:border-accent/40 shadow-elevation-1 transition-all duration-300 w-full"
        >
          {/* 封面图片 */}
          <img
            alt={novel.title}
            src={novel.coverUrl || 'https://placehold.co/240x320/0F2631/E6EDF3?text=Cover'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* 渐变遮罩 (仅底部文字区) */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent opacity-60" />

          {/* 状态印章 (左上角) */}
          {novel.status === 'completed' && (
            <div className="absolute top-0 left-0 bg-dark/90 backdrop-blur-sm px-2 py-0.5 border-r border-b border-white/10 rounded-br-sm">
              <span className="text-[10px] text-text-secondary font-medium">完结</span>
            </div>
          )}

          {/* 评分 (右上角) */}
          <div className="absolute top-0 right-0 bg-accent text-dark-paper text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
            {(novel.rating ?? 0).toFixed(1)}
          </div>
        </CardItem>

        {/* 信息 - 使用 CardItem 创建提升效果 */}
        <CardItem translateZ="30" className="space-y-1 w-full">
          <h3 className="font-body text-base font-bold text-text-primary truncate group-hover:text-accent transition-colors">
            {novel.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-text-muted pt-1">
            <span className="truncate max-w-[60%] hover:text-text-secondary transition-colors">{novel.author}</span>
            <span className="text-text-muted px-1 rounded-sm border border-white/5">{novel.category}</span>
          </div>
        </CardItem>
      </div>
    </CardBody>
  </CardContainer>
);

// 紧凑卡片 (列表) - 使用 Direction Aware Hover
const CompactCard: React.FC<Props> = ({ novel, onClick }) => (
  <CardSpotlight
    onClick={onClick}
    className="group flex gap-3 p-3 rounded-md cursor-pointer transition-all duration-300"
  >
    <div className="w-14 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-black/20 relative">
      <img
        alt={novel.title}
        src={novel.coverUrl || 'https://placehold.co/120x160/0F2631/E6EDF3?text=Book'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
      <div>
        <h4 className="font-body font-bold text-sm text-text-primary truncate group-hover:text-accent transition-colors">
          {novel.title}
        </h4>
        <p className="text-xs text-text-muted mt-1 truncate">
          {novel.category} · {novel.author}
        </p>
      </div>
      <div className="flex items-center justify-between text-xs mt-2">
        <span className="text-action/90 font-medium flex items-center gap-1">
          <FireIcon />
          <span className="font-mono">{((novel.views ?? 0) / 10000).toFixed(1)}w</span>
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${novel.status === 'completed' ? 'border-accent/30 text-accent' : 'border-action/30 text-action'}`}>
          {novel.status === 'completed' ? '完' : '连'}
        </span>
      </div>
    </div>
  </CardSpotlight>
);

// 横向卡片 (排行榜/详情) - 使用 Hover Border Gradient
const HorizontalCard: React.FC<Props> = ({ novel, onClick }) => (
  <HoverBorderGradient
    as="div"
    onClick={onClick}
    containerClassName="w-full cursor-pointer"
    className="flex gap-4 p-4 transition-all duration-300 w-full"
  >
    <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-sm bg-black/20 relative">
      <img
        alt={novel.title}
        src={novel.coverUrl || 'https://placehold.co/160x213/0F2631/E6EDF3?text=Book'}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
      {novel.status === 'completed' && (
        <div className="absolute top-0 left-0 bg-accent text-dark-paper text-[9px] font-bold px-1 py-0.5">
          完
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
      <div>
        <h4 className="font-body font-bold text-lg text-text-primary mb-2 hover:text-accent transition-colors line-clamp-2">
          {novel.title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-text-muted mb-2">
          <span className="hover:text-accent transition-colors">{novel.author}</span>
          <span>·</span>
          <span className="px-1.5 py-0.5 border border-white/10 rounded">{novel.category}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-accent font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>{(novel.rating ?? 0).toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1 text-action/90 font-medium">
              <FireIcon />
              <span className="font-mono">{((novel.views ?? 0) / 10000).toFixed(1)}w</span>
            </span>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded border ${novel.status === 'completed' ? 'border-accent/30 text-accent bg-accent/5' : 'border-action/30 text-action bg-action/5'}`}>
            {novel.status === 'completed' ? '已完结' : '连载中'}
          </span>
        </div>
      </div>
    </div>
  </HoverBorderGradient>
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
