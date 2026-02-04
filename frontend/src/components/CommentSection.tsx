import React, { useState, useEffect } from 'react';
import { Avatar, Button, Input, List, message, Pagination } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import type { CommentThread } from '../types';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

interface CommentSectionProps {
    novelId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ novelId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [comments, setComments] = useState<CommentThread[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);

    const fetchComments = async (p: number) => {
        try {
            const res = await api.getComments(novelId, p, 10);
            setComments(res.items);
            setTotal(res.total);
            setPage(res.page);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchComments(1);
    }, [novelId]);

    const handleSubmit = async (parentId?: string) => {
        if (!user) {
            navigate('/login');
            return;
        }
        const text = parentId ? replyContent : content;
        if (!text.trim()) {
            message.warning('请输入评论内容');
            return;
        }

        setSubmitting(true);
        try {
            await api.postComment(novelId, text, parentId);
            message.success('评论发表成功');
            if (parentId) {
                setReplyContent('');
                setReplyTo(null);
            } else {
                setContent('');
            }
            fetchComments(page);
        } catch (err: any) {
            message.error(err.message || '发表失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            await api.deleteComment(commentId);
            message.success('已删除');
            fetchComments(page);
        } catch (err: any) {
            message.error('删除失败');
        }
    };

    return (
        <div className="mt-8 bg-dark-paper/80 backdrop-blur-sm border border-white/5 rounded-xl p-6 shadow-ink">
            <h3 className="text-xl font-display text-text-primary mb-6 border-l-4 border-accent pl-4 flex items-center justify-between">
                <span>书友论道 ({total})</span>
            </h3>

            {/* Main Comment Input */}
            <div className="flex gap-4 mb-8">
                <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
                <div className="flex-1">
                    <TextArea
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={user ? "道友请留步，发表你的看法..." : "请先入阁（登录）后再发表评论"}
                        className="mb-2 !bg-black/20 !border-white/10 !text-text-secondary focus:!border-accent/50"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="primary"
                            loading={submitting}
                            onClick={() => handleSubmit()}
                            className="bg-accent hover:bg-accent/80 border-none"
                        >
                            发表评论
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <List
                itemLayout="vertical"
                dataSource={comments}
                renderItem={(item) => (
                    <List.Item className="!border-white/5">
                        <List.Item.Meta
                            avatar={<Avatar src={item.userAvatar} icon={<UserOutlined />} />}
                            title={
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-accent font-bold">{item.userDisplayName}</span>
                                        <span className="text-text-muted text-xs">{new Date(item.createdAt).toLocaleString()}</span>
                                    </div>
                                    {user && item.userId === user.id && !item.deleted && (
                                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>删除</Button>
                                    )}
                                </div>
                            }
                            description={
                                <div className={`text-text-secondary ${item.deleted ? 'italic opacity-50' : ''}`}>
                                    {item.deleted ? '此评论已被删除' : item.content}
                                </div>
                            }
                        />

                        {/* Actions for Root Comment */}
                        {!item.deleted && (
                            <div className="ml-12 mb-4">
                                <Button
                                    type="link"
                                    size="small"
                                    className="text-text-muted hover:text-accent p-0"
                                    onClick={() => setReplyTo(replyTo === item.id ? null : item.id)}
                                >
                                    {replyTo === item.id ? '取消回复' : '回复'}
                                </Button>
                            </div>
                        )}

                        {/* Reply Input */}
                        {replyTo === item.id && (
                            <div className="ml-12 mb-4 flex gap-2 animate-fade-in">
                                <Input
                                    value={replyContent}
                                    onChange={e => setReplyContent(e.target.value)}
                                    placeholder={`回复 @${item.userDisplayName}`}
                                    className="!bg-black/20 !border-white/10 !text-text-secondary"
                                />
                                <Button type="primary" size="small" loading={submitting} onClick={() => handleSubmit(item.id)}>发送</Button>
                            </div>
                        )}

                        {/* Replies */}
                        {item.replies && item.replies.length > 0 && (
                            <div className="ml-12 space-y-3 bg-white/5 p-4 rounded-sm border-l-2 border-accent/20">
                                {item.replies.map(reply => (
                                    <div key={reply.id} className="group relative">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-accent/80 text-sm font-bold">{reply.userDisplayName}</span>
                                            <span className="text-text-muted text-xs">{new Date(reply.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className={`text-text-secondary text-sm ${reply.deleted ? 'italic opacity-50' : ''}`}>
                                            {reply.deleted ? '此评论已被删除' : reply.content}
                                        </div>
                                        {user && reply.userId === user.id && !reply.deleted && (
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDelete(reply.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 scale-75"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </List.Item>
                )}
            />

            {/* Pagination */}
            {total > 10 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={page}
                        total={total}
                        onChange={p => fetchComments(p)}
                        showSizeChanger={false}
                        itemRender={(_page, _type, originalElement) => {
                            return originalElement;
                        }}
                    />
                </div>
            )}
        </div>
    );
};
