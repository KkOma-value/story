import React, { useState, useEffect } from 'react';
import { Table, Tabs, DatePicker, Row, Col, Statistic, message } from 'antd';
import { BarChartOutlined, UserOutlined, BookOutlined, EyeOutlined, HeartOutlined, StarOutlined, ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { api } from '../../api';

const { RangePicker } = DatePicker;

interface NovelAnalyticsItem {
    novelId: string;
    title: string;
    views: number;
    favorites: number;
    ratingCount: number;
    avgRating: number;
}

interface UserAnalyticsItem {
    userId: string;
    username: string;
    displayName: string;
    logins: number;
    searches: number;
    novelViews: number;
    favorites: number;
    ratings: number;
    comments: number;
}

const NovelAnalyticsTable: React.FC<{ dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] }> = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<NovelAnalyticsItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchData = async (p: number, ps: number) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page: p, pageSize: ps };
            if (dateRange[0]) params.from = dateRange[0].format('YYYY-MM-DD');
            if (dateRange[1]) params.to = dateRange[1].format('YYYY-MM-DD');

            const res = await api.adminGetNovelAnalytics(params);
            setData(res.items);
            setTotal(res.total);
            setPage(p);
            setPageSize(ps);
        } catch {
            message.error('加载小说分析数据失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pageSize);
    }, [dateRange]);

    // Calculate summary statistics
    const totalViews = data.reduce((sum, item) => sum + item.views, 0);
    const totalFavorites = data.reduce((sum, item) => sum + item.favorites, 0);
    const avgRating = data.length > 0
        ? (data.reduce((sum, item) => sum + item.avgRating, 0) / data.length).toFixed(2)
        : '0';

    const columns: ColumnsType<NovelAnalyticsItem> = [
        {
            title: '小说名',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            width: 200,
            render: (text) => <span className="font-bold text-amber-500 drop-shadow-sm">{text}</span>,
        },
        {
            title: '浏览量',
            dataIndex: 'views',
            key: 'views',
            sorter: (a, b) => a.views - b.views,
            render: (v) => <span className="font-mono text-cyan-400">{v.toLocaleString()}</span>,
        },
        {
            title: '收藏数',
            dataIndex: 'favorites',
            key: 'favorites',
            sorter: (a, b) => a.favorites - b.favorites,
            render: (v) => <span className="font-mono text-purple-400">{v.toLocaleString()}</span>,
        },
        {
            title: '评分人数',
            dataIndex: 'ratingCount',
            key: 'ratingCount',
            sorter: (a, b) => a.ratingCount - b.ratingCount,
            render: (v) => <span className="font-mono text-gray-300">{v}</span>,
        },
        {
            title: '平均评分',
            dataIndex: 'avgRating',
            key: 'avgRating',
            sorter: (a, b) => a.avgRating - b.avgRating,
            render: (v) => (
                <span className={`font-bold font-mono ${v >= 4 ? 'text-red-500' : v >= 3 ? 'text-amber-500' : 'text-gray-500'}`}>
                    {v.toFixed(1)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Summary Cards */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-lg p-6 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
                        <Statistic
                            title={<span className="text-gray-400 group-hover:text-amber-400 transition-colors">总浏览量</span>}
                            value={totalViews}
                            valueStyle={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}
                            prefix={<EyeOutlined className="text-amber-500 mr-2 animate-pulse" />}
                        />
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-lg p-6 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
                        <Statistic
                            title={<span className="text-gray-400 group-hover:text-cyan-400 transition-colors">总收藏数</span>}
                            value={totalFavorites}
                            valueStyle={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}
                            prefix={<HeartOutlined className="text-cyan-500 mr-2" />}
                        />
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-lg p-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
                        <Statistic
                            title={<span className="text-gray-400 group-hover:text-red-400 transition-colors">平均评分</span>}
                            value={avgRating}
                            valueStyle={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}
                            prefix={<StarOutlined className="text-red-500 mr-2" />}
                            suffix={<span className="text-xs text-gray-500">/ 5</span>}
                        />
                    </div>
                </Col>
            </Row>

            <div className="bg-slate-900/60 backdrop-blur-lg rounded-xl border border-white/5 p-4 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="novelId"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        onChange: fetchData,
                        showSizeChanger: true,
                        showTotal: (t) => <span className="text-gray-400">共 {t} 条记录</span>,
                        className: "text-gray-300",
                    }}
                    rowClassName="hover:bg-white/5 transition-colors"
                />
            </div>
        </div>
    );
};

