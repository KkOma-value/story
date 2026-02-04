# Tasks: align-frontend-backend-api

## 1. Repo inspection (no behavior change)
- [x] 确认后端实际监听地址与端口（默认 8000）及 `/api` 路由挂载点。
- [x] 确认前端当前 `.env*` 的默认值与 `realApi` 路径拼接策略。

## 2. Dev connectivity implementation (Option A - Vite proxy)
- [x] Option A：在 `frontend/vite.config.ts` 增加 `server.proxy`：`/api -> http://127.0.0.1:8000`。
- [x] Option A：将 `frontend/.env` 与 `frontend/.env.development` 的 `VITE_API_BASE_URL` 默认值改为空，`VITE_API_MODE` 改为 `real`。
- [x] Option A：在文档中明确联调配置（默认已是 real 模式）。

## 3. Documentation alignment
- [x] 更新 `backend/README.md`：与实际 Vite proxy 配置保持一致。
- [x] 更新 `frontend/README.md`：给出联调步骤与常见问题（401、端口、VITE_API_MODE）。

## 4. Validation
- [ ] 手动走通主流程：邮箱验证码 -> 注册 -> 登录 -> 首页推荐 -> 搜索 -> 详情。
- [x] 跑前端单测：`npm test`（6 passed）。
