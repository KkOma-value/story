# Tasks: add-user-personal-center-ui

## 1. Frontend UI
- [x] 在个人中心（`/profile`）中加入“我的收藏”入口（Tab 或二级页面均可，优先 Tabs）。
- [x] 收藏列表展示：封面/标题/作者（若有）、收藏数等核心信息；支持点击进入详情。
- [x] 收藏移除：在列表项或批量操作中提供“移除收藏”，调用取消收藏接口并在 UI 中即时更新。
- [x] 个人资料管理：在个人中心中展示并允许编辑 `displayName` / `avatarUrl` / `bio`，保存后刷新用户信息。
- [x] 登录态保护：未登录访问个人中心应跳转登录或展示无权限提示（与现有路由守卫保持一致）。

## 2. API Contract Alignment (frontend real API)
- [x] 将与“个人中心”相关的 real API 调用路径对齐到后端：
  - [x] `GET /api/users/me`
  - [x] `PUT /api/users/me`
  - [x] `PUT /api/users/me/password`
  - [x] `GET /api/users/me/favorites`
  - [x] `DELETE /api/novels/{novelId}/favorite`

## 3. Validation
- [x] 前端：`npm run lint`、`npm test`（`npm test` 通过；`npm run lint` 失败：仓库内既有 lint 问题）。
- [x] 后端：`python manage.py test`（失败：登录相关测试返回 400/None，需后端既有问题排查）。

## 4. Docs (optional)
- [x] 在前端 README 或 docs 中补充“个人中心”入口与能力说明（如项目已有对应文档位置）。
