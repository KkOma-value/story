# Change: Add backend API implementation

## Why
前端目前已具备可替换的 API 适配层（mock/real），并已有 OpenAPI 契约（api-design/openapi.yaml）。需要落地一个后端服务来实现契约，以支持登录鉴权、小说检索/详情、互动行为、推荐、以及管理端与统计接口。

## What Changes
- 新增后端服务（单体 REST API，Base Path `/api`），实现 OpenAPI 中定义的所有 endpoints
- 统一响应包裹 `{ success, message, data }`（文件下载接口除外）
- 落地鉴权与权限：JWT Bearer、管理员 RBAC（`role=admin`）
- 落地数据存储：MySQL 作为主存储；Redis 用于缓存/验证码/会话黑名单（按选型）
- 提供本地开发运行方式（环境变量、数据库初始化、种子数据）与基础自动化测试

## Scope
### In scope (MVP backend)
- Auth: 邮箱验证码、注册、登录、登出
- Users: 获取/更新个人信息、改密、我的收藏分页
- Novels/Catalog: 搜索、详情（可计数 views），鉴权情况下返回 `myFavorite`/`myRating`
- Interactions: 收藏/取消收藏、评分、评论/回复、删除自己的评论（软删除）
- Recommendations: 个性化（需要登录）、热门/最新（公开）
- Admin: 小说 CRUD/下架/逻辑删除/导出；用户列表/详情/编辑/封禁/解封/逻辑删除
- Analytics: 管理员可查询小说统计与用户行为统计

### Out of scope (not in this change)
- 复杂推荐算法（本变更仅定义接口与最小可用实现策略，算法可后续演进）
- 高级检索（全文检索引擎）、异步任务队列、分布式部署

## Design Notes (high-level)
- 建议默认选型：Django + Django REST Framework（快速、组件完善）
- 若你更偏好轻量：可替换为 Flask，但会引入更多自建中间件（认证、校验、错误处理等）

## Decisions / Clarifications Needed
1. 框架选择：你希望用 Django(含 DRF) 还是 Flask？本提案默认 Django + DRF。
2. 邮箱验证码：开发期是否允许“假发送”（写日志/控制台）？还是必须接入真实 SMTP/第三方邮件服务？
3. 登出策略：JWT 是否需要服务端失效（Redis 黑名单/会话表），还是纯无状态（登出只由前端清 token）？

## Impact
- Affected specs (delta): api, auth, users, catalog, interactions, recommendations, admin, analytics
- Affected code (future apply stage): new backend service folder (e.g. `backend/`), plus dev docs/scripts
