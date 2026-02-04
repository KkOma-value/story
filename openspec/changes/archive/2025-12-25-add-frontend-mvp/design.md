# Design: Frontend MVP architecture

## Overview
本设计面向单一前端工程（React + TypeScript + Vite + Ant Design），实现普通端与管理端共存，但按用户角色（user/admin）进行路由分流。

后端 API 暂未确定，因此本阶段的核心设计目标是：
- 页面与交互先行（可用 mock 数据）
- API 形状变化可控（集中在 API 适配层）
- 鉴权与路由守卫可复用（避免散落在页面中）

## Routing & role split
建议路由空间（示例）：
- Public
  - `/login`
  - `/register`
- User
  - `/`（首页：推荐聚合）
  - `/search`
  - `/novels/:id`
- Admin
  - `/admin`（管理端首页/仪表盘占位）

角色分流规则：
- 未登录：仅可访问 Public
- 已登录且角色=admin：默认跳转 `/admin`
- 已登录且角色=user：默认跳转 `/`

## Auth model
- 登录成功获得 JWT（以及可选 refresh token，若后端提供）
- Token 存储：优先 localStorage（简单）；若后端要求 cookie，则在实现阶段切换，不改变页面逻辑
- 请求注入：统一在 API 客户端中追加 `Authorization: Bearer <token>`
- 登出：清理 token 与用户态，并跳转到 `/login`

## API adapter & mock strategy
为支持“先做前端、后补 API”，建议定义最小 API 接口集（TypeScript types + 函数签名），并提供两套实现：
- `real`：真实 HTTP 调用（待后端确定后填充）
- `mock`：本地假数据/延时模拟

切换策略（示例）：
- 通过 Vite 环境变量控制：`VITE_API_MODE=mock|real`
- 页面仅依赖 API 接口，不直接依赖 axios/fetch

## UI conventions (Ant Design)
- 表单使用 `Form` + `Form.Item`，校验在前端先做基础必填/格式验证
- 列表采用 `List`/`Card`，详情页用 `Descriptions` 或自定义布局
- 状态：加载态（`Spin`）、空态（`Empty`）、错误提示（`message`/`Alert`）

## Extensibility
后续模块（收藏/评分/评论、个人中心、管理端 CRUD、统计分析）在本结构中可作为新增 capability（OpenSpec）逐步扩展，不要求推翻当前路由与 API 分层。
