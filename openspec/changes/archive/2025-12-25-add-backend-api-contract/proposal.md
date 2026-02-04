# Change: Add backend REST API contract (Auth + Catalog + Interactions + Admin + Analytics)

## Why
当前项目允许前端先行（mock 数据），但后端与接口规范尚未落地。为了让前后端可以并行开发并降低对接成本，需要一份明确、可执行的 REST API 契约，覆盖认证、搜索/详情、收藏/评分/评论、推荐、管理与统计分析。

## What Changes
- 新增后端 REST API 契约文档（Markdown + OpenAPI 3.0）
- 定义统一响应包裹（`success/message/data`）以及错误处理规则（HTTP 状态码 + message）
- 明确鉴权（JWT Bearer）与权限边界（Public/Auth/Admin）
- 覆盖业务模块：
  - 2.1 用户认证（注册/登录/登出/邮箱验证码）
  - 2.2 个人中心（信息管理、我的收藏）
  - 2.3 搜索与浏览（搜索、详情）
  - 2.4 用户互动（收藏、评分、评论楼中楼）
  - 2.5 推荐（个性化、热门、最新）
  - 2.6 小说管理（新增/编辑/下架/删除/导出 xlsx）
  - 2.7 用户管理（查看/编辑/封禁/永久封禁/删除）
  - 2.8 统计分析（小说数据、用户行为）

## Impact
- Affected specs (new deltas): `auth`, `users`, `catalog`, `interactions`, `recommendations`, `admin`, `analytics`
- Affected code (later, not in this proposal stage):
  - 前端 `frontend/src/api/real.ts` 需要按统一响应包裹做解包与错误处理
  - 后端实现需按 OpenAPI/文档落地路由、鉴权与数据模型

## Assumptions
- 因“用户名不唯一”，登录默认使用 `email + password`（email 全局唯一：一个 email 只能注册一个账号）。
- 导出 xlsx 为二进制返回（不使用统一 JSON 包裹），其余接口使用统一包裹。

## Non-Goals
- 不在本 change 中实现后端服务或数据库；只提供契约与验收任务清单。
