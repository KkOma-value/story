import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, ConfigProvider, theme, type MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { AdminBackground } from '../components/AdminBackground';

const { Header, Sider, Content, Footer } = Layout;

/**
 * Admin layout with sidebar navigation.
 */
export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const siderItems: MenuProps['items'] = [
    { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/admin/novels', icon: <BookOutlined />, label: '小说管理' },
    { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
    { key: '/admin/analytics', icon: <BarChartOutlined />, label: '数据分析' },
  ];

  const handleSiderClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const dropdownItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  const handleDropdown: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#D4AF37',
          colorBgBase: '#050814',
          colorBgContainer: '#111827',
          colorText: '#E5E7EB',
          colorTextSecondary: '#9CA3AF',
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: 'rgba(10,10,10,0.85)',
            headerPadding: 24,
          },
          Menu: {
            itemBorderRadius: 6,
          },
          Table: {
            colorBgContainer: 'transparent',
          },
        },
      }}
    >
      <div className="relative min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-950 text-text-primary">
        <AdminBackground className="opacity-40" />
        <Layout className="relative z-10 min-h-screen">
          <Sider
            collapsible
            width={260}
            breakpoint="lg"
            theme="dark"
            className="!bg-gradient-to-b !from-black/90 !via-slate-900/95 !to-black/95 border-r border-dark-border/80 shadow-elevation-2"
          >
            <div className="flex items-center gap-3 h-16 px-5 border-b border-dark-border/80">
              <div className="w-9 h-9 rounded-sm bg-gold-gradient shadow-glow-gold flex items-center justify-center text-black font-display text-xl tracking-widest">
                玄
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-sm text-text-primary tracking-[0.25em] uppercase">
                  玄幻阁
                </span>
                <span className="text-[11px] text-text-secondary/80 font-mono tracking-widest">
                  ADMIN CONSOLE
                </span>
              </div>
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={siderItems}
              onClick={handleSiderClick}
              className="mt-3 border-none !bg-transparent [&_.ant-menu-item]:transition-all [&_.ant-menu-item]:duration-200 [&_.ant-menu-item]:mx-3 [&_.ant-menu-item]:rounded-md"
            />
          </Sider>
          <Layout className="min-h-screen">
            <Header className="flex items-center justify-between gap-4 !bg-transparent !border-b !border-dark-border/80 backdrop-blur-xl px-6 lg:px-8">
              <div className="hidden md:flex items-center gap-2 text-xs text-text-secondary font-mono tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span>系统状态 · 在线</span>
              </div>
              <div className="flex-1" />
              <Dropdown menu={{ items: dropdownItems, onClick: handleDropdown }} placement="bottomRight">
                <Button
                  type="text"
                  className="!text-text-secondary hover:!text-text-primary !px-2 flex items-center gap-2"
                >
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    className="bg-dark-hover text-text-primary"
                  />
                  <span className="hidden sm:inline text-xs font-mono tracking-wide">
                    {user?.username}
                  </span>
                </Button>
              </Dropdown>
            </Header>
            <Content className="px-4 py-6 lg:px-8 lg:py-8">
              <div className="max-w-7xl mx-auto">
                <div className="app-card-lg app-card-hover bg-dark-paper/90 border border-dark-border/80 shadow-elevation-2">
                  <Outlet />
                </div>
              </div>
            </Content>
            <Footer className="!bg-transparent text-center text-xs text-text-muted border-t border-dark-border/80 mt-4">
              管理后台 ©{new Date().getFullYear()} · 玄幻阁
            </Footer>
          </Layout>
        </Layout>
      </div>
    </ConfigProvider>
  );
};
