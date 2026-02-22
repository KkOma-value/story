import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Hero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <main className="relative w-full min-h-[500px] md:min-h-[60vh] flex items-center px-6 md:px-12 lg:px-24 rounded-[40px] bg-organic-wood overflow-hidden border-2 border-organic-ink/10 shadow-sm mt-6">
            {/* Organic background shapes */}
            <div className="absolute right-0 top-0 w-full md:w-1/2 h-full flex items-center justify-center pointer-events-none z-0 opacity-20 md:opacity-100">
                <div className="w-[80vw] md:w-[30vw] h-[80vw] md:h-[30vw] bg-organic-aqua/20 absolute rounded-blob animate-blob-bounce blur-2xl"></div>
                <div className="w-[70vw] md:w-[25vw] h-[70vw] md:h-[25vw] bg-organic-sand absolute rounded-blob2 animate-blob-bounce translate-x-12 translate-y-12 shadow-2xl mix-blend-multiply border-4 border-organic-ink/5 border-dashed" style={{ animationDuration: '15s', animationDirection: 'alternate-reverse' }}></div>

                {/* Floating books/cards simulation (hidden on small screens) */}
                <div className="hidden md:flex absolute z-10 w-48 h-64 bg-white rounded-2xl shadow-[10px_10px_0px_#678983] border-2 border-organic-ink transform -rotate-12 -translate-x-24 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 flex-col items-center justify-center p-4">
                    <div className="w-full h-32 bg-organic-sand rounded-xl mb-4"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded-full mb-2"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded-full"></div>
                </div>
                <div className="hidden md:flex absolute z-20 w-56 h-72 bg-white rounded-2xl shadow-[10px_10px_0px_#181D31] border-2 border-organic-ink transform rotate-6 translate-x-12 translate-y-24 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 overflow-hidden">
                    <div className="w-full h-full bg-organic-aqua p-6 flex flex-col justify-end text-white">
                        <h3 className="font-display text-2xl mb-1">仙道长青</h3>
                        <p className="font-body text-sm opacity-90 font-bold">9.8 评分</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl">
                <div className="inline-block px-4 py-2 bg-organic-sand rounded-full text-organic-ink font-bold font-body mb-6 border-2 border-organic-ink transform -rotate-2">
                    ✨ 全新沉浸式阅读体验
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display leading-[1.1] text-organic-ink mb-6 drop-shadow-sm">
                    让阅读成为<br />
                    最自然的<span className="text-organic-aqua relative inline-block ml-2">
                        享受
                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-organic-sand" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path d="M0 10 Q 50 20 100 0" fill="transparent" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>
                <p className="text-lg md:text-xl font-body text-organic-ink/80 mb-10 font-bold leading-relaxed max-w-lg">
                    在繁杂的世界中，寻找一片宁静的修仙之地。护眼模式、极简排版，只为最纯粹的阅读。
                </p>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate('/category')}
                        className="px-8 py-4 bg-organic-aqua text-white rounded-2xl font-body font-bold tracking-wider hover:bg-organic-ink transition-colors shadow-[4px_4px_0px_#181D31] hover:shadow-[2px_2px_0px_#181D31] hover:translate-y-[2px] hover:translate-x-[2px] border-2 border-transparent"
                    >
                        随便逛逛
                    </button>
                    <button
                        onClick={() => navigate('/ranking')}
                        className="px-8 py-4 bg-white text-organic-ink border-2 border-organic-ink rounded-2xl font-body font-bold tracking-wider hover:bg-organic-sand transition-colors shadow-[4px_4px_0px_#181D31] hover:shadow-[2px_2px_0px_#181D31] hover:translate-y-[2px] hover:translate-x-[2px]"
                    >
                        观摩天榜
                    </button>
                </div>
            </div>
        </main>
    );
};
