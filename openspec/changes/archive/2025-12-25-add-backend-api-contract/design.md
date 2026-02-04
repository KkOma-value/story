# Design: Backend REST API contract

## Goals
- 让前后端可以并行开发：先定“接口形状”，实现可后置。
- 降低对接成本：统一响应包裹、分页与鉴权规则。
- 覆盖业务模块 2.1–2.8：认证、个人中心、搜索/详情、收藏/评分/评论、推荐、管理、统计。

## API style
- REST resources under `/api`.
- JSON requests/responses for standard endpoints.
- Admin endpoints use `/api/admin/...`.

## Auth & security
- JWT Bearer token in `Authorization` header.
- Token TTL: 24h.
- Logout exists to support server-side invalidation (blacklist/rotation policy is implementation detail).

## Unified response envelope
- All JSON endpoints respond with `{ success, message, data }`.
- Errors use HTTP status codes with `success=false` and a human-readable `message`.
- File download (xlsx export) returns binary stream; this is the only exception.

## Identity constraints
- Username is NOT unique; user id is unique.
- Login uses email + password (email should be unique). This avoids ambiguity.

## Interactions
- Favorites: one per user+novel; cancel favorite is soft delete.
- Ratings: 1-5; user can overwrite their score.
- Comments: thread model with `parentId` supports nested replies.
  - Listing strategy: root comments paginated; replies can be embedded or queried via a replies endpoint.

## Recommendations
- API exposes 3 recommendation endpoints.
- Hot recommendation is based on favorites count.
- Personalized recommendation algorithms (CF / content-based / DL) are implementation choice; API remains stable.

## Analytics
- Analytics endpoints are admin-only.
- Provide novel-level and user-level aggregations for a date range.
