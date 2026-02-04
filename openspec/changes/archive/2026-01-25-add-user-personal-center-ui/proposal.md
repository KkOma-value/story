# Change: Add user personal center UI (profile + favorites)

## Why
普通用户登录后需要一个统一的“个人中心”入口，用于：
1) 查看与修改个人基本信息；
2) 查看我的收藏并支持移除收藏。

当前仓库里后端已提供 `/api/users/me`、`/api/users/me/favorites`、`/api/novels/{novelId}/favorite` 等能力，前端也存在相关页面与 API 适配层，但“个人中心的能力聚合（含收藏管理）”与 API 路径一致性仍需要补齐与规范化。

## What Changes
- 前端新增/完善个人中心入口页（路由 `.../profile`），提供“个人资料管理”和“我的收藏（含移除）”两个核心分区（可用 Tabs 组织）。
- 复用现有收藏列表能力（`GET /api/users/me/favorites`）并在列表中提供移除操作（`DELETE /api/novels/{novelId}/favorite`）。
- 收敛前端真实 API 调用的用户相关路径，与后端 contract 对齐（以 `openspec/specs/users/spec.md` 为准）。

## Non-Goals / Out of Scope
- 不新增/修改数据库表结构（仅使用现有 favorites 逻辑）。
- 不改变鉴权与 Cookie/JWT 方案。
- 不引入新的推荐/互动逻辑。

## Impact
- Affected specs:
  - `users`（新增 UI 级要求；确认与后端接口对齐）
  - `interactions`（复用“取消收藏”语义，UI 操作映射到现有 endpoint）
- Affected code (implementation stage):
  - 前端：个人中心页面、收藏列表页面/组件、路由与导航、`frontend/src/api/real.ts`
  - 后端：预计无需改动（已有 endpoints）；仅在验证阶段跑测试确认

## Risks / Notes
- 需要确保前端 real API 的路径与后端一致（当前存在 `/api/me` 与 `/api/users/me` 的差异）。
- 收藏列表分页：后端是分页接口；前端可先按“默认第一页”或提供简单分页（后续可增强）。
