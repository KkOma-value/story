import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Input, Modal, Form, Select } from 'antd';
import { StopOutlined, CheckCircleOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../../api';
import type { User } from '../../types';

export const AdminUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchData = async (p: number, ps: number) => {
    setLoading(true);
    try {
      const res = await api.adminGetUsers({ page: p, pageSize: ps, keyword });
      setData(res.items);
      setTotal(res.total);
      setPage(p);
      setPageSize(ps);
    } catch {
      message.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, pageSize);
  }, []);

  const handleBan = async (id: string, type: 'banned' | 'permanent_banned') => {
    try {
      await api.adminBanUser(id, type);
      message.success(type === 'permanent_banned' ? '已永久封禁' : '已封禁');
      fetchData(page, pageSize);
    } catch {
      message.error('操作失败');
    }
  };

  const handleUnban = async (id: string) => {
    try {
      await api.adminUnbanUser(id);
      message.success('已解封');
      fetchData(page, pageSize);
    } catch {
      message.error('操作失败');
    }
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      displayName: record.displayName || '',
      avatarUrl: record.avatarUrl || '',
      bio: record.bio || '',
      role: record.role,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!editingUser) return;

      setSaving(true);
      await api.adminUpdateUser(editingUser.id, values);
      message.success('用户信息已更新');
      setModalVisible(false);
      fetchData(page, pageSize);
    } catch {
      // Validation or API error
    } finally {
      setSaving(false);
    }
  };

  const getStatusTag = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'active':
        return <Tag color="green">正常</Tag>;
      case 'banned':
        return <Tag color="orange">已封禁</Tag>;
      case 'permanent_banned':
        return <Tag color="red">永久封禁</Tag>;
      case 'deleted':
        return <Tag color="default">已删除</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      ellipsis: true,
      render: (id: string) => <span className="text-xs text-gray-400">{id.slice(0, 8)}...</span>
    },
    {
      title: '用户',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.avatarUrl ? (
            <img src={record.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
              {(record.displayName || record.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium">{record.displayName || record.username}</div>
            <div className="text-xs text-gray-400">@{record.username}</div>
          </div>
        </div>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'purple' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status !== 'banned' && record.status !== 'permanent_banned' && (
            <Popconfirm
              title="封禁类型"
              description={
                <div className="py-2">
                  <Button
                    size="small"
                    danger
                    className="mr-2"
                    onClick={() => handleBan(record.id, 'banned')}
                  >
                    临时封禁
                  </Button>
                  <Button
                    size="small"
                    danger
                    type="primary"
                    onClick={() => handleBan(record.id, 'permanent_banned')}
                  >
                    永久封禁
                  </Button>
                </div>
              }
              showCancel={false}
              okButtonProps={{ style: { display: 'none' } }}
            >
              <Button size="small" danger icon={<StopOutlined />}>封禁</Button>
            </Popconfirm>
          )}
          {(record.status === 'banned' || record.status === 'permanent_banned') && (
            <Popconfirm title="确定要解封该用户吗?" onConfirm={() => handleUnban(record.id)}>
              <Button size="small" icon={<CheckCircleOutlined />}>解封</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-text-primary tracking-[0.25em] uppercase">
            用户管理
          </h2>
          <p className="text-xs text-text-secondary font-mono tracking-widest">
            USER DIRECTORY // ROLE · STATUS · ACTIVITY
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Input
            placeholder="搜索用户..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => fetchData(1, pageSize)}
            style={{ width: 220 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchData(1, pageSize)}
            className="app-button !px-4 !py-1.5 !text-xs"
          >
            搜索
          </Button>
        </div>
      </div>
      <div className="bg-dark-paper/60 border border-dark-border rounded-md shadow-elevation-1 overflow-hidden">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          className="bg-transparent text-text-primary"
          rowClassName={() => 'hover:bg-dark-hover/80 transition-colors'}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: fetchData,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条记录`,
          }}
          scroll={{ x: 900 }}
        />
      </div>

      {/* Edit User Modal */}
      <Modal
        title="编辑用户信息"
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="昵称"
          >
            <Input placeholder="昵称" />
          </Form.Item>
          <Form.Item
            name="avatarUrl"
            label="头像链接"
          >
            <Input placeholder="https://example.com/avatar.png" />
          </Form.Item>
          <Form.Item
            name="bio"
            label="简介"
          >
            <Input.TextArea rows={3} placeholder="用户简介" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
