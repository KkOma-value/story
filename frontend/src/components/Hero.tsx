import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundBeams } from './ui/background-beams';
import { Spotlight } from './ui/spotlight';
import { TextGenerateEffect } from './ui/text-generate-effect';
import { Button as MovingBorderButton } from './ui/moving-border';

// Ink Icons
const FireIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

export const Hero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative mb-20 rounded-lg overflow-hidden border border-dark-border shadow-elevation-2 group min-h-[500px] flex items-center bg-dark-paper">
            {/* Background Layer with Aceternity UI Effects */}
            <div className="absolute inset-0 bg-dark z-0">
                {/* Spotlight Effect */}
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                    fill="#D4AF37"
                />

                {/* Background Beams */}
                <BackgroundBeams />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 max-w-7xl mx-auto w-full h-full flex flex-col justify-center pointer-events-none">
                <div className="max-w-3xl pointer-events-auto">
                    {/* Title with Text Generate Effect */}
                    <TextGenerateEffect
                        words="天地玄黄 宇宙洪荒"
                        className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-wider drop-shadow-lg"
                    />

                    <p className="text-text-secondary text-lg md:text-xl mb-10 leading-relaxed font-body max-w-xl border-l-2 border-accent pl-6">
                        "书中自有黄金屋，书中自有颜如玉。<br />
                        入我玄幻阁，修万世不朽之法。"
                    </p>

                    <div className="flex flex-wrap gap-4">
                        {/* Moving Border Button */}
                        <MovingBorderButton
                            borderRadius="1px"
                            className="bg-action hover:bg-action-hover text-white font-body font-medium tracking-wide px-8"
                            containerClassName="h-12"
                            duration={3000}
                            onClick={() => navigate('/category')}
                        >
                            <span className="flex items-center gap-2 whitespace-nowrap">
                                <FireIcon />
                                <span className="whitespace-nowrap">开启修炼</span>
                            </span>
                        </MovingBorderButton>

                        {/* Outline Button */}
                        <button
                            onClick={() => navigate('/ranking')}
                            className="app-button-outline h-12 text-base px-8 backdrop-blur-sm bg-black/20"
                        >
                            <div className="flex items-center gap-2">
                                <StarIcon />
                                <span>观摩天榜</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
