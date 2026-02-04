import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Novel } from '../types';
import { DirectionAwareHover } from './ui/direction-aware-hover';
import { TextGenerateEffect } from './ui/text-generate-effect';
import { HoverBorderGradient } from './ui/hover-border-gradient';

interface FavoritesGridProps {
    novels: Novel[];
    loading: boolean;
    onRemove: (novelId: string) => void;
}

export const FavoritesGrid: React.FC<FavoritesGridProps> = ({ novels, loading, onRemove }) => {
    const [showConfirm, setShowConfirm] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-dark-paper/30 border border-white/5 rounded-lg overflow-hidden animate-pulse">
                        <div className="aspect-[3/4] bg-dark-hover"></div>
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-dark-hover rounded w-3/4"></div>
                            <div className="h-3 bg-dark-hover rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (novels.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-8xl mb-6">📚</div>
                <TextGenerateEffect
                    words="书架空空如也 快去收藏喜欢的小说吧"
                    className="text-text-muted text-xl"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {novels.map((novel) => (
                <div key={novel.id} className="group relative">
                    <DirectionAwareHover
                        imageUrl={novel.coverUrl || '/placeholder-cover.jpg'}
                        className="h-[400px] rounded-lg"
                    >
                        {/* Content shown on hover */}
                        <div className="space-y-3">
                            <Link
                                to={`/novels/${novel.id}`}
                                className="block text-accent text-lg font-bold hover:underline line-clamp-2"
                            >
                                《{novel.title}》
                            </Link>
                            <p className="text-text-muted text-sm">
                                作者: {novel.author}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                <span>👁 {novel.views?.toLocaleString() || 0}</span>
                                <span>❤️ {(novel.favorites || 0).toLocaleString()}</span>
                                <span>⭐ {novel.rating?.toFixed(1) || 'N/A'}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <Link to={`/novels/${novel.id}`} className="flex-1">
                                    <HoverBorderGradient
                                        as="div"
                                        className="text-accent text-xs py-2 px-4 text-center"
                                        containerClassName="w-full"
                                        duration={1}
                                    >
                                        📖 阅读
                                    </HoverBorderGradient>
                                </Link>
                                <button
                                    onClick={() => setShowConfirm(novel.id)}
                                    className="flex-1 bg-action/20 hover:bg-action/30 text-action text-xs py-2 px-4 rounded-md transition-colors duration-200 border border-action/30"
                                >
                                    🗑️ 移除
                                </button>
                            </div>
                        </div>
                    </DirectionAwareHover>

                    {/* Confirmation Modal */}
                    {showConfirm === novel.id && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-dark-paper border border-white/10 rounded-lg p-6 max-w-sm w-full shadow-elevation-3 animate-fade-in-up">
                                <h3 className="text-accent font-display text-xl mb-2">确认移除</h3>
                                <p className="text-text-secondary mb-6">
                                    确定要从书架移除《{novel.title}》吗?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            onRemove(novel.id);
                                            setShowConfirm(null);
                                        }}
                                        className="flex-1 bg-action hover:bg-action/90 text-white py-2 px-4 rounded-md transition-colors duration-200"
                                    >
                                        确认移除
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(null)}
                                        className="flex-1 bg-dark-hover hover:bg-white/10 text-text-primary py-2 px-4 rounded-md transition-colors duration-200 border border-white/10"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
