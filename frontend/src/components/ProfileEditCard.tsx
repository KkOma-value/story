import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { CardSpotlight } from './ui/card-spotlight';

interface ProfileEditCardProps {
    user: User;
    onSubmit: (data: { displayName: string; bio: string; avatarUrl: string }) => Promise<void>;
    loading: boolean;
}

export const ProfileEditCard: React.FC<ProfileEditCardProps> = ({ user, onSubmit, loading }) => {
    const [displayName, setDisplayName] = useState(user.displayName || user.username);
    const [bio, setBio] = useState(user.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || user.avatar || '');
    const [previewAvatar, setPreviewAvatar] = useState(avatarUrl);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Debounce avatar preview update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (avatarUrl.trim()) {
                setPreviewAvatar(avatarUrl);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [avatarUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors: { [key: string]: string } = {};
        if (displayName.length < 2 || displayName.length > 20) {
            newErrors.displayName = '道号长度应在2-20字符之间';
        }
        if (bio.length > 200) {
            newErrors.bio = '道心感悟不能超过200字';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        await onSubmit({ displayName, bio, avatarUrl });
    };

    return (
        <CardSpotlight className="p-6 w-full" radius={300} color="#D4AF37">
            <div className="flex items-center gap-2 text-accent font-display text-xl mb-6">
                <span className="text-2xl">◈</span> 修整仪容
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* 3D Avatar Preview */}
                <div className="flex justify-center mb-4">
                    <CardContainer>
                        <CardBody className="w-auto h-auto">
                            <CardItem
                                translateZ={50}
                                className="relative w-24 h-24 rounded-full border-3 border-accent/50 overflow-hidden shadow-glow-gold"
                            >
                                {previewAvatar ? (
                                    <img
                                        src={previewAvatar}
                                        alt="Avatar Preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setPreviewAvatar('')}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-dark-hover flex items-center justify-center text-2xl text-accent font-calligraphy">
                                        {displayName.charAt(0)}
                                    </div>
                                )}
                            </CardItem>
                        </CardBody>
                    </CardContainer>
                </div>

                {/* Display Name */}
                <div>
                    <label className="text-sm text-text-muted font-serif mb-2 block">道号</label>
                    <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={`w-full bg-black/30 border rounded-sm px-4 py-3 text-text-primary
                            focus:outline-none transition-all duration-300
                            ${errors.displayName
                                ? 'border-action focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.3)]'
                                : 'border-white/10 focus:border-accent focus:shadow-glow-gold'
                            }
                            placeholder:text-text-muted/50`}
                        placeholder="输入新道号"
                        maxLength={20}
                    />
                    {errors.displayName && (
                        <p className="text-action text-xs mt-1 animate-fade-in-up">{errors.displayName}</p>
                    )}
                    <p className="text-text-muted text-xs mt-1">{displayName.length} / 20</p>
                </div>

                {/* Avatar URL */}
                <div>
                    <label className="text-sm text-text-muted font-serif mb-2 block">真容法相 URL</label>
                    <input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-sm px-4 py-3 text-text-primary
                            focus:outline-none focus:border-accent focus:shadow-glow-gold transition-all duration-300
                            placeholder:text-text-muted/50"
                        placeholder="输入头像图片链接"
                        type="url"
                    />
                    <p className="text-text-muted text-xs mt-1">粘贴图片URL,将实时预览</p>
                </div>

                {/* Bio */}
                <div>
                    <label className="text-sm text-text-muted font-serif mb-2 block">道心感悟</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className={`w-full bg-black/30 border rounded-sm px-4 py-3 text-text-primary
                            focus:outline-none resize-none transition-all duration-300
                            ${errors.bio
                                ? 'border-action focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.3)]'
                                : 'border-white/10 focus:border-accent focus:shadow-glow-gold'
                            }
                            placeholder:text-text-muted/50`}
                        placeholder="记录你的修仙感悟..."
                        rows={4}
                        maxLength={200}
                    />
                    {errors.bio && (
                        <p className="text-action text-xs mt-1 animate-fade-in-up">{errors.bio}</p>
                    )}
                    <p className="text-text-muted text-xs mt-1">{bio.length} / 200</p>
                </div>

                {/* Submit with HoverBorderGradient */}
                <div className="pt-4">
                    <HoverBorderGradient
                        as="button"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 text-accent font-display text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        containerClassName="w-full"
                        duration={2}
                    >
                        {loading ? '闭关修炼中...' : '✨ 更新资料'}
                    </HoverBorderGradient>
                </div>
            </form>
        </CardSpotlight>
    );
};
