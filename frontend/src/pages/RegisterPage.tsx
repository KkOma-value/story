import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api';

interface RegisterFormValues {
  username: string;
  displayName: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm<RegisterFormValues>();
  const { register } = useAuth();
  const navigate = useNavigate();

  const sendEmailCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        message.error('请先填写邮箱');
        return;
      }
      setSendingCode(true);
      await api.sendRegisterEmailCode(email);
      message.success('仙鹤传书已发出');
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '传书失败');
    } finally {
      setSendingCode(false);
    }
  };

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await register(values);
      message.success('筑基成功，欢迎入阁');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '筑基失败');
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "!bg-black/20 !border-white/10 !text-text-primary placeholder:!text-text-muted hover:!border-accent/40 focus:!border-accent focus:!shadow-glow-purple rounded-md h-12 text-lg font-serif";

  // Ink Icons
  const UserIcon = () => (
    <svg className="w-5 h-5 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const EmailIcon = () => (
    <svg className="w-5 h-5 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const LockIcon = () => (
    <svg className="w-5 h-5 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const CodeIcon = () => (
    <svg className="w-5 h-5 text-accent/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark relative overflow-hidden py-10">
      {/* 动态水墨背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-ink-texture opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-ink-gradient opacity-90" />
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-mist opacity-30 pointer-events-none" />

        {/* 装饰光晕 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* 注册卡片 */}
      <div className="relative w-full max-w-lg px-4 z-10 animate-fade-in-up">
        {/* Logo区域 */}
        <div className="text-center mb-8 group cursor-default">
          <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-mystic-gradient tracking-widest drop-shadow-sm mb-2">
            拜入<span className="text-accent">玄幻阁</span>
          </h1>
          <p className="text-text-secondary font-serif tracking-[0.2em] opacity-80 group-hover:text-accent transition-colors duration-500">
            从此踏上不朽仙途
          </p>
        </div>

        {/* 表单容器 */}
        <div className="bg-dark-paper/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
          {/* 边角装饰 */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-accent/20 rounded-tl-xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-accent/20 rounded-br-xl" />

          <Form<RegisterFormValues> form={form} name="register" onFinish={onFinish} autoComplete="off" layout="vertical">
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请设道号' },
                  { min: 3, message: '道号至少3个字符' }
                ]}
              >
                <Input
                  prefix={<UserIcon />}
                  placeholder="道号 (用户名)"
                  size="large"
                  className={inputClassName}
                />
              </Form.Item>

              <Form.Item
                name="displayName"
                rules={[{ required: true, message: '请输入称号' }]}
              >
                <Input
                  prefix={<UserIcon />}
                  placeholder="称号 (昵称)"
                  size="large"
                  className={inputClassName}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入灵鸽传书地址' },
                { type: 'email', message: '地址格式有误' },
              ]}
            >
              <Input
                prefix={<EmailIcon />}
                placeholder="灵鸽传书 (邮箱)"
                size="large"
                className={inputClassName}
              />
            </Form.Item>

            <Form.Item name="code" rules={[{ required: true, message: '请输入密文' }]}>
              <div className="flex gap-2">
                <Input
                  prefix={<CodeIcon />}
                  placeholder="密文 (验证码)"
                  size="large"
                  className={`flex-1 ${inputClassName}`}
                />
                <button
                  type="button"
                  onClick={sendEmailCode}
                  disabled={sendingCode || countdown > 0}
                  className={`h-12 px-6 rounded-md font-serif tracking-wider border transition-all duration-300 ${countdown > 0
                      ? 'border-white/10 text-text-muted bg-white/5 cursor-not-allowed'
                      : 'border-accent text-accent hover:bg-accent/10 hover:shadow-glow-purple'
                    }`}
                >
                  {sendingCode ? '传书中...' : countdown > 0 ? `${countdown}s` : '传书'}
                </button>
              </div>
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请设置通灵印记' },
                { min: 6, message: '印记至少6个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockIcon />}
                placeholder="通灵印记 (密码)"
                size="large"
                className={inputClassName}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认印记' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次印记不符'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockIcon />}
                placeholder="确认印记"
                size="large"
                className={inputClassName}
              />
            </Form.Item>

            <Form.Item className="mb-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full app-button h-12 text-lg shadow-glow-red hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-md font-display tracking-widest relative overflow-hidden group"
              >
                <span className="relative z-10">{loading ? '正在筑基...' : '筑 基'}</span>
                {/* 按钮内流光 */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              </button>
            </Form.Item>

            <div className="text-center text-sm font-serif">
              <span className="text-text-muted">已有仙籍？</span>
              <Link to="/login" className="text-accent hover:text-accent-light ml-2 transition-colors inline-flex items-center group">
                <span>前往通灵</span>
                <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all ml-1">→</span>
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
