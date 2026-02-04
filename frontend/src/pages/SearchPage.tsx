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

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get('q') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [results, setResults] = useState<Novel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();

  const doSearch = async (kw: string, p: number) => {
    if (!kw.trim()) {
      message.warning('请注入神识 (输入关键词)');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.searchNovels({ keyword: kw, page: p, pageSize: 12 });
      setResults(res.items);
      setTotal(res.total);
      setPage(p);
      setSearchParams({ q: kw });
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

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* 搜索头 */}
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-6">
          万界搜神
        </h1>
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-action rounded-sm opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
          <div className="relative flex items-center bg-dark-paper rounded-sm">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索功法、作者或法宝..."
              className="flex-1 bg-transparent border-none text-text-primary px-6 py-4 focus:ring-0 placeholder:text-text-muted/50 text-lg"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-accent/10 text-accent font-bold hover:bg-accent hover:text-dark transition-all duration-300 border-l border-dark-border"
            >
              <div className="flex items-center gap-2">
                <SearchIcon />
                <span>搜寻</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted bg-dark-paper/30 border border-dashed border-dark-border rounded-sm">
          <div className="w-20 h-20 mb-4 opacity-30 flex items-center justify-center border-2 border-current rounded-full">
            <span className="text-4xl">🌫️</span>
          </div>
          <p className="text-lg">神识探查无果</p>
          <p className="text-sm mt-2 opacity-60">未发现相关秘境或功法</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="animate-slide-up">
          <div className="mb-4 text-text-muted text-sm">
            共探查到 <span className="text-accent font-bold font-mono">{total}</span> 处结果
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {results.map((novel) => (
              <NovelCard 
                key={novel.id} 
                novel={novel} 
                onClick={() => navigate(`/novels/${novel.id}`)} 
              />
            ))}
          </div>
          
          <div className="flex justify-center">
            <Pagination
              current={page}
              total={total}
              pageSize={12}
              onChange={handlePageChange}
              showSizeChanger={false}
              itemRender={(page, type, originalElement) => {
                if (type === 'page') {
                  return <span className={`w-8 h-8 flex items-center justify-center rounded-sm border ${page === page ? 'border-accent text-accent bg-accent/10' : 'border-dark-border text-text-muted hover:text-text-primary'}`}>{page}</span>;
                }
                return originalElement;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
