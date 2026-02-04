# 小说推荐系统 - Frontend

React + TypeScript + Vite 构建的前端应用。

## 本地开发（联调后端）

### 1) 启动后端

在另一个终端执行（见 `backend/README.md` 更详细步骤）：

```powershell
cd backend
.\venw\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

后端 API base path：`/api`（例如 `http://127.0.0.1:8000/api/auth/login`）。

### 2) 启动前端

```bash
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`。

### 3) API 模式与代理

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `VITE_API_MODE` | `mock` 使用本地假数据，`real` 连接后端 | `real` |
| `VITE_API_BASE_URL` | 后端地址（使用代理时留空） | 空 |

- 开发期通过 Vite dev server 代理转发：前端请求 `/api/*` 会被代理到 `http://127.0.0.1:8000`（见 `vite.config.ts`）。
- 如果后端未启动，页面会报错；可临时切换 `VITE_API_MODE=mock` 使用假数据。

### 4) 常见问题

- **401 自动跳回登录页**：Axios 拦截器在收到 401 时会清理登录态并跳转（`src/api/http.ts`）。
- **后端没启动导致请求失败**：确保后端在 8000 端口运行，或把 `VITE_API_MODE` 改成 `mock`。

### 5) 个人中心入口

- 路由：`/profile`
- 能力：个人资料管理（展示/更新 displayName、avatarUrl、bio）、我的收藏列表（支持移除收藏）

## 生产部署

生产环境需要配置反向代理（如 Nginx）将 `/api/*` 转发到后端服务，或在 `.env.production` 中设置 `VITE_API_BASE_URL` 为后端完整地址。

## 脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # ESLint 检查
npm test         # 运行单元测试
```
