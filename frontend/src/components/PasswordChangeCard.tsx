import React, { useState, useMemo } from 'react';
import { CardSpotlight } from './ui/card-spotlight';
import { Button as MovingBorderButton } from './ui/moving-border';
import { TextGenerateEffect } from './ui/text-generate-effect';

interface PasswordChangeCardProps {
    onSubmit: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
    loading: boolean;
}

export const PasswordChangeCard: React.FC<PasswordChangeCardProps> = ({ onSubmit, loading }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showStrength, setShowStrength] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        let score = 0;
        let label = '弱';
        let color = 'bg-red-500';

        if (newPassword.length >= 8) score += 25;
        if (newPassword.length >= 12) score += 15;
        if (/[a-z]/.test(newPassword)) score += 15;
        if (/[A-Z]/.test(newPassword)) score += 15;
        if (/\d/.test(newPassword)) score += 15;
        if (/[!@#$%^&*(),.?\":{}|<>]/.test(newPassword)) score += 15;

        if (score >= 70) {
            label = '强';
            color = 'bg-green-500';
        } else if (score >= 40) {
            label = '中';
            color = 'bg-yellow-500';
        }

        return { score, label, color };
    }, [newPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const newErrors: { [key: string]: string } = {};
        if (!oldPassword) {
            newErrors.oldPassword = '请输入当前密码';
        }
        if (newPassword.length < 8) {
            newErrors.newPassword = '新密码至少8个字符';
        }
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = '两次密码输入不一致';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        await onSubmit({ oldPassword, newPassword });
    };

    return (
        <CardSpotlight className="p-6 w-full" radius={300} color="#C0392B">
            <div className="flex items-center gap-2 text-action font-display text-xl mb-6">
                <span className="text-2xl">◈</span> 重铸密匙
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Old Password */}
                <div>
                    <label className="text-sm text-text-muted font-serif mb-2 block">当前密码</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={`w-full bg-black/30 border rounded-sm px-4 py-3 text-text-primary
                            focus:outline-none transition-all duration-300
                            ${errors.oldPassword
                                ? 'border-action focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.3)]'
                                : 'border-white/10 focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.2)]'
                            }
                            placeholder:text-text-muted/50`}
                        placeholder="输入当前密码"
                    />
                    {errors.oldPassword && (
                        <p className="text-action text-xs mt-1 animate-fade-in-up">{errors.oldPassword}</p>
                    )}
                </div>

                {/* New Password */}
                <div>
                    <label className="text-sm text-text-muted font-serif mb-2 block">新密码</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setShowStrength(true);
                        }}
                        className={`w-full bg-black/30 border rounded-sm px-4 py-3 text-text-primary
                            focus:outline-none transition-all duration-300
                            ${errors.newPassword
                                ? 'border-action focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.3)]'
                                : 'border-white/10 focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.2)]'
                            }
                            placeholder:text-text-muted/50`}
                        placeholder="输入新密码"
                    />
                    {errors.newPassword && (
                        <p className="text-action text-xs mt-1 animate-fade-in-up">{errors.newPassword}</p>
                    )}

                    {/* Password Strength Indicator with TextGenerateEffect */}
                    {showStrength && newPassword && (
                        <div className="mt-2 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-1.5 bg-dark-hover rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordStrength.color} transition-all duration-500`}
                                        style={{ width: `${passwordStrength.score}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-text-muted font-mono">{passwordStrength.label}</span>
                            </div>

                            <div className="space-y-1 text-xs text-text-muted mt-2">
                                <p className="flex items-center gap-1">
                                    {newPassword.length >= 8 ? '✓' : '○'} 至少8个字符
                                </p>
                                <p className="flex items-center gap-1">
                                    {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? '✓' : '○'} 大小写字母
                                </p>
                                <p className="flex items-center gap-1">
                                    {/\d/.test(newPassword) ? '✓' : '○'} 包含数字
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="text-sm text-text-muted font-serif mb-2 block">确认新密码</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full bg-black/30 border rounded-sm px-4 py-3 text-text-primary
                            focus:outline-none transition-all duration-300
                            ${errors.confirmPassword
                                ? 'border-action focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.3)]'
                                : 'border-white/10 focus:border-action focus:shadow-[0_0_10px_rgba(192,57,43,0.2)]'
                            }
                            placeholder:text-text-muted/50`}
                        placeholder="再次输入新密码"
                    />
                    {errors.confirmPassword && (
                        <p className="text-action text-xs mt-1 animate-fade-in-up">{errors.confirmPassword}</p>
                    )}
                    {!errors.confirmPassword && confirmPassword && newPassword === confirmPassword && (
                        <p className="text-green-500 text-xs mt-1 animate-fade-in-up flex items-center gap-1">
                            ✓ 密码匹配
                        </p>
                    )}
                </div>

                {/* Submit with MovingBorder (Red theme) */}
                <div className="pt-4">
                    <MovingBorderButton
                        type="submit"
                        disabled={loading}
                        className="w-full text-action font-display text-base disabled:opacity-50"
                        containerClassName="w-full"
                        borderClassName="bg-action opacity-[0.8]"
                        duration={3000}
                        borderRadius="4px"
                    >
                        {loading ? '密匙重铸中...' : '🔐 更改密码'}
                    </MovingBorderButton>
                </div>
            </form>
        </CardSpotlight>
    );
};
