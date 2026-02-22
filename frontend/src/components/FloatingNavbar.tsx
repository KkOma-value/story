import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { name: '首页', link: '/' },
    { name: '书架', link: '/bookshelf' },
    { name: '排行榜', link: '/ranking' },
    { name: '分类', link: '/category' },
];

export const FloatingNavbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchValue, setSearchValue] = React.useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        }
    };

    return (
        <nav className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center py-6 px-8 relative z-50 mt-4 bg-white/60 backdrop-blur-md rounded-[32px] border-2 border-organic-ink/10 shadow-sm">
            {/* Logo */}
            <div
                className="text-3xl font-display text-organic-aqua flex items-center gap-2 cursor-pointer mb-4 md:mb-0 hover:scale-105 transition-transform"
                onClick={() => navigate('/')}
            >
                <div className="w-10 h-10 bg-organic-aqua rounded-blob flex items-center justify-center text-white text-lg shadow-sm border-2 border-organic-ink/10 animate-blob-bounce" style={{ animationDuration: '8s' }}>
                    📖
                </div>
                玄幻阁
            </div>

            {/* Links & Search */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full md:w-auto">
                {/* Navigation Links */}
                <div className="flex space-x-6 font-body font-bold text-organic-ink/70">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.link)}
                            className={`hover:text-organic-aqua transition-colors px-3 py-1 rounded-full ${location.pathname === item.link ? 'bg-organic-aqua/10 text-organic-aqua' : ''}`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder="在此搜索修真世界..."
                        className="w-full bg-organic-wood/50 border-2 border-organic-ink/10 rounded-full py-2.5 px-5 text-sm font-body font-bold text-organic-ink placeholder:text-organic-ink/40 focus:outline-none focus:border-organic-aqua focus:bg-white transition-all shadow-inner"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-organic-ink/50 hover:text-organic-aqua transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>

                {/* Avatar / Profile */}
                <div
                    onClick={() => navigate('/profile')}
                    className="w-11 h-11 bg-organic-sand rounded-full border-2 border-organic-ink/20 flex items-center justify-center cursor-pointer hover:bg-organic-aqua hover:text-white transition-colors shadow-sm ml-2 hidden md:flex"
                >
                    👤
                </div>
            </div>
        </nav>
    );
};
