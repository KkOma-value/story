import { useState, useEffect } from 'react';
import { message, Rate } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import type { MyComment, MyRating, Novel } from '../types';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileEditCard } from '../components/ProfileEditCard';
import { PasswordChangeCard } from '../components/PasswordChangeCard';
import { FavoritesGrid } from '../components/FavoritesGrid';
import { Tabs, type Tab } from '../components/ui/tabs';
import { BackgroundBeams } from '../components/ui/background-beams';
import { GridAndDotBackgrounds } from '../components/ui/grid-dot-backgrounds';
import { TextGenerateEffect } from '../components/ui/text-generate-effect';

const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Stats state
    const [stats, setStats] = useState({
        favoritesCount: 0,
        commentsCount: 0,
        ratingsCount: 0,
    });

    // Data state
    const [favoritesData, setFavoritesData] = useState<Novel[]>([]);
    const [commentsData, setCommentsData] = useState<MyComment[]>([]);
    const [ratingsData, setRatingsData] = useState<MyRating[]>([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch stats in parallel
        Promise.all([
            api.getBookshelf(1, 100).then(res => res.length),
            api.getMyComments(1, 100).then(res => res.items.length),
            api.getMyRatings(1, 100).then(res => res.items.length),
        ]).then(([favorites, comments, ratings]) => {
            setStats({
                favoritesCount: favorites,
                commentsCount: comments,
                ratingsCount: ratings,
            });
        });
    }, [user, navigate]);

    // Fetch favorites data when needed
    const fetchFavorites = async () => {
        if (favoritesData.length > 0) return;
        try {
            const res = await api.getBookshelf(1, 100);
            setFavoritesData(res);
        } catch (error) {
            message.error('获取收藏失败');
        }
    };

    // Fetch comments data
    const fetchComments = async () => {
        if (commentsData.length > 0) return;
        try {
            const res = await api.getMyComments(1, 100);
            setCommentsData(res.items);
        } catch (error) {
            message.error('获取评论失败');
        }
    };

    // Fetch ratings data
    const fetchRatings = async () => {
        if (ratingsData.length > 0) return;
        try {
            const res = await api.getMyRatings(1, 100);
            setRatingsData(res.items);
        } catch (error) {
            message.error('获取评分失败');
        }
    };

    const handleUpdateProfile = async (data: { displayName: string; bio: string; avatarUrl: string }) => {
        setLoading(true);
        try {
            await api.updateProfile(data);
            await refreshUser();
            message.success('资料更新成功!');
        } catch (error) {
            message.error('资料更新失败');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (data: { oldPassword: string; newPassword: string }) => {
        setLoading(true);
        try {
            await api.changePassword({ ...data, confirmPassword: data.newPassword });
            message.success('密码修改成功!');
        } catch (error) {
            message.error('密码修改失败');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromFavorites = async (novelId: string) => {
        try {
            await api.removeFromBookshelf(novelId);
            setFavoritesData(favoritesData.filter(novel => novel.id !== novelId));
            setStats(prev => ({ ...prev, favoritesCount: prev.favoritesCount - 1 }));
            message.success('已从书架移除');
        } catch (error) {
            message.error('移除失败');
        }
    };

    if (!user) {
        return null;
    }

    const tabs: Tab[] = [
        {
            title: '⚙️ 个人资料',
            value: 'profile',
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                    <ProfileEditCard user={user} onSubmit={handleUpdateProfile} loading={loading} />
                    <PasswordChangeCard onSubmit={handleChangePassword} loading={loading} />
                </div>
            ),
        },
        {
            title: '📚 我的收藏',
            value: 'favorites',
            content: (
                <div className="animate-fade-in-up" onMouseEnter={fetchFavorites}>
                    <FavoritesGrid
                        novels={favoritesData}
                        loading={loading}
                        onRemove={handleRemoveFromFavorites}
                    />
                </div>
            ),
        },
        {
            title: '💬 我的评论',
            value: 'comments',
            content: (
                <div className="space-y-4 animate-fade-in-up" onMouseEnter={fetchComments}>
                    {commentsData.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-8xl mb-6">💬</div>
                            <TextGenerateEffect
                                words="暂无评论记录 快去评论喜欢的小说吧"
                                className="text-text-muted text-xl"
                            />
                        </div>
                    ) : (
                        commentsData.map(comment => (
                            <div key={comment.id} className="bg-dark-paper/60 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-accent/30 transition-all duration-300">
                                <Link to={`/novels/${comment.novelId}`} className="text-accent font-bold text-lg hover:underline mb-2 block">
                                    《{comment.novelTitle}》
                                </Link>
                                <p className="text-text-secondary leading-relaxed mb-3">{comment.content}</p>
                                <div className="flex items-center gap-4 text-sm text-text-muted">
                                    <span>📅 {new Date(comment.createdAt).toLocaleDateString()}</span>
                                    <span>👍 0 点赞</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ),
        },
        {
            title: '⭐ 我的评分',
            value: 'ratings',
            content: (
                <div className="space-y-4 animate-fade-in-up" onMouseEnter={fetchRatings}>
                    {ratingsData.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-8xl mb-6">⭐</div>
                            <TextGenerateEffect
                                words="暂无评分记录 快去给喜欢的小说评分吧"
                                className="text-text-muted text-xl"
                            />
                        </div>
                    ) : (
                        ratingsData.map(rating => (
                            <div key={rating.novelId} className="bg-dark-paper/60 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-accent/30 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <Link to={`/novels/${rating.novelId}`} className="text-accent font-bold text-lg hover:underline">
                                        《{rating.novelTitle}》
                                    </Link>
                                    <Rate disabled defaultValue={rating.score} className="text-accent" />
                                </div>
                                <div className="text-sm text-text-muted mt-2">
                                    📅 {new Date(rating.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Layers */}
            <BackgroundBeams className="opacity-30 z-0" />
            <GridAndDotBackgrounds className="absolute inset-0 -z-10" />

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
                {/* Page Title */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <h1 className="text-5xl font-display text-text-primary mb-2 flex items-center justify-center gap-4">
                        <span className="text-accent">◈</span>
                        道友名帖
                        <span className="text-accent">◈</span>
                    </h1>
                    <p className="text-text-muted font-serif">玄幻阁 · 个人中心</p>
                </div>

                {/* Profile Header */}
                <ProfileHeader
                    user={user}
                    favoritesCount={stats.favoritesCount}
                    commentsCount={stats.commentsCount}
                    ratingsCount={stats.ratingsCount}
                />

                {/* Aceternity Tabs */}
                <Tabs
                    tabs={tabs}
                    containerClassName="bg-dark-paper/60 backdrop-blur-sm border border-white/10 rounded-t-xl overflow-hidden"
                    activeTabClassName="bg-accent/10 border-accent/30"
                    tabClassName="text-text-secondary hover:text-accent transition-colors duration-200"
                    contentClassName="bg-dark-paper/40 backdrop-blur-sm border border-white/10 border-t-0 rounded-b-xl p-8"
                />
            </div>
        </div>
    );
};

export { ProfilePage };