const UserAnalyticsTable: React.FC<{ dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] }> = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<UserAnalyticsItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchData = async (p: number, ps: number) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page: p, pageSize: ps };
            if (dateRange[0]) params.from = dateRange[0].format('YYYY-MM-DD');
            if (dateRange[1]) params.to = dateRange[1].format('YYYY-MM-DD');

            const res = await api.adminGetUserAnalytics(params);
            setData(res.items);
            setTotal(res.total);
            setPage(p);
            setPageSize(ps);
        } catch {
            message.error('加载用户分析数据失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pageSize);
    }, [dateRange]);

    // Calculate summary statistics
    const totalLogins = data.reduce((sum, item) => sum + item.logins, 0);
    const totalSearches = data.reduce((sum, item) => sum + item.searches, 0);
    const totalInteractions = data.reduce((sum, item) => sum + item.favorites + item.ratings + item.comments, 0);

    const columns: ColumnsType<UserAnalyticsItem> = [
        {
            title: '用户',
            key: 'user',
            width: 200,
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-200">{record.displayName || record.username}</span>
                    <span className="text-xs text-amber-500/80 font-mono">@{record.username}</span>
                </div>
            ),
        },
        {
            title: '登录',
            dataIndex: 'logins',
            key: 'logins',
            sorter: (a, b) => a.logins - b.logins,
            render: (v) => <span className="font-mono text-cyan-400">{v}</span>,
        },
        {
            title: '搜索',
            dataIndex: 'searches',
            key: 'searches',
            sorter: (a, b) => a.searches - b.searches,
            render: (v) => <span className="font-mono text-purple-400">{v}</span>,
        },
        {
            title: '浏览',
            dataIndex: 'novelViews',
            key: 'novelViews',
            sorter: (a, b) => a.novelViews - b.novelViews,
            render: (v) => <span className="font-mono text-indigo-400">{v}</span>,
        },
        {
            title: '互动',
            key: 'interactions',
            render: (_, r) => (
                <div className="flex gap-2 text-xs">
                    <span className="text-red-400" title="收藏"><HeartOutlined /> {r.favorites}</span>
                    <span className="text-yellow-400" title="评分"><StarOutlined /> {r.ratings}</span>
                    <span className="text-blue-400" title="评论"><FireOutlined /> {r.comments}</span>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Summary Cards */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-lg p-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
                        <Statistic
                            title={<span className="text-gray-400 group-hover:text-blue-400 transition-colors">总登录次数</span>}
                            value={totalLogins}
                            valueStyle={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}
                            prefix={<UserOutlined className="text-blue-500 mr-2" />}
                        />
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-lg p-6 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
                        <Statistic
                            title={<span className="text-gray-400 group-hover:text-purple-400 transition-colors">总搜索次数</span>}
                            value={totalSearches}
                            valueStyle={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}
                            prefix={<BarChartOutlined className="text-purple-500 mr-2" />}
                        />
                    </div>
                </Col>
                <Col xs={24} sm={8}>
                    <div className="bg-slate-900/40 backdrop-blur-md rounded-lg p-6 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
                        <Statistic
                            title={<span className="text-gray-400 group-hover:text-indigo-400 transition-colors">总互动次数</span>}
                            value={totalInteractions}
                            valueStyle={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}
                            prefix={<ThunderboltOutlined className="text-indigo-500 mr-2" />}
                        />
                    </div>
                </Col>
            </Row>

            <div className="bg-slate-900/60 backdrop-blur-lg rounded-xl border border-white/5 p-4 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="userId"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        onChange: fetchData,
                        showSizeChanger: true,
                        showTotal: (t) => <span className="text-gray-400">共 {t} 条记录</span>,
                        className: "text-gray-300",
                    }}
                    rowClassName="hover:bg-white/5 transition-colors"
                />
            </div>
        </div>
    );
};

export const AdminAnalytics: React.FC = () => {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

    const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        setDateRange(dates || [null, null]);
    };

    const items = [
        {
            key: 'novels',
            label: (
                <span className="flex items-center gap-2 text-base">
                    <BookOutlined />
                    小说数据
                </span>
            ),
            children: <NovelAnalyticsTable dateRange={dateRange} />,
        },
        {
            key: 'users',
            label: (
                <span className="flex items-center gap-2 text-base">
                    <UserOutlined />
                    用户行为
                </span>
            ),
            children: <UserAnalyticsTable dateRange={dateRange} />,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-semibold text-text-primary tracking-[0.35em] uppercase mb-2">
                        <BarChartOutlined className="mr-3 text-primary" />
                        数据分析
                    </h1>
                    <p className="text-xs text-text-secondary font-mono tracking-widest">
                        ANALYTICS MODULE // NOVEL PERFORMANCE · USER BEHAVIOUR
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/60 px-3 py-2 rounded-lg border border-dark-border">
                    <span className="text-primary text-xs font-bold font-mono tracking-widest">时间区间 //</span>
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        allowClear
                        className="bg-transparent border-none text-white w-64 hover:bg-white/5"
                        placeholder={['开始日期', '结束日期']}
                    />
                </div>
            </div>

            <Tabs
                defaultActiveKey="novels"
                items={items}
                className="custom-tabs"
                tabBarStyle={{ marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                type="card"
            />

            <style>{`
                .custom-tabs .ant-tabs-nav::before {
                    border-bottom: none !important;
                }
                .custom-tabs .ant-tabs-tab {
                    background: transparent !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-bottom: none !important;
                    margin-right: 8px !important;
                    border-radius: 8px 8px 0 0 !important;
                    padding: 8px 24px !important;
                    transition: all 0.3s ease !important;
                }
                .custom-tabs .ant-tabs-tab-active {
                    background: rgba(245, 158, 11, 0.1) !important;
                    border-color: rgba(245, 158, 11, 0.5) !important;
                }
                .custom-tabs .ant-tabs-tab:hover {
                    color: #fbbf24 !important;
                    border-color: rgba(245, 158, 11, 0.3) !important;
                }
                
                /* Custom Scrollbar for Table */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                }
                ::-webkit-scrollbar-thumb {
                    background: #475569;
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
