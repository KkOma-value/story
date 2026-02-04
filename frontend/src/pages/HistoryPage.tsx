import React, { useEffect, useState } from 'react';
import { Spin, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { ReadHistory } from '../types';

// SVG Icons
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

// 历史记录项组件
const HistoryItem: React.FC<{
  history: ReadHistory;
  onContinue: () => void;
  onRemove: () => void;
}> = ({ history, onContinue, onRemove }) => (
  <div className="app-list-item group flex items-center gap-4">
    {/* 封面 */}
    <div 
      onClick={onContinue}
      className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden shadow-card cursor-pointer relative"
    >
      <img
        alt={history.novel.title}
        src={history.novel.coverUrl || 'https://placehold.co/80x112/E17F93/FFFFFF?text=Book'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-border">
        <div 
          className="h-full bg-primary transition-all"
          style={{ width: `${history.progress}%` }}
        />
      </div>
    </div>

    {/* 信息 */}
    <div className="flex-1 min-w-0">
      <h3 
        onClick={onContinue}
        className="font-display font-bold text-text line-clamp-1 cursor-pointer hover:text-primary transition-colors"
      >
        {history.novel.title}
      </h3>
      <p className="text-text-muted text-sm mt-1">{history.novel.author}</p>
      <p className="text-text-muted text-sm mt-2 line-clamp-1">
        读到：<span className="text-mystic-light">{history.lastChapter || '开始修炼'}</span>
      </p>
      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
        <ClockIcon />
        <span>{formatTime(history.lastReadAt)}</span>
        <span className="mx-1">·</span>
        <span>进度 {history.progress}%</span>
      </div>
    </div>

    {/* 操作按钮 */}
    <div className="flex flex-col gap-2">
      <button
        onClick={onContinue}
        className="app-button"
      >
        继续阅读
      </button>
      <button
        onClick={onRemove}
        className="app-button-ghost"
      >
        删除记录
      </button>
    </div>
  </div>
);

// 日期分组组件
const DateGroup: React.FC<{
  title: string;
  histories: ReadHistory[];
  onContinue: (history: ReadHistory) => void;
  onRemove: (id: string) => void;
}> = ({ title, histories, onContinue, onRemove }) => (
  <div className="mb-8">
    <h3 className="text-text-muted text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
      <ClockIcon />
      {title}
    </h3>
    <div className="app-list">
      {histories.map((history) => (
        <HistoryItem
          key={history.id}
          history={history}
          onContinue={() => onContinue(history)}
          onRemove={() => onRemove(history.id)}
        />
      ))}
    </div>
  </div>
);

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [histories, setHistories] = useState<ReadHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getReadHistory()
      .then((data) => setHistories(data))
      .catch(() => setHistories([]))
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = (history: ReadHistory) => {
    if (history.novel.sourceUrl) {
      window.open(history.novel.sourceUrl, '_blank', 'noopener');
      return;
    }
    navigate(`/read/${history.novel.id}`);
  };

  const handleRemove = (historyId: string) => {
    Modal.confirm({
      title: '删除记录',
      content: '确定要删除这条阅读记录吗？',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.removeReadHistory(historyId);
          setHistories(histories.filter(h => h.id !== historyId));
        } catch {
          // Handle error
        }
      },
    });
  };

  const handleClearAll = () => {
    Modal.confirm({
      title: '清空历史',
      content: '确定要清空所有阅读历史吗？此操作不可恢复。',
      okText: '确认清空',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.clearReadHistory();
          setHistories([]);
        } catch {
          // Handle error
        }
      },
    });
  };

  // 按时间分组
  const groupHistories = () => {
    const today: ReadHistory[] = [];
    const yesterday: ReadHistory[] = [];
    const thisWeek: ReadHistory[] = [];
    const earlier: ReadHistory[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

    histories.forEach((h) => {
      const date = new Date(h.lastReadAt);
      if (date >= todayStart) {
        today.push(h);
      } else if (date >= yesterdayStart) {
        yesterday.push(h);
      } else if (date >= weekStart) {
        thisWeek.push(h);
      } else {
        earlier.push(h);
      }
    });

    return { today, yesterday, thisWeek, earlier };
  };

  const groups = groupHistories();

  return (
    <div>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text mb-2 flex items-center gap-3">
            <span className="text-mystic-light"><ClockIcon /></span>
            阅读历史
          </h1>
          <p className="text-text-muted">
            共 <span className="text-primary font-bold">{histories.length}</span> 条记录
          </p>
        </div>

        {histories.length > 0 && (
          <button
            onClick={handleClearAll}
            className="app-button-ghost"
          >
            <TrashIcon />
            <span>清空历史</span>
          </button>
        )}
      </div>

      {/* 历史列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : histories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 mb-6 rounded-full bg-white border border-dark-border flex items-center justify-center">
            <svg className="w-16 h-16 text-text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text mb-2">暂无阅读记录</h3>
          <p className="text-text-muted mb-6">开始你的阅读之旅吧</p>
          <button
            onClick={() => navigate('/')}
            className="app-button"
          >
            去首页看看
          </button>
        </div>
      ) : (
        <div>
          {groups.today.length > 0 && (
            <DateGroup
              title="今天"
              histories={groups.today}
              onContinue={handleContinue}
              onRemove={handleRemove}
            />
          )}
          {groups.yesterday.length > 0 && (
            <DateGroup
              title="昨天"
              histories={groups.yesterday}
              onContinue={handleContinue}
              onRemove={handleRemove}
            />
          )}
          {groups.thisWeek.length > 0 && (
            <DateGroup
              title="本周"
              histories={groups.thisWeek}
              onContinue={handleContinue}
              onRemove={handleRemove}
            />
          )}
          {groups.earlier.length > 0 && (
            <DateGroup
              title="更早"
              histories={groups.earlier}
              onContinue={handleContinue}
              onRemove={handleRemove}
            />
          )}
        </div>
      )}
    </div>
  );
};
