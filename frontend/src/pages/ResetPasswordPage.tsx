import React, { useState } from 'react';
import { Form, Input, message, Steps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

// SVG Icons
const EmailIcon = () => (
  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

interface Step1FormValues {
  email: string;
}

interface Step2FormValues {
  code: string;
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const inputClassName = "!bg-white !border-dark-border !text-text hover:!border-primary/50 focus:!border-primary";

  const sendResetCode = async () => {
    try {
      const emailValue = form.getFieldValue('email');
      if (!emailValue) {
        message.error('请先填写邮箱');
        return;
      }
      setSendingCode(true);
      await api.sendResetEmailCode(emailValue);
      message.success('验证码已发送');
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
      message.error(error.message || '发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };

  const onStep1Finish = async (values: Step1FormValues) => {
    setEmail(values.email);
    setCurrentStep(1);
    form.resetFields();
  };

  const onStep2Finish = async (values: Step2FormValues) => {
    setLoading(true);
    try {
      await api.resetPassword({
        email: email,
        code: values.code,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      message.success('密码重置成功');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { message?: string };
      message.error(error.message || '重置密码失败');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: '输入邮箱',
      description: '验证您的账号'
    },
    {
      title: '重置密码',
      description: '设置新密码'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">

      {/* 重置密码卡片 */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-3">
            <span className="font-display text-3xl font-bold text-primary">玄</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-text">
            重置<span className="text-primary">密码</span>
          </h1>
        </div>

        {/* 步骤指示器 */}
        <div className="mb-8">
          <Steps
            current={currentStep}
            size="small"
            items={steps.map((step) => ({
              title: <span className="text-text">{step.title}</span>,
              description: <span className="text-text-muted text-xs">{step.description}</span>
            }))}
            className="reset-password-steps"
          />
        </div>

        {/* 表单卡片 */}
        <div className="app-card-lg">
          {currentStep === 0 ? (
            <>
              <h2 className="font-display text-xl font-bold text-text text-center mb-6">
                输入您的邮箱
              </h2>

              <Form<Step1FormValues>
                form={form}
                name="step1"
                onFinish={onStep1Finish}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '邮箱格式不正确' },
                  ]}
                >
                  <Input
                    prefix={<EmailIcon />}
                    placeholder="邮箱地址"
                    size="large"
                    className={inputClassName}
                  />
                </Form.Item>

                <div className="mb-6">
                  <button
                    type="button"
                    onClick={sendResetCode}
                    disabled={sendingCode || countdown > 0}
                    className={countdown > 0 ? 'app-button-ghost opacity-60 cursor-not-allowed w-full' : 'app-button-outline w-full'}
                  >
                    {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </button>
                </div>

                <Form.Item className="mb-4">
                  <button
                    type="submit"
                    disabled={sendingCode || countdown === 0}
                    className="w-full app-button disabled:opacity-50"
                  >
                    下一步
                  </button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-text text-center mb-6">
                设置新密码
              </h2>

              <Form<Step2FormValues>
                form={form}
                name="step2"
                onFinish={onStep2Finish}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
                  <Input
                    prefix={<CodeIcon />}
                    placeholder="验证码"
                    size="large"
                    className={inputClassName}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockIcon />}
                    placeholder="新密码"
                    size="large"
                    className={inputClassName}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockIcon />}
                    placeholder="确认密码"
                    size="large"
                    className={inputClassName}
                  />
                </Form.Item>

                <Form.Item className="mb-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full app-button disabled:opacity-50"
                  >
                    {loading ? '重置中...' : '重置密码'}
                  </button>
                </Form.Item>
              </Form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    form.resetFields();
                  }}
                  className="text-text-muted hover:text-text transition-colors text-sm"
                >
                  返回上一步
                </button>
              </div>
            </>
          )}

          <div className="text-center mt-6 text-text-muted">
            想起密码了？
            <Link to="/login" className="text-primary hover:text-primary-400 ml-1 transition-colors">
              去登录
            </Link>
          </div>
        </div>

        {/* 底部装饰文字 */}
        <p className="text-center text-text-muted/50 text-sm mt-6">
          © {new Date().getFullYear()} 玄幻阁 · 男频小说推荐系统
        </p>
      </div>
    </div>
  );
};