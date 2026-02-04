# 小说推荐系统 REST API 文档（契约）

> 目标：供前后端并行开发使用；本文档只定义接口契约，不包含实现细节。

## 0. 总览

- 风格：REST + JSON
- Base Path：`/api`
- 鉴权：JWT Bearer Token（除标注为 Public 的接口外均需登录）
  - Header：`Authorization: Bearer <token>`
- Token：有效期 24 小时；每次登录都会签发新 token；提供登出接口。
- 响应：统一响应包裹（除“文件下载”接口为二进制返回，见 8.3）

## 1. 统一约定

### 1.1 统一响应包裹

成功（HTTP 2xx）：

```json
{
  "success": true,
  "message": "OK",
  "data": { }
}
```

失败（HTTP 4xx/5xx）：

```json
{
  "success": false,
  "message": "具体错误message",
  "data": null
}
```

> 说明：错误以 HTTP 状态码为准；`message` 直接可展示给用户（前端可按需再做本地化/映射）。

### 1.2 分页

请求：`page`（从 1 开始）、`pageSize`

响应：

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 10
}
```

### 1.3 软删除/逻辑删除

- 收藏记录：取消收藏后在 DB 逻辑删除。
- 用户/小说删除：管理端删除为逻辑删除（保留数据）。

### 1.4 重要假设（请确认）

- 由于“用户名不唯一”，**登录默认使用 email + password**。
- **约束：一个 email 只能注册一个账号（email 全局唯一）**。
- 若你希望也支持 username 登录，需要额外定义消歧策略（如：登录时额外带 userId，或引入“登录名”字段并保证唯一）。

## 2. 数据模型（核心字段）

### 2.1 User

- `id`: string（唯一）
- `username`: string（可重复）
- `displayName`: string（用户自定义名称）
- `email`: string（全局唯一，用于登录/验证码；一个 email 只能注册一个账号）
- `avatarUrl?`: string
- `bio?`: string
- `role`: `user | admin`
- `status`: `active | banned | permanent_banned | deleted`

### 2.2 Novel

- `id`: string
- `title`: string
- `author`: string
- `category`: string
- `tags`: string[]
- `intro`: string
- `coverUrl?`: string
- `updatedAt`: ISO string
- `views`: number
- `favorites`: number

## 3. 2.1 用户认证模块（Auth）

### 3.1 发送邮箱验证码（Public）

- `POST /api/auth/email-code`

请求：

```json
{ "email": "a@b.com", "purpose": "register" }
```

响应：`ApiResponse<{ sent: boolean }>`

### 3.2 用户注册（Public）

- `POST /api/auth/register`

请求：

```json
{
  "username": "张三",
  "displayName": "张三的昵称",
  "email": "a@b.com",
  "code": "123456",
  "password": "******",
  "confirmPassword": "******"
}
```

响应：`ApiResponse<{ userId: string }>`

### 3.3 用户登录（Public）

- `POST /api/auth/login`

请求：

```json
{ "email": "a@b.com", "password": "******" }
```

响应：`ApiResponse<{ token: string, user: User }>`

### 3.4 用户登出（Auth）

- `POST /api/auth/logout`

响应：`ApiResponse<{ success: true }>`

## 4. 2.2 个人中心模块

### 4.1 获取当前用户信息（Auth）

- `GET /api/users/me`

响应：`ApiResponse<User>`

### 4.2 修改个人基本信息（Auth）

- `PUT /api/users/me`

请求（可部分更新，未提供字段保持不变）：

```json
{
  "username": "可重复用户名",
  "displayName": "昵称",
  "avatarUrl": "https://...",
  "bio": "简介"
}
```

响应：`ApiResponse<User>`

### 4.3 修改密码（Auth）

- `PUT /api/users/me/password`

请求：

```json
{ "oldPassword": "******", "newPassword": "******", "confirmPassword": "******" }
```

响应：`ApiResponse<{ success: true }>`

### 4.4 我的收藏列表（Auth）

- `GET /api/users/me/favorites?page=1&pageSize=10`

响应：`ApiResponse<PaginatedList<Novel>>`

### 4.5 取消收藏（Auth）

- `DELETE /api/novels/{novelId}/favorite`

响应：`ApiResponse<{ success: true }>`

## 5. 2.3 搜索与浏览模块

### 5.1 搜索小说（Public）

- `GET /api/novels/search`

Query（支持按标题/作者/关键词/分类/标签搜索；默认按热度排序）：

- `q`：通用关键词（可匹配 title/author/tags/intro）
- `title?`、`author?`、`category?`、`tag?`：结构化搜索（可选）
- `sort`：仅支持 `hot`（默认 hot）
- `page`、`pageSize`

响应：`ApiResponse<PaginatedList<Novel>>`

### 5.2 查看小说详情（Public）

- `GET /api/novels/{novelId}`

响应：`ApiResponse<Novel & { myFavorite?: boolean, myRating?: number }>`

> 说明：服务端可在此接口中统计浏览量。

## 6. 2.4 用户互动模块

### 6.1 收藏小说（Auth）

- `POST /api/novels/{novelId}/favorite`

约束：同一用户对同一本书最多 1 条收藏记录。

响应：`ApiResponse<{ success: true }>`

### 6.2 评分（Auth）

- `PUT /api/novels/{novelId}/rating`

请求：

```json
{ "score": 5 }
```

约束：评分范围 1–5；允许覆盖更新自己评分。

响应：`ApiResponse<{ success: true }>`

### 6.3 评论与楼中楼（Auth/Public）

- 新增评论/回复（Auth）：`POST /api/novels/{novelId}/comments`

请求：

```json
{ "content": "很好看", "parentId": null }
```

- `parentId=null` 表示根评论；不为 null 表示回复某条评论（楼中楼）。

响应：`ApiResponse<{ commentId: string }>`

- 获取评论列表（Public）：`GET /api/novels/{novelId}/comments?page=1&pageSize=10`
  - 返回根评论分页；每条根评论可带一段 `replies`（可选，服务端实现策略可变）。

响应：`ApiResponse<PaginatedList<CommentThread>>`

- 获取某条评论的回复（Public）：`GET /api/comments/{commentId}/replies?page=1&pageSize=10`

响应：`ApiResponse<PaginatedList<Comment>>`

- 删除自己的评论（Auth）：`DELETE /api/comments/{commentId}`

响应：`ApiResponse<{ success: true }>`

## 7. 2.5 个性化推荐模块

### 7.1 个性化推荐（Auth）

- `GET /api/recommendations/personalized?limit=6`

响应：`ApiResponse<Novel[]>`

> 算法实现可采用协同过滤/内容推荐/深度学习等（后端实现阶段细化）。

### 7.2 热门推荐（Public）

- `GET /api/recommendations/hot?limit=6`

规则：按收藏数最高推荐。

响应：`ApiResponse<Novel[]>`

### 7.3 最新推荐（Public）

- `GET /api/recommendations/latest?limit=6`

响应：`ApiResponse<Novel[]>`

## 8. 2.6 小说管理模块（Admin）

> 需要管理员角色（`role=admin`）。

### 8.1 新增小说

- `POST /api/admin/novels`

请求：

```json
{
  "title": "...",
  "author": "...",
  "category": "...",
  "tags": ["..."],
  "intro": "...",
  "coverUrl": "..."
}
```

响应：`ApiResponse<{ novelId: string }>`

### 8.2 编辑小说

- `PUT /api/admin/novels/{novelId}`

请求：同 8.1（可部分更新）

响应：`ApiResponse<{ success: true }>`

### 8.3 下架小说

- `PATCH /api/admin/novels/{novelId}/status`

请求：

```json
{ "status": "shelved" }
```

响应：`ApiResponse<{ success: true }>`

### 8.4 删除小说（逻辑删除）

- `DELETE /api/admin/novels/{novelId}`

响应：`ApiResponse<{ success: true }>`

### 8.5 管理端小说列表/筛选

- `GET /api/admin/novels?page=1&pageSize=10&keyword=...&status=...&category=...&author=...`

响应：`ApiResponse<PaginatedList<Novel>>`

### 8.6 数据导出（xlsx）

- `GET /api/admin/novels/export?...同 8.5 的筛选条件...`

响应：返回 `.xlsx` 二进制文件流（**该接口不使用统一 JSON 包裹**）：
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="novels.xlsx"`

