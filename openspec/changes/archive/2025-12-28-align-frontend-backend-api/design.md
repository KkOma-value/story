# Design: align-frontend-backend-api

## Context
- 后端：Django + DRF，入口为 `backend/server/urls.py` 挂载 `path('api/', include('core.urls'))`，实际路由在 `backend/core/urls.py`（例如 `auth/login`、`novels/search` 等）。
- 前端：React + Vite。`frontend/src/api/http.ts` 使用 Axios 拦截器注入 `Authorization: Bearer <token>`；`frontend/src/api/index.ts` 通过 `VITE_API_MODE` 在 `mockApi/realApi` 间切换。
- 现状问题：
  - `frontend/vite.config.ts` 当前未配置 `/api` 代理。
  - `frontend/.env` 与 `.env.development` 中 `VITE_API_BASE_URL=http://localhost:8080` 与后端默认端口（8000）不一致。

## Goals
- 在本地开发环境中，让 `VITE_API_MODE=real` 的情况下：登录/推荐/搜索/详情链路可用。
- 让“前端请求路径、baseURL、代理/CORS”三者的组合清晰、稳定、可复制。

## Proposed Approach
本变更提供一个**默认推荐方案**，并保留替代方案（可在实现阶段二选一）。

### Option A (Recommended): Vite Dev Proxy
- 前端请求：保持 `realApi` 继续使用相对路径（例如 `/api/auth/login`）。
- Axios `baseURL`：保持为空（`''`），由浏览器向当前前端 origin 发起请求。
- Vite 代理：在 dev server 下将 `/api` 代理到 `http://127.0.0.1:8000`。

优点：
- 避免 CORS 与 cookie/credential 的复杂度。
- 对部署形态更友好：生产环境也可通过 Nginx/反向代理把 `/api` 转发到后端。

代价：
- 需要在 `vite.config.ts` 中补充 `server.proxy` 配置（当前缺失）。

### Option B: Direct Base URL
- 前端请求：仍使用 `/api/...` 或改为无 `/api` 前缀（实现时需统一）。
- Axios `baseURL`：配置为 `http://127.0.0.1:8000`（并确保拼接后为 `http://127.0.0.1:8000/api/...`）。
- CORS：依赖后端 `CORS_ALLOWED_ORIGINS` 正确配置。

优点：
- 不依赖 Vite proxy。

代价：
- 需要维护 CORS 配置与多环境 baseURL。

## Environment Variables
- `VITE_API_MODE`: `mock | real`
  - 目标：确保当切换为 `real` 时无需改代码即可访问后端。
- `VITE_API_BASE_URL`:
  - Option A：建议默认留空（`''`），避免错误指向。
  - Option B：必须设置为后端 origin（例如 `http://127.0.0.1:8000`）。

## Validation Checklist (E2E-ish, manual)
1. 启动后端：`python manage.py runserver 0.0.0.0:8000`
2. 启动前端：`npm run dev`
3. 切换 `VITE_API_MODE=real` 后验证：
   - 发送邮箱验证码：`POST /api/auth/email-code`
   - 注册：`POST /api/auth/register`
   - 登录：`POST /api/auth/login`（获取 token 并写入前端 store）
   - 首页推荐：`GET /api/recommendations/*`
   - 搜索：`GET /api/novels/search`
   - 详情：`GET /api/novels/{novelId}`

## Risks
- 如果继续保留 `VITE_API_BASE_URL=http://localhost:8080`，会导致联调时请求发往不存在的服务。
- 如果实现选择 Option B（直连），需注意浏览器 mixed-content、CORS 与环境变量管理。

