import React from 'react';
import { Layout, Dropdown, type MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Header, Content, Footer } = Layout;

// Ink Style Icons (Custom SVG paths for a brush-stroke feel)
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const RankingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
    />
  </svg>
);

const BookshelfIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-300 relative group overflow-hidden
      ${isActive
        ? 'text-accent'
        : 'text-text-secondary hover:text-text-primary'
      }
    `}
  >
    {/* Minimal hover background */}
    <div className={`absolute inset-0 bg-accent/5 transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />

    <span className="relative z-10">{icon}</span>
    <span className="font-body font-medium tracking-wide relative z-10 text-base">{label}</span>

    {/* Bottom Border for Active State */}
    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
  </Link>
);

/**
 * 玄幻阁主布局 (Black-Gold Layout)
 */
export const UserLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: <HomeIcon />, label: '首页' },
    { to: '/category', icon: <CategoryIcon />, label: '书库' },
    { to: '/ranking', icon: <RankingIcon />, label: '天榜' },
    { to: '/bookshelf', icon: <BookshelfIcon />, label: '藏书' },
    { to: '/history', icon: <HistoryIcon />, label: '足迹' },
  ];

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileIcon />,
      label: '个人资料',
      className: 'hover:bg-accent/10 hover:text-accent'
    },
    {
      key: 'logout',
      icon: <LogoutIcon />,
      label: '退出登录',
      className: 'hover:bg-action/10 hover:text-action'
    },
  ];

  const handleDropdown: MenuProps['onClick'] = (e) => {
    if (e.key === 'profile') {
      navigate('/profile');
      return;
    }
    if (e.key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <Layout className="min-h-screen bg-transparent">
      {/* 顶部导航栏 */}
      <Header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between border-b border-white/5 bg-dark/90 backdrop-blur-md transition-all duration-300">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 flex items-center justify-center border border-accent/30 rounded-sm bg-accent/5">
             <span className="text-accent font-calligraphy text-xl">玄</span>
          </div>
          <span className="font-display font-bold text-xl text-text-primary hidden sm:block tracking-widest group-hover:text-accent transition-colors">
            玄幻阁
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.to}
            />
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-4">
          {/* 搜索按钮 */}
          <Link
            to="/search"
            className={`
              p-2 rounded-full transition-all duration-300 border border-transparent
              ${location.pathname === '/search' ? 'text-accent bg-accent/10 border-accent/20' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}
            `}
          >
            <SearchIcon />
          </Link>

          {/* 用户菜单 */}
          {user ? (
            <Dropdown
              menu={{ items: dropdownItems, onClick: handleDropdown }}
              placement="bottomRight"
            >
              <button className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-accent/30 transition-all duration-300 cursor-pointer group">
                <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold border border-accent/10">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-text-secondary text-sm font-medium hidden sm:block group-hover:text-accent transition-colors">
                  {user.username}
                </span>
              </button>
            </Dropdown>
          ) : (
            <Link to="/login" className="app-button-outline text-sm px-5 py-1.5 h-8">
              登录
            </Link>
          )}
        </div>
      </Header>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer
                ${location.pathname === item.to
                  ? 'text-accent scale-105'
                  : 'text-text-muted'
                }
              `}
            >
              <span className="transform scale-90">{item.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 主内容区 */}
      <Content className="pt-20 pb-24 md:pb-12 px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto w-full min-h-screen">
        <Outlet />
      </Content>

      {/* 页脚 */}
      <Footer className="hidden md:block text-center py-12 border-t border-white/5 mt-12 bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center border border-white/10 opacity-50">
            <span className="font-calligraphy text-xl text-text-muted">玄</span>
          </div>
          <p className="text-text-muted text-sm tracking-widest opacity-60">
            <span className="text-accent/60">玄幻阁</span> · 诸天万界阅读系统
            <span className="mx-3 text-white/10">|</span>
            ©{new Date().getFullYear()} 悟道出品
          </p>
        </div>
      </Footer>
    </Layout>
  );
};