## 9. 2.7 用户管理模块（Admin）

### 9.1 用户列表/查询

- `GET /api/admin/users?page=1&pageSize=10&keyword=...&status=...`

响应：`ApiResponse<PaginatedList<User>>`

### 9.2 查看用户信息

- `GET /api/admin/users/{userId}`

响应：`ApiResponse<User>`

### 9.3 编辑用户信息

- `PUT /api/admin/users/{userId}`

请求：

```json
{
  "username": "...",
  "displayName": "...",
  "avatarUrl": "...",
  "bio": "...",
  "role": "user"
}
```

响应：`ApiResponse<{ success: true }>`

### 9.4 违规账号处理：封禁/永久封禁

- `POST /api/admin/users/{userId}/ban`

请求：

```json
{ "type": "banned" , "reason": "...", "until": null }
```

- `type=banned`：禁用登录（可选 until，null 表示直到管理员解封）
- `type=permanent_banned`：永久封禁

响应：`ApiResponse<{ success: true }>`

- 解封：`POST /api/admin/users/{userId}/unban`

响应：`ApiResponse<{ success: true }>`

### 9.5 删除用户（逻辑删除）

- `DELETE /api/admin/users/{userId}`

响应：`ApiResponse<{ success: true }>`

## 10. 2.8 数据统计分析模块（Admin）

### 10.1 小说数据分析

- `GET /api/admin/analytics/novels?from=2025-01-01&to=2025-12-31&page=1&pageSize=10&sort=hot`

响应：`ApiResponse<PaginatedList<NovelAnalyticsRow>>`

示例：

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "items": [
      {
        "novelId": "1",
        "title": "...",
        "views": 123,
        "favorites": 45,
        "ratingCount": 67,
        "avgRating": 4.5
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### 10.2 用户行为分析

- `GET /api/admin/analytics/users?from=2025-01-01&to=2025-12-31&page=1&pageSize=10`

响应：`ApiResponse<PaginatedList<UserAnalyticsRow>>`

## 附：类型补充（文档内引用）

### Comment

```ts
type Comment = {
  id: string;
  novelId: string;
  userId: string;
  userDisplayName: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  deleted: boolean;
}
```

### CommentThread

```ts
type CommentThread = Comment & {
  replies?: Comment[];
}
```

### NovelAnalyticsRow

```ts
type NovelAnalyticsRow = {
  novelId: string;
  title: string;
  views: number;
  favorites: number;
  ratingCount: number;
  avgRating: number;
}
```

### UserAnalyticsRow

```ts
type UserAnalyticsRow = {
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
```
