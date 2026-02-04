import React, { useEffect, useState } from 'react';
import { Spin, Pagination } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { Novel } from '../types';
import { NovelCard } from '../components/NovelCard';

// 男频分类数据
const CATEGORIES = [
  { id: 'all', name: '全部', icon: '📚', description: '所有功法' },
  { id: '玄幻', name: '玄幻', icon: '⚔️', description: '异界争霸，强者为尊' },
  { id: '仙侠', name: '仙侠', icon: '🏔️', description: '御剑乘风，问道长生' },
  { id: '都市', name: '都市', icon: '🏙️', description: '龙王归来，纵横都市' },
  { id: '科幻', name: '科幻', icon: '🚀', description: '星际迷航，机械飞升' },
  { id: '网游', name: '网游', icon: '🎮', description: '数据为王，虚拟具现' },
  { id: '历史', name: '历史', icon: '📜', description: '金戈铁马，醒掌天下' },
  { id: '奇幻', name: '奇幻', icon: '🐉', description: '剑与魔法，巨龙咆哮' },
  { id: '武侠', name: '武侠', icon: '🗡️', description: '侠之大者，为国为民' },
  { id: '悬疑', name: '悬疑', icon: '🔍', description: '诡秘复苏，恐怖降临' },
];

// 筛选选项
const STATUS_OPTIONS = [
  { id: 'all', name: '全部' },
  { id: 'ongoing', name: '连载中' },
  { id: 'completed', name: '已完结' },
];

const SORT_OPTIONS = [
  { id: 'hot', name: '最热' },
  { id: 'latest', name: '最新' },
  { id: 'rating', name: '好评' },
  { id: 'views', name: '点击' },
];

export const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // 从URL读取筛选条件
  const currentCategory = searchParams.get('cat') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentSort = searchParams.get('sort') || 'hot';
  const currentPage = parseInt(searchParams.get('page') || '1');

  // 更新筛选条件
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== 'page') params.set('page', '1'); // 切换筛选条件时重置页码
    setSearchParams(params);
  };

  useEffect(() => {
    setLoading(true);
    api.searchNovels({
      category: currentCategory === 'all' ? undefined : currentCategory,
      status: currentStatus === 'all' ? undefined : currentStatus,
      sort: currentSort,
      page: currentPage,
      limit: 12,
    })
      .then((res) => {
        setNovels(res.items || []);
        setTotal(res.total || 0);
      })
      .catch(() => {
        setNovels([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [currentCategory, currentStatus, currentSort, currentPage]);

  return (
    <div className="animate-fade-in">
      {/* 页面标题 */}
      <div className="mb-8 border-b border-dark-border pb-4">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2 tracking-wide">
          藏经阁
        </h1>
        <p className="text-text-muted text-sm">探寻诸天万界，寻找属于你的本命功法</p>
      </div>

      {/* 分类标签 */}
      <section className="mb-8">
        <h3 className="text-text-secondary text-xs font-bold mb-4 uppercase tracking-widest border-l-2 border-accent pl-2">功法分类</h3>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('cat', cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-sm border transition-all duration-300
                ${currentCategory === cat.id 
                  ? 'bg-accent/10 border-accent text-accent shadow-glow-gold' 
                  : 'bg-dark-paper border-dark-border text-text-muted hover:text-text-primary hover:border-accent/50'
                }
              `}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-bold">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 筛选栏 */}
      <section className="app-card mb-8 flex flex-wrap gap-8 py-4 px-6 bg-dark-paper border border-dark-border rounded-sm">
        {/* 状态筛选 */}
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-sm font-medium">状态</span>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateFilter('status', opt.id)}
                className={`
                  px-3 py-1 rounded-sm text-sm transition-all
                  ${currentStatus === opt.id 
                    ? 'bg-action text-white font-bold' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
                  }
                `}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-dark-border hidden sm:block"></div>

        {/* 排序筛选 */}
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-sm font-medium">排序</span>
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => updateFilter('sort', opt.id)}
                className={`
                  px-3 py-1 rounded-sm text-sm transition-all
                  ${currentSort === opt.id 
                    ? 'text-accent font-bold border-b border-accent' 
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 当前分类信息 */}
      {currentCategory !== 'all' && (
        <div className="mb-6 p-4 rounded-sm bg-gradient-to-r from-accent/10 to-transparent border-l-4 border-accent">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">
              {CATEGORIES.find(c => c.id === currentCategory)?.icon}
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-accent">
                {CATEGORIES.find(c => c.id === currentCategory)?.name}
              </h2>
              <p className="text-text-secondary text-xs mt-0.5 opacity-80">
                {CATEGORIES.find(c => c.id === currentCategory)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 小说列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : novels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted border border-dashed border-dark-border rounded-sm bg-dark-paper/50">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">暂无相关秘籍</p>
          <p className="text-sm mt-2 opacity-60">请尝试切换其他分类或筛选条件</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
            {novels.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                onClick={() => navigate(`/novels/${novel.id}`)}
              />
            ))}
          </div>

          {/* 分页 */}
          {total > 12 && (
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={12}
                onChange={(page) => updateFilter('page', String(page))}
                showSizeChanger={false}
                itemRender={(page, type, originalElement) => {
                  if (type === 'page') {
                    return <span className={`w-8 h-8 flex items-center justify-center rounded-sm border ${currentPage === page ? 'border-accent text-accent bg-accent/10' : 'border-dark-border text-text-muted hover:text-text-primary hover:border-accent/50'}`}>{page}</span>;
                  }
                  return originalElement;
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
