import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Ink Icons
const UserIcon = () => (
  <svg className="w-5 h-5 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

interface LoginFormValues {
  credential: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values);
      message.success('道友归来，书院幸甚');
      const storedUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      if (storedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '通灵失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark relative overflow-hidden">
      {/* 动态水墨背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-ink-texture opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-ink-gradient opacity-90" />
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-mist opacity-30 pointer-events-none" />

        {/* 装饰光晕 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* 登录卡片 */}
      <div className="relative w-full max-w-md px-4 z-10 animate-fade-in-up">
        {/* Logo区域 */}
        <div className="text-center mb-10 group cursor-default">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-light to-primary-dark border border-white/10 mb-6 shadow-ink relative overflow-hidden group-hover:shadow-glow-purple transition-all duration-700">
            <div className="absolute inset-0 bg-ink-gradient opacity-50" />
            <div className="absolute inset-0 animate-mist opacity-20" />
            <span className="font-shan text-5xl font-bold text-white relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">玄</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-mystic-gradient tracking-widest drop-shadow-sm mb-2">
            玄幻阁
          </h1>
          <p className="text-text-primary font-serif tracking-[0.2em] group-hover:text-accent transition-colors duration-500">
            一入玄门深似海
          </p>
        </div>

        {/* 表单容器 */}
        <div className="bg-dark-paper/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
          {/* 边角装饰 */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-accent/20 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-accent/20 rounded-br-xl" />

          <h2 className="font-display text-2xl font-bold text-text-primary text-center mb-8 tracking-widest">
            开启书院
          </h2>

          <Form<LoginFormValues> name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
            <Form.Item
              name="credential"
              rules={[{ required: true, message: '请出示道号或信物' }]}
            >
              <Input
                prefix={<UserIcon />}
                placeholder="道号 / 仙籍 (邮箱)"
                size="large"
                className="!bg-black/20 !border-white/10 !text-text-primary placeholder:!text-text-muted hover:!border-accent/40 focus:!border-accent focus:!shadow-glow-purple rounded-md h-12 text-lg font-serif"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入通灵印记' }]}
            >
              <Input.Password
                prefix={<LockIcon />}
                placeholder="通灵印记 (密码)"
                size="large"
                className="!bg-black/20 !border-white/10 !text-text-primary placeholder:!text-text-muted hover:!border-accent/40 focus:!border-accent focus:!shadow-glow-purple rounded-md h-12 text-lg font-serif"
              />
            </Form.Item>

            <Form.Item className="mb-4 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full app-button h-12 text-lg shadow-glow-red hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-md font-display tracking-widest relative overflow-hidden group"
              >
                <span className="relative z-10">{loading ? '正在通灵...' : '入 阁'}</span>
                {/* 按钮内流光 */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              </button>
            </Form.Item>

            <div className="flex items-center justify-between mt-6 text-sm font-serif">
              <Link to="/register" className="text-accent hover:text-accent-light transition-colors group flex items-center gap-1">
                <span>尚未筑基?</span>
                <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all">→</span>
              </Link>
              <Link to="/forgot-password" className="text-text-secondary hover:text-text-primary transition-colors">
                遗忘印记?
              </Link>
            </div>
          </Form>
        </div>

        {/* 底部版权 */}
        <p className="text-center text-text-muted/40 text-xs mt-8 font-serif tracking-wider">
          © {new Date().getFullYear()} 玄幻阁 · 诸天万界阅读系统
        </p>
      </div>
    </div>
  );
};
