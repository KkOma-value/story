import React, { useEffect, useState } from 'react';
import { Spin, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Novel } from '../types';
import { NovelCard } from '../components/NovelCard';

// Icons
const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

export const BookshelfPage: React.FC = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getBookshelf()
      .then((data) => setNovels(data))
      .catch(() => setNovels([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleRemoveSelected = () => {
    Modal.confirm({
      title: '移除藏书',
      content: `确定要将这 ${selectedIds.size} 本功法移出藏书阁吗？`,
      okText: '移除',
      cancelText: '保留',
      okButtonProps: { danger: true, type: 'primary' },
      className: 'dark-modal',
      onOk: async () => {
        try {
          await Promise.all(
            Array.from(selectedIds).map(id => api.removeFromBookshelf(id))
          );
          setNovels(novels.filter(n => !selectedIds.has(n.id)));
          setSelectedIds(new Set());
          setIsEditing(false);
        } catch {
          // Handle error
        }
      },
    });
  };

  return (
    <div className="animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-dark-border">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <span className="text-accent"><BookmarkIcon /></span>
            藏书阁
          </h1>
          <p className="text-text-muted text-sm">
            已收藏 <span className="text-accent font-bold font-mono">{novels.length}</span> 本秘籍
          </p>
        </div>

        {/* 操作栏 */}
        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex bg-dark-paper border border-dark-border rounded-sm p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'}`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-sm transition-all ${viewMode === 'list' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'}`}
            >
              <ListIcon />
            </button>
          </div>

          {/* 编辑按钮 */}
          {novels.length > 0 && (
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setSelectedIds(new Set());
              }}
              className={isEditing ? 'app-button-danger px-4 py-2' : 'app-button-outline px-4 py-2'}
            >
              {isEditing ? '完成' : '整理'}
            </button>
          )}
        </div>
      </div>

      {/* 编辑模式工具栏 */}
      {isEditing && novels.length > 0 && (
        <div className="mb-6 p-4 rounded-sm border border-accent/30 bg-accent/5 flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (selectedIds.size === novels.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(novels.map(n => n.id)));
                }
              }}
              className="text-text-secondary hover:text-accent font-medium text-sm transition-colors"
            >
              {selectedIds.size === novels.length ? '取消全选' : '全选所有'}
            </button>
            <span className="text-text-muted text-sm">
              已选 <span className="text-accent font-mono font-bold">{selectedIds.size}</span> 本
            </span>
          </div>
          
          <button
            onClick={handleRemoveSelected}
            disabled={selectedIds.size === 0}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-sm transition-all ${
              selectedIds.size > 0 
                ? 'bg-action text-white hover:bg-action-hover shadow-glow-red' 
                : 'bg-dark-border text-text-muted cursor-not-allowed'
            }`}
          >
            <TrashIcon />
            <span>移除</span>
          </button>
        </div>
      )}

      {/* 书架内容 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : novels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-dark-paper rounded-sm border border-dark-border border-dashed">
          <div className="w-24 h-24 mb-6 rounded-full bg-dark border-2 border-dark-border flex items-center justify-center text-dark-border">
            <BookmarkIcon />
          </div>
          <h3 className="text-xl font-bold text-text-secondary mb-2">书架空空如也</h3>
          <p className="text-text-muted mb-8 text-sm">快去藏经阁寻找你的本命功法吧</p>
          <button
            onClick={() => navigate('/category')}
            className="app-button"
          >
            前往藏经阁
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {novels.map((novel) => (
            <div key={novel.id} className="relative group/item">
              {isEditing && (
                <div 
                  onClick={() => handleToggleSelect(novel.id)}
                  className="absolute inset-0 z-20 cursor-pointer bg-dark/20 group-hover/item:bg-dark/40 transition-colors rounded-sm"
                >
                  <div className={`
                    absolute top-3 left-3 w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-all
                    ${selectedIds.has(novel.id)
                      ? 'bg-accent border-accent'
                      : 'bg-black/50 border-white/50'
                    }
                  `}>
                    {selectedIds.has(novel.id) && (
                      <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
              <NovelCard
                novel={novel}
                onClick={() => !isEditing && navigate(`/novels/${novel.id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {novels.map((novel) => (
            <div key={novel.id} className="relative group/item">
              {isEditing && (
                <div 
                  onClick={() => handleToggleSelect(novel.id)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
                >
                  <div className={`
                    w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-all
                    ${selectedIds.has(novel.id)
                      ? 'bg-accent border-accent'
                      : 'bg-black/50 border-white/50'
                    }
                  `}>
                    {selectedIds.has(novel.id) && (
                      <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
              <div className={`transition-all ${isEditing ? 'pl-16 opacity-90' : ''}`}>
                <NovelCard
                  novel={novel}
                  variant="horizontal"
                  onClick={() => !isEditing && navigate(`/novels/${novel.id}`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
