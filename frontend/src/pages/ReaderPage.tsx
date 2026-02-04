import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Drawer, Slider, message } from 'antd';
import { api } from '../api';
import type { Novel, Chapter } from '../types';

// Icons
const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SettingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Theme Definitions
interface ReaderTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
  border: string;
}

const THEMES: ReaderTheme[] = [
  {
    id: 'dark',
    name: '玄冥',
    bg: '#121212',
    text: '#9ca3af',
    accent: '#7B68EE',
    border: '#2a2a2a'
  },
  {
    id: 'paper',
    name: '古卷',
    bg: '#F5E6C8', // 羊皮纸色
    text: '#3E2E20', // 深褐色
    accent: '#8B4513',
    border: '#D7C6A5'
  },
  {
    id: 'eye',
    name: '护眼',
    bg: '#C7EDCC',
    text: '#2F4F2F',
    accent: '#228B22',
    border: '#A8D8B0'
  }
];

export const ReaderPage: React.FC = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Settings
  const [menuVisible, setMenuVisible] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<ReaderTheme>(THEMES[0]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        api.getNovelById(id),
        api.getNovelChapters(id)
      ]).then(([novelData, chaptersData]) => {
        setNovel(novelData);
        setChapters(chaptersData);
        // 如果没有指定章节ID，默认阅读第一章
        if (!chapterId && chaptersData.length > 0) {
          navigate(`/read/${id}/${chaptersData[0].id}`, { replace: true });
        }
      }).catch(() => {
        message.error('获取仙籍信息失败');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id, chapterId, navigate]);

  useEffect(() => {
    if (id && chapterId) {
      // 加载具体章节内容
      setLoading(true);
      api.getChapterDetail(id, chapterId)
        .then((data) => {
          setChapter(data);
          window.scrollTo(0, 0); // 切换章节回顶部
        })
        .catch(() => message.error('修炼中断，无法获取章节'))
        .finally(() => setLoading(false));
    }
  }, [id, chapterId]);

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handlePrevChapter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chapter || !chapters.length) return;
    const currentIndex = chapters.findIndex(c => c.id === chapter.id);
    if (currentIndex > 0) {
      navigate(`/read/${id}/${chapters[currentIndex - 1].id}`);
    } else {
      message.info('已是第一章');
    }
  };

  const handleNextChapter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!chapter || !chapters.length) return;
    const currentIndex = chapters.findIndex(c => c.id === chapter.id);
    if (currentIndex < chapters.length - 1) {
      navigate(`/read/${id}/${chapters[currentIndex + 1].id}`);
    } else {
      message.success('已修炼至最新章节');
    }
  };

  if (loading && !novel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-accent">
        <Spin size="large" tip="凝聚灵气中..." />
      </div>
    );
  }

  // 计算当前阅读进度
  const currentChapterIndex = chapters.findIndex(c => c.id === Number(chapterId));
  const progress = chapters.length > 0 ? Math.round(((currentChapterIndex + 1) / chapters.length) * 100) : 0;

  return (
    <div
      className="min-h-screen transition-colors duration-500 relative select-none"
      style={{ backgroundColor: theme.bg, color: theme.text }}
      onClick={toggleMenu}
    >
      {/* 墨迹背景纹理 (仅在羊皮纸模式下明显) */}
      <div className={`absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]`} />

      {/* 顶部菜单 */}
      <div className={`fixed top-0 left-0 right-0 h-14 bg-dark/95 backdrop-blur shadow-lg border-b border-white/5 flex items-center justify-between px-4 z-50 transition-transform duration-300 ${menuVisible ? 'translate-y-0' : '-translate-y-full'}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-accent flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="font-display">返回</span>
        </button>
        <span className="font-display font-bold text-text-primary text-sm truncate max-w-[200px] text-center">
          {novel?.title}
        </span>
        <button onClick={() => message.success('已加入书架')} className="text-text-secondary hover:text-accent">
          <BookIcon />
        </button>
      </div>

      {/* 阅读区域 */}
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-24 min-h-screen cursor-text" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="flex justify-center py-20"><Spin /></div>
        ) : (
          <>
            <div className="mb-12 border-b-2 pb-6" style={{ borderColor: theme.border }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-shan tracking-wide" style={{ color: theme.name === '玄冥' ? '#D4AF37' : 'inherit' }}>
                {chapter?.title}
              </h2>
              <div className="flex items-center gap-4 text-xs opacity-60 font-mono">
                <span>字数: {chapter?.wordCount}</span>
                <span>更新: {chapter?.updatedAt ? new Date(chapter.updatedAt).toLocaleDateString() : '未知'}</span>
              </div>
            </div>

            <div
              ref={contentRef}
              className="leading-loose font-serif-read text-justify whitespace-pre-wrap"
              style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}
            >
              {chapter?.content || '暂无内容...'}
            </div>

            {/* 底部章节切换 */}
            <div className="mt-20 flex items-center justify-between gap-6">
              <button
                onClick={handlePrevChapter}
                className="flex-1 py-4 rounded-sm border opacity-60 hover:opacity-100 transition-all font-display tracking-widest hover:shadow-lg active:scale-95"
                style={{ borderColor: theme.border, color: theme.text }}
                disabled={currentChapterIndex <= 0}
              >
                上一章
              </button>
              <button
                onClick={handleNextChapter}
                className="flex-1 py-4 rounded-sm hover:opacity-90 transition-all font-display tracking-widest shadow-lg hover:shadow-xl active:scale-95"
                style={{ backgroundColor: theme.accent, color: '#fff' }}
              >
                {currentChapterIndex >= chapters.length - 1 ? '完结撒花' : '下一章'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 底部菜单 */}
      <div className={`fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50 transition-transform duration-300 border-t border-white/10 ${menuVisible ? 'translate-y-0' : 'translate-y-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* 进度条 */}
          <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
            <span>{currentChapterIndex > 0 ? 'To Previous' : 'Start'}</span>
            <Slider
              className="flex-1 m-0"
              value={progress}
              tooltip={{ formatter: (val) => `第 ${Math.round((val || 0) / 100 * chapters.length)} 章` }}
              disabled
            />
            <span>{progress}%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 字体大小 */}
            <div className="flex items-center gap-4">
              <span className="text-text-secondary text-sm font-display">字号</span>
              <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                <span className="text-sm text-text-muted">A-</span>
                <Slider
                  min={14}
                  max={36}
                  step={2}
                  value={fontSize}
                  onChange={setFontSize}
                  className="flex-1 m-0"
                />
                <span className="text-xl text-text-primary">A+</span>
              </div>
            </div>

            {/* 主题切换 */}
            <div className="flex items-center gap-4 justify-end">
              <span className="text-text-secondary text-sm font-display">道境</span>
              <div className="flex gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={`
                      w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center relative group
                      ${theme.id === t.id ? 'border-accent scale-110 shadow-glow' : 'border-transparent opacity-60 hover:opacity-100'}
                    `}
                    style={{ backgroundColor: t.id === 'paper' ? t.bg : t.bg }}
                  >
                    {t.id === 'dark' && <MoonIcon />}
                    {t.id === 'light' && <SunIcon />}
                    {t.id === 'paper' && <span className="text-xs font-serif text-brown-800">卷</span>}
                    {t.id === 'eye' && <span className="text-xs font-serif text-green-800">护</span>}

                    <span className="absolute -bottom-6 text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between text-text-secondary text-xs border-t border-white/10 mt-2">
            <button className="flex flex-col items-center gap-1 hover:text-accent transition-colors w-16 group" onClick={() => setDrawerVisible(true)}>
              <ListIcon />
              <span className="group-hover:scale-105 transition-transform">目录</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-accent transition-colors w-16 group">
              <SettingIcon />
              <span className="group-hover:scale-105 transition-transform">设置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 目录侧边栏 */}
      <Drawer
        title={<span className="font-display text-lg text-text-primary">仙法目录 · {novel?.title}</span>}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={window.innerWidth > 768 ? 400 : '85%'}
        classNames={{
          header: '!bg-dark-paper !border-white/10',
          body: '!bg-dark !text-text-secondary !p-0',
        }}
        closeIcon={<span className="text-text-secondary hover:text-accent">✕</span>}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
            <span className="text-accent font-bold font-display">正文卷</span>
            <span className="text-text-muted text-xs font-mono">共 {chapters.length} 章</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chapters.map((c) => (
              <div
                key={c.id}
                className={`
                  px-6 py-4 border-b border-white/5 text-sm cursor-pointer transition-all font-serif flex items-center justify-between group
                  ${String(chapterId) === String(c.id)
                    ? 'bg-accent/10 text-accent border-l-4 border-l-accent pl-5'
                    : 'text-text-secondary hover:bg-white/5 hover:pl-7 hover:text-text-primary'
                  }
                `}
                onClick={() => {
                  navigate(`/read/${id}/${c.id}`);
                  setDrawerVisible(false);
                }}
              >
                <span className="truncate flex-1">{c.title}</span>
                {String(chapterId) === String(c.id) && <span className="text-[10px] bg-accent text-white px-1.5 rounded-sm ml-2">当前</span>}
                <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity ml-2">{c.wordCount}字</span>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
