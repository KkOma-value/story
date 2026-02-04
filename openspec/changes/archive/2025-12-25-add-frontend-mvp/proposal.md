# Change: Add frontend MVP (Auth + Search/Browse + Recommendations)

## Why
当前男频网文平台普遍存在“内容分发与用户需求匹配”问题，且推荐机制对新书冷启动不友好。本项目需要先构建前端 0→1 的最小可用版本（MVP），以承载登录后的个性化推荐、搜索与作品浏览等核心用户路径，并为后续对接后端推荐服务提供稳定的前端交互与页面框架。

## What Changes
- 新增前端能力规范（OpenSpec）覆盖：
  - 用户认证（注册/登录/登出、JWT 鉴权、按角色跳转）
  - 搜索与浏览（搜索、结果列表、作品详情）
  - 推荐入口（个性化/热门/最新推荐列表与跳转）
- 引入“API 适配层”约定：后端 API 未定期间使用 mock 数据；后续仅替换 API 实现，不重写页面逻辑。

## Impact
- Affected specs (new deltas):
  - `auth`
  - `catalog`
  - `recommendations`
- Affected code (planned):
  - React + TypeScript + Vite 工程初始化与页面/路由/鉴权基础设施
  - API 客户端与 mock 适配实现

## Non-Goals
- 本 change 不覆盖：评论/评分/收藏的完整交互闭环、个人中心、小说管理、用户管理、统计分析等（可在后续 change 中逐步扩展）。
- 本 change 不要求与真实后端对接完成（允许以 mock 数据满足页面与交互）。
