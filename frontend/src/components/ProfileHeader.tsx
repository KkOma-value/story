import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { CardSpotlight } from './ui/card-spotlight';
import { SparklesCore } from './ui/sparkles';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';

interface ProfileHeaderProps {
    user: User;
    favoritesCount?: number;
    commentsCount?: number;
    ratingsCount?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    favoritesCount = 0,
    commentsCount = 0,
    ratingsCount = 0,
}) => {
    const [animatedFavorites, setAnimatedFavorites] = useState(0);
    const [animatedComments, setAnimatedComments] = useState(0);
    const [animatedRatings, setAnimatedRatings] = useState(0);

    // Counter animation effect
    useEffect(() => {
        const duration = 1000;
        const steps = 60;
        const stepTime = duration / steps;

        const animateCounter = (target: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
            let current = 0;
            const increment = target / steps;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setter(target);
                    clearInterval(timer);
                } else {
                    setter(Math.floor(current));
                }
            }, stepTime);
            return timer;
        };

        const timer1 = animateCounter(favoritesCount, setAnimatedFavorites);
        const timer2 = animateCounter(commentsCount, setAnimatedComments);
        const timer3 = animateCounter(ratingsCount, setAnimatedRatings);

        return () => {
            clearInterval(timer1);
            clearInterval(timer2);
            clearInterval(timer3);
        };
    }, [favoritesCount, commentsCount, ratingsCount]);

    return (
        <CardSpotlight
            className="p-8 mb-8 shadow-elevation-2"
            radius={400}
            color="#D4AF37"
        >
            {/* Golden sparkles background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
                <SparklesCore
                    id="profile-sparkles"
                    background="transparent"
                    minSize={0.6}
                    maxSize={2}
                    particleDensity={50}
                    particleColor="#D4AF37"
                    speed={0.5}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* 3D Avatar Section */}
                <CardContainer className="flex-shrink-0">
                    <CardBody className="w-auto h-auto">
                        <CardItem
                            translateZ={50}
                            className="relative w-32 h-32 rounded-full border-4 border-accent overflow-hidden shadow-glow-gold"
                        >
                            {user.avatarUrl || user.avatar ? (
                                <img
                                    src={user.avatarUrl || user.avatar}
                                    alt={user.displayName || user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-dark-hover flex items-center justify-center text-4xl text-accent font-calligraphy">
                                    {(user.displayName || user.username).charAt(0)}
                                </div>
                            )}
                        </CardItem>
                    </CardBody>
                </CardContainer>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-display text-text-primary mb-2">
                        {user.displayName || user.username}
                        <span className="ml-3 text-sm text-text-muted font-serif">@{user.username}</span>
                    </h2>
                    {user.bio && (
                        <p className="text-text-secondary text-base leading-relaxed max-w-2xl mb-4 italic border-l-2 border-accent/30 pl-4">
                            "{user.bio}"
                        </p>
                    )}
                    {!user.bio && (
                        <p className="text-text-muted text-sm mb-4">暂无道心感悟...</p>
                    )}
                </div>
            </div>

            {/* Stats Cards with Hover Effects */}
            <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
                <StatsCard
                    label="收藏书册"
                    value={animatedFavorites}
                    icon="📚"
                />
                <StatsCard
                    label="留言评论"
                    value={animatedComments}
                    icon="💬"
                />
                <StatsCard
                    label="品鉴评分"
                    value={animatedRatings}
                    icon="⭐"
                />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-accent/10 text-6xl font-calligraphy pointer-events-none select-none z-0">
                ◈
            </div>
        </CardSpotlight>
    );
};

interface StatsCardProps {
    label: string;
    value: number;
    icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
    return (
        <div className="group relative overflow-hidden">
            <CardContainer>
                <CardBody className="w-full h-auto">
                    <CardItem
                        translateZ={20}
                        className="w-full bg-black/20 backdrop-blur-sm border border-white/5 rounded-lg p-4 hover:border-accent/30 hover:bg-black/30 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center">
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                {icon}
                            </div>
                            <div className="text-2xl font-bold text-accent mb-1 tabular-nums">
                                {value}
                            </div>
                            <div className="text-xs text-text-muted font-serif tracking-wide">
                                {label}
                            </div>
                        </div>
                    </CardItem>
                </CardBody>
            </CardContainer>
        </div>
    );
};
