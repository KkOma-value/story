# Change: align-frontend-backend-api

## Why
当前前端已具备 `mock/real` API 适配层与 JWT 注入，但默认环境变量指向 `http://localhost:8080` 且 Vite 未配置 `/api` 代理；与此同时后端实际运行地址为 `http://127.0.0.1:8000`（并在 `backend/server/urls.py` 下挂载 `/api/`）。这导致“切到 real 模式后无法正常访问后端接口”，也会让 README 中“已配置代理”的描述与事实不一致。

本变更的目标是在**不改变接口契约（OpenAPI / 统一响应包裹）**的前提下，让前端在开发环境下能稳定调用后端，实现登录/推荐/搜索/详情等主链路可用。

## What Changes
- 统一本地开发的 API 连接方式：`/api/*` 走 Vite dev proxy（推荐）或明确的后端 baseURL（二选一，见设计）。
- 修正前端环境变量默认值，使得 `VITE_API_MODE=real` 时默认不会指向错误端口。
- 补齐/对齐项目文档：前后端 README 对“如何本地联调”给出一致说明。
- 增加最小化验证清单：覆盖主流程（发验证码→注册→登录→首页推荐→搜索→详情）。

## Non-Goals
- 不引入 OpenAPI 代码生成（例如自动生成 TS client/types）。
- 不新增页面/交互功能（仅做联调可用性与配置对齐）。
- 不改变任何后端业务逻辑与接口路径（以现有 `backend/core/urls.py` 为准）。

## Impact
- Affected specs: `api`, `auth`（仅涉及“客户端如何访问接口/附带鉴权”的联调要求，不改后端契约）
- Affected frontend:
  - `frontend/vite.config.ts`（补充 dev proxy）
  - `frontend/.env*`（默认 `VITE_API_MODE` 与 `VITE_API_BASE_URL` 值）
  - `frontend/src/api/http.ts`、`frontend/src/api/real.ts`（原则上不改路径；仅在必要时调整 baseURL 拼接策略）
- Affected docs:
  - `backend/README.md`、`frontend/README.md`

## Open Questions (need discussion)
1. 本地开发你希望默认用哪种模式？
   - A) `mock`（保持现在默认；需要联调时切 `VITE_API_MODE=real`）
   - B) `real`（默认直接连后端；后端没启动时页面会报错）
2. 你更倾向哪种联调方式？
   - A) **Vite proxy**：前端始终请求相对路径 `/api/...`，由 Vite 转发到 `http://127.0.0.1:8000`（推荐，避免 CORS）
   - B) **直连 baseURL**：`VITE_API_BASE_URL=http://127.0.0.1:8000`，前端直接跨域访问（需要 CORS 配置正确）

