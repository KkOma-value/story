# Design: Backend API implementation

## Context
- 已有 OpenAPI 契约（`api-design/openapi.yaml`）与文字契约（`api-design/api.md`）。
- 前端已通过 `frontend/src/api/real.ts` 按契约路径调用。
- 本设计聚焦：在单体后端中实现契约，并给出可落地的存储与鉴权方案。

## Goals
- 实现 `/api` 下所有契约 endpoints（Auth/Users/Novels/Interactions/Recommendations/Admin/Analytics）
- 统一响应包裹与错误语义，便于前端直接展示 `message`
- 安全默认：JWT Bearer；密码哈希；管理员接口 RBAC
- 可本地开发：一键启动、可迁移、可 seed

## Non-Goals
- 不在本变更中引入复杂推荐训练流水线/离线作业
- 不强制引入搜索引擎或消息队列

## Key decisions
### Framework
- 默认：Django + Django REST Framework
  - 理由：内置管理、ORM、认证扩展成熟；开发速度快
- 可选：Flask
  - 代价：更多中间件/工程化需自建（认证、输入校验、错误包装、管理后台）

### Data storage
- MySQL：核心业务表（users, novels, favorites, ratings, comments, admin audit/analytics sources）
- Redis（可选但推荐）：
  - 邮箱验证码存储（短 TTL）
  - 登录/登出 token 失效策略（黑名单或会话表）
  - 热门/最新/搜索结果短缓存（读多写少场景）

### Auth & security
- 登录方式：email + password（因 username 可重复）
- JWT：`Authorization: Bearer <token>`
- Logout 策略（二选一）：
  - Stateless：登出仅由前端清理 token（实现最简单，但 token 在过期前仍可用）
  - Server-side invalidation（推荐）：登出时将 token jti 或 token hash 写入 Redis 黑名单，TTL=token 剩余寿命

### Response & errors
- JSON 统一响应：`{ success: boolean, message: string, data: any|null }`
- 错误：HTTP 状态码表达语义（400/401/403/404/409/500），message 可直接展示
- 文件下载：`/api/admin/novels/export` 返回二进制流，不使用 JSON 包裹

### Pagination
- 请求：`page` 从 1 开始，`pageSize` >= 1
- 响应：`{ items: [], total, page, pageSize }`

### Soft delete
- 互动取消收藏：逻辑删除
- 管理端删除用户/小说：逻辑删除（保留数据与统计可追溯性）

## Data model (conceptual)
- User (role/status)
- Novel (status: active/shelved/deleted)
- Favorite (unique user_id + novel_id, soft delete)
- Rating (unique user_id + novel_id, score 1-5)
- Comment (parent_id nullable, soft delete)
- Analytics: 以业务表聚合查询为主（初期不引入独立数仓）

## Migration & rollout
- 第一阶段：实现 API 最小可用（返回结构/鉴权/基础 CRUD），保证前端 realApi 可跑通
- 第二阶段：补齐管理端/导出/统计与更严格的校验与测试
