# Design: add-user-personal-center-ui

## Overview
本变更聚焦“个人中心 UI”的聚合与一致性：
- **个人资料管理**：展示并编辑用户基础信息。
- **我的收藏管理**：展示收藏小说列表，并支持移除收藏。

后端能力已存在，核心设计点在于：
1) 个人中心的信息架构（Tabs/子路由）；
2) 收藏移除的交互（单条/批量、确认弹窗、乐观更新）；
3) 前端 real API 路径与后端 contract 对齐。

## UX / IA
- 路由：保持现有用户侧路由体系，个人中心入口为 `.../profile`。
- 页面组织（建议）：Tabs
  - 个人资料（编辑 displayName/avatarUrl/bio）
  - 我的收藏（列表 + 移除）
  - （可选保留现有）我的评论、我的评分、修改密码

## Data flow
- 个人资料：
  - 读取：`GET /api/users/me`
  - 更新：`PUT /api/users/me`（部分字段更新）
  - 保存成功后触发 `refreshUser()` 以更新全局登录态展示

- 我的收藏：
  - 列表：`GET /api/users/me/favorites?page=1&pageSize=10`
  - 移除：`DELETE /api/novels/{novelId}/favorite`
  - UI 更新策略：
    - 先实现“请求成功后从列表移除”的保守策略
    - 若体验需要可升级为乐观更新 + 失败回滚

## Error / Empty states
- 列表为空：展示空态并引导去分类/搜索页。
- API 失败：使用统一错误提示（沿用现有 Axios/err.message 约定）。

## Compatibility
- 不新增后端 endpoints。
- 若前端 real API 当前使用 `/api/me`，需要在实现阶段统一迁移到 `/api/users/me`，避免与后端路由不一致。
