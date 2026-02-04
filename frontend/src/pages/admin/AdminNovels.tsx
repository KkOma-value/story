import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../../api';
import type { Novel } from '../../types';

export const AdminNovels: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Novel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit/Create Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchData = async (p: number, ps: number) => {
    setLoading(true);
    try {
      const res = await api.adminGetNovels({ page: p, pageSize: ps });
      setData(res.items);
      setTotal(res.total);
      setPage(p);
      setPageSize(ps);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, pageSize);
  }, []);

  const handleEdit = (record: Novel) => {
    setEditingId(String(record.id));
    form.setFieldsValue({
      title: record.title,
      author: record.author,
      category: record.category,
      intro: record.intro,
      tags: record.tags?.join(','),
      coverUrl: record.coverUrl,
    });
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.adminDeleteNovel(id);
      message.success('已删除');
      fetchData(page, pageSize);
    } catch {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
      };

      if (editingId) {
        await api.adminUpdateNovel(editingId, payload);
        message.success('更新成功');
      } else {
        await api.adminCreateNovel(payload);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData(page, pageSize);
    } catch {
      // ignore
    }
  };

  const columns: ColumnsType<Novel> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '封面', dataIndex: 'coverUrl', key: 'cover', render: (url) => url ? <img src={url} alt="cover" style={{ width: 30, height: 40, objectFit: 'cover' }} /> : '-' },
    { title: '书名', dataIndex: 'title', key: 'title' },
    { title: '作者', dataIndex: 'author', key: 'author' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(String(record.id))}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-text-primary tracking-[0.25em] uppercase">
            小说管理
          </h2>
          <p className="text-xs text-text-secondary font-mono tracking-widest">
            MANAGE CATALOG // METADATA · 状态 · 标签
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            icon={<CloudDownloadOutlined />}
            href="/api/admin/novels/export"
            className="app-button-outline !px-4 !py-1.5 !text-xs"
          >
            导出数据
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="app-button !px-4 !py-1.5 !text-xs"
          >
            新增小说
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
          }}
        />
      </div>

      <Modal
        title={editingId ? '编辑小说' : '新增小说'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="书名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tags" label="标签 (逗号分隔)">
            <Input placeholder="玄幻,热血" />
          </Form.Item>
          <Form.Item name="intro" label="简介" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面链接">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
