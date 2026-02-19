import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Drawer, message, Rate } from 'antd';
import { api } from '../api';
import type { Novel, Chapter } from '../types';
import { NovelCard } from '../components/NovelCard';
import { CommentSection } from '../components/CommentSection';
import { useAuth } from '../hooks/useAuth';

// Ink Icons
const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-5 h-5 ${filled ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export const NovelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [related, setRelated] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isInShelf, setIsInShelf] = useState(false);
  const [myRating, setMyRating] = useState(0);

  const handleStartReading = async () => {
    if (chapters.length === 0) {
      message.warning('暂无章节');
      return;
    }

    const firstChapterId = chapters[0].id;

    if (user) {
      try {
        await api.createReadHistory(String(novel!.id));
      } catch {
        // Ignore history errors
      }
    }

    navigate(`/read/${novel!.id}/${firstChapterId}`);
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      // 并行加载数据
      Promise.all([
        api.getNovelById(id),
        api.getNovelChapters(id),
        api.getRecommendations({ type: 'related', novelId: id, limit: 4 })
      ]).then(([novelData, chaptersData, relatedData]) => {
        setNovel(novelData);
        setChapters(chaptersData);
        setRelated(relatedData);
        // 使用后端返回的收藏状态
        setIsInShelf((novelData as any).myFavorite ?? false);
        setMyRating((novelData as any).myRating ?? 0);
      }).catch(() => {
        message.error('获取仙籍详情失败');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  const toggleShelf = async () => {
    if (!user) {
      message.warning('请先入阁 (登录)');
      navigate('/login');
      return;
    }

    try {
      if (isInShelf) {
        await api.removeFromBookshelf(novel!.id);
        setIsInShelf(false);
        message.success('已移出藏经阁');
      } else {
        await api.addToBookshelf(novel!.id);
        setIsInShelf(true);
        message.success('已收入藏经阁');
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleRate = async (value: number) => {
    if (!user) {
      message.warning('请先入阁 (登录)');
      navigate('/login');
      return;
    }

    try {
      await api.rateNovel(String(novel!.id), value);
      setMyRating(value);
      message.success('评分成功');
    } catch {
      message.error('评分失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!novel) return null;

  return (
    <div className="animate-fade-in pb-12">
      {/* 顶部详情卡片 */}
      <div className="app-card-lg relative overflow-hidden group mb-12 border-none">
        {/* 背景氛围 */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-125 pointer-events-none mix-blend-overlay transition-transform duration-[30s] group-hover:scale-110"
          style={{ backgroundImage: `url(${novel.coverUrl || 'https://placehold.co/180x240/0F2631/E6EDF3'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/95 to-dark/80 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] animate-pulse-slow" />

        <div className="relative z-10 flex flex-col md:flex-row gap-10 p-4 md:p-8">
          {/* 封面 (带墨迹晕染) */}
          <div className="flex-shrink-0 w-48 mx-auto md:mx-0 relative group/cover">
            <div className="absolute -inset-4 bg-ink-splash opacity-30 group-hover/cover:opacity-50 transition-opacity bg-contain bg-no-repeat bg-center scale-150 z-0"></div>
            <div className="relative z-10 rounded-sm overflow-hidden shadow-2xl border border-white/10 group-hover/cover:border-accent/30 transition-all duration-500 transform group-hover/cover:-translate-y-2">
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-full h-auto object-cover aspect-[3/4]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 详情信息 */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="font-shan text-5xl md:text-6xl text-transparent bg-clip-text bg-mystic-gradient mb-4 drop-shadow-lg tracking-wide">
              {novel.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm md:text-base font-serif">
              <span className="text-text-primary font-bold text-lg">{novel.author}</span>
              <span className="text-white/20">|</span>
              <span className="text-accent">{novel.category}</span>
              <span className="text-white/20">|</span>
              <span className={`${novel.status === 'completed' ? 'text-action' : 'text-green-400'}`}>
                {novel.status === 'completed' ? '已完结' : '连载中'}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-text-secondary">{Math.round((novel.wordCount || 0) / 10000)}万字</span>
              <span className="text-white/20">|</span>
              <span className="text-text-secondary">{(novel.views / 10000).toFixed(1)}万 人气</span>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1">
                <span className="text-text-secondary">我的评分:</span>
                <Rate
                  allowHalf={false}
                  count={5}
                  value={myRating}
                  onChange={handleRate}
                  className="text-accent text-sm"
                />
              </div>
            </div>

            {/* 标签 (印章风格) */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
              {novel.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-sm bg-white/5 text-text-secondary text-sm border border-white/10 hover:border-accent/30 hover:text-accent transition-colors cursor-default font-serif">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex-1" />

            {/* 操作按钮 */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4 md:mt-0">
              <button
                onClick={handleStartReading}
                className="app-button w-40 h-12 text-lg shadow-glow-red hover:scale-105 active:scale-95 transition-transform"
              >
                开始修炼
              </button>
              <button
                onClick={toggleShelf}
                className={`
                  w-40 h-12 rounded-sm border transition-all duration-300 flex items-center justify-center gap-2 font-display tracking-widest text-lg
                  ${isInShelf
                    ? 'border-gray-600 text-gray-400 bg-transparent hover:border-gray-500'
                    : 'border-accent text-accent bg-accent/5 hover:bg-accent/10 hover:shadow-glow-purple'
                  }
                `}
              >
                <HeartIcon filled={isInShelf} />
                <span>{isInShelf ? '移出藏经阁' : '收入藏经阁'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：简介与目录 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 简介 */}
          <section className="bg-dark-paper/80 backdrop-blur-sm border border-white/5 rounded-xl p-8 shadow-ink relative overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/10 rounded-tl-xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/10 rounded-br-xl pointer-events-none" />

            <h2 className="font-display text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-accent rounded-full shadow-glow-purple" />
              天机秘闻
            </h2>
            <div className="text-text-secondary leading-loose font-serif text-lg indent-8 opacity-90">
              {novel.intro.split('\n').map((p, i) => (
                <p key={i} className="mb-4 text-justify">{p}</p>
              ))}
            </div>
          </section>

          {/* 目录 (竹简/卷轴风格) */}
          <section className="bg-dark-paper/80 backdrop-blur-sm border border-white/5 rounded-xl p-8 shadow-ink relative">
            {/* 装饰性卷轴轴头 */}
            <div className="absolute -left-2 top-8 bottom-8 w-2 bg-gradient-to-b from-[#3E2E20] via-[#5D4037] to-[#3E2E20] rounded-l-md opacity-20" />

            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="font-display text-2xl font-bold text-text-primary flex items-center gap-3">
                <span className="w-1 h-6 bg-accent rounded-full shadow-glow-purple" />
                仙法目录
                <span className="text-sm font-serif text-text-muted font-normal ml-2">
                  (共 {chapters.length} 章)
                </span>
              </h2>
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-accent hover:text-white transition-colors flex items-center gap-1 text-sm group"
              >
                <span>全部章节</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {chapters.slice(0, 10).map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => navigate(`/read/${novel.id}/${chapter.id}`)}
                  className="text-left py-3 px-4 rounded-sm hover:bg-white/5 transition-all text-text-secondary hover:text-accent border-b border-white/5 border-dashed font-serif truncate group flex justify-between items-center"
                >
                  <span className="truncate flex-1">{chapter.title}</span>
                  <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">阅读</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 右侧：相关推荐 */}
        <div className="lg:col-span-1">
          <section className="bg-dark-paper/50 border border-white/5 rounded-xl p-6 shadow-lg sticky top-24">
            <h2 className="font-display text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
              <span className="text-accent">◈</span> 同道中人也在看
            </h2>
            <div className="space-y-4">
              {related.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <NovelCard
                    novel={item}
                    onClick={() => navigate(`/novels/${item.id}`)}
                    variant="horizontal"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 评论区 */}
      <CommentSection novelId={String(novel.id)} />

      {/* 全部章节抽屉 */}
      <Drawer
        title={<span className="font-display text-xl text-text-primary">全部章节</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{
          body: { padding: 0, backgroundColor: '#0a0a0f' },
          header: { backgroundColor: '#0a0a0f', borderBottom: '1px solid rgba(255,255,255,0.1)' }
        }}
        width={window.innerWidth > 768 ? 480 : '100%'}
        classNames={{
          header: '!bg-dark-paper !border-white/5',
          body: '!bg-dark !text-text-secondary',
        }}
        closeIcon={<span className="text-text-secondary">✕</span>}
      >
        <div className="space-y-1">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => {
                setDrawerOpen(false);
                navigate(`/read/${novel.id}/${chapter.id}`);
              }}
              className="w-full text-left py-3 px-4 hover:bg-white/5 transition-colors border-b border-white/5 border-dashed font-serif text-text-secondary hover:text-accent"
            >
              {chapter.title}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
};
