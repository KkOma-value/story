import React, { useState } from 'react';
import { Spin, Pagination, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { Novel } from '../types';
import { NovelCard } from '../components/NovelCard';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

type SearchType = 'all' | 'title' | 'author' | 'category' | 'tag';
type SortType = 'hot' | 'time' | 'rating';

const searchTypeOptions = [
  { value: 'all', label: '全部' },
  { value: 'title', label: '书名' },
  { value: 'author', label: '作者' },
  { value: 'category', label: '分类' },
  { value: 'tag', label: '标签' },
];

const sortOptions = [
  { value: 'hot', label: '热度' },
  { value: 'time', label: '最新' },
  { value: 'rating', label: '评分' },
];

// 从URL参数中推断搜索类型和关键词
const getInitialSearchState = (searchParams: URLSearchParams): { type: SearchType; keyword: string } => {
  const typeMap: { key: string; type: SearchType }[] = [
    { key: 'title', type: 'title' },
    { key: 'author', type: 'author' },
    { key: 'category', type: 'category' },
    { key: 'tag', type: 'tag' },
  ];

  for (const { key, type } of typeMap) {
    if (searchParams.has(key)) {
      return { type, keyword: searchParams.get(key) || '' };
    }
  }

  return { type: 'all', keyword: searchParams.get('q') || '' };
};

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialState = getInitialSearchState(searchParams);
  const initialSort = (searchParams.get('sort') as SortType) || 'hot';

  const [keyword, setKeyword] = useState(initialState.keyword);
  const [searchType, setSearchType] = useState<SearchType>(initialState.type);
  const [sort, setSort] = useState<SortType>(initialSort);
  const [results, setResults] = useState<Novel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();

  const buildSearchRequest = (kw: string, p: number) => {
    const baseParams = { page: p, pageSize: 12, sort };
    const fieldMap: Record<SearchType, string> = {
      all: 'keyword',
      title: 'title',
      author: 'author',
      category: 'category',
      tag: 'tag',
    };
    return { ...baseParams, [fieldMap[searchType]]: kw };
  };

  const updateSearchParams = (kw: string) => {
    const params: Record<string, string> = {};
    if (kw) {
      const paramKeyMap: Record<SearchType, string> = {
        all: 'q',
        title: 'title',
        author: 'author',
        category: 'category',
        tag: 'tag',
      };
      params[paramKeyMap[searchType]] = kw;
    }
    if (sort !== 'hot') params.sort = sort;
    setSearchParams(params);
  };

  const doSearch = async (kw: string, p: number) => {
    if (!kw.trim()) {
      message.warning('请注入神识 (输入关键词)');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const req = buildSearchRequest(kw, p);
      const res = await api.searchNovels(req);
      setResults(res.items);
      setTotal(res.total);
      setPage(p);
      updateSearchParams(kw);
    } catch {
      message.error('神识探查失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    doSearch(keyword, 1);
  };

  const handlePageChange = (p: number) => {
    doSearch(keyword, p);
  };

  const handleSearchTypeChange = (value: SearchType) => {
    setSearchType(value);
    if (keyword.trim()) {
      doSearch(keyword, 1);
    }
  };

  const handleSortChange = (value: SortType) => {
    setSort(value);
    if (searched && keyword.trim()) {
      doSearch(keyword, 1);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen max-w-6xl mx-auto px-4 py-10">

      {/* ── 标题 ── */}
      <h1 className="font-display text-4xl font-bold text-text-primary text-center mb-8 tracking-widest">
        万界搜神
      </h1>

      {/* ── 搜索框 ── */}
      <div className="relative group max-w-2xl mx-auto mb-10">
        {/* 光晕边框 */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-accent/70 via-action/50 to-accent/70 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 blur-[2px]" />
        <div className="relative flex bg-dark-paper border border-dark-border rounded-lg overflow-hidden shadow-lg">
          {/* 搜索类型下拉 */}
          <div className="relative flex items-center border-r border-dark-border">
            <select
              value={searchType}
              onChange={(e) => handleSearchTypeChange(e.target.value as SearchType)}
              className="h-full bg-transparent text-text-primary text-sm pl-4 pr-8 py-4 outline-none cursor-pointer appearance-none"
            >
              {searchTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a2e] text-text-primary">
                  {opt.label}
                </option>
              ))}
            </select>
            {/* 自定义小箭头 */}
            <svg className="pointer-events-none absolute right-2 w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* 输入框 */}
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索功法、作者或法宝..."
            className="flex-1 bg-transparent text-text-primary px-5 py-4 focus:ring-0 placeholder:text-text-muted/40 text-base outline-none"
          />

          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-4 bg-accent/10 text-accent font-semibold hover:bg-accent hover:text-dark transition-all duration-200 border-l border-dark-border whitespace-nowrap"
          >
            <SearchIcon />
            <span className="hidden sm:inline">搜寻</span>
          </button>
        </div>
      </div>

      {/* ── 结果区 ── */}
      <div className="max-w-6xl mx-auto">

        {/* 加载中 */}
        {loading && (
          <div className="flex justify-center py-24">
            <Spin size="large" />
          </div>
        )}

        {/* 初始引导 */}
        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-28 text-text-muted select-none">
            <div className="text-5xl mb-5 opacity-20">🔮</div>
            <p className="text-sm opacity-40 tracking-wider">输入关键词，探索万界秘境</p>
          </div>
        )}

        {/* 无结果 */}
        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted bg-dark-paper/30 border border-dashed border-dark-border rounded-lg">
            <div className="text-4xl mb-4 opacity-20">🌫️</div>
            <p className="text-base">神识探查无果</p>
            <p className="text-sm mt-2 opacity-40">未发现相关秘境或功法，请换个关键词再试</p>
          </div>
        )}

        {/* 有结果 */}
        {!loading && results.length > 0 && (
          <div className="animate-slide-up">
            {/* 筛选 & 统计栏 */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-dark-border/50">
              {/* 统计 */}
              <p className="text-text-muted text-sm">
                找到{' '}
                <span className="text-accent font-bold font-mono">{total}</span>{' '}
                个结果
                {keyword && (
                  <> — <span className="text-text-primary/80">&ldquo;{keyword}&rdquo;</span></>
                )}
              </p>

              {/* 排序 Tabs */}
              <div className="flex items-center gap-1 bg-dark-paper border border-dark-border rounded-lg p-1">
                <span className="text-xs text-text-muted px-2 hidden sm:inline">排序</span>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value as SortType)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-150 ${
                      sort === opt.value
                        ? 'bg-accent/20 text-accent'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 卡片网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5 mb-10">
              {results.map((novel) => (
                <NovelCard
                  key={novel.id}
                  novel={novel}
                  onClick={() => navigate(`/novels/${novel.id}`)}
                />
              ))}
            </div>

            {/* 分页 */}
            <div className="flex justify-center pb-10">
              <Pagination
                current={page}
                total={total}
                pageSize={12}
                onChange={handlePageChange}
                showSizeChanger={false}
                itemRender={(pageNum, type, originalElement) => {
                  if (type === 'page') {
                    const isActive = pageNum === page;
                    return (
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                          isActive
                            ? 'border border-accent text-accent bg-accent/10 font-bold'
                            : 'border border-dark-border text-text-muted hover:text-text-primary hover:border-accent/40'
                        }`}
                      >
                        {pageNum}
                      </span>
                    );
                  }
                  return originalElement;
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
