# Backend (Django)

## 1) Virtualenv
虚拟环境位于 `backend/venw`（按项目约定）。

PowerShell:

```powershell
cd backend
.\venw\Scripts\Activate.ps1
```

## 2) Install deps

```powershell
pip install -r requirements.txt
```

## 3) Migrate DB

```powershell
python manage.py migrate
```

## 4) Run

```powershell
python manage.py runserver 0.0.0.0:8000
```

Backend base URL:
- http://127.0.0.1:8000/api
## 5) Run Tests

```powershell
python manage.py test
```

## Environment Variables

| 变量名           | 说明                               | 默认值                         |
|------------------|------------------------------------|--------------------------------|
| `DEBUG`          | Django debug 模式                  | `True`                         |
| `SECRET_KEY`     | Django secret key                  | `.env.example` 中的示例值       |
| `DATABASE_URL`   | 数据库连接（可选，默认 SQLite）    | `sqlite:///db.sqlite3`         |
| `ALLOWED_HOSTS`  | 允许的主机名，逗号分隔             | `*`                            |

更多配置见 `.env.example`。

## Frontend Proxy

前端开发服务器（Vite）已在 `frontend/vite.config.ts` 配置代理：

```ts
server: {
  proxy: {
    '/api': 'http://127.0.0.1:8000'
  }
}
```

启动前端 (`npm run dev`) 后，所有 `/api` 请求自动转发到后端。

说明：当前前端默认使用 `VITE_API_MODE=real`，并通过该代理实现前后端联调。
## Notes
- 开发期邮箱验证码为“假发送”：会在后端控制台输出验证码。
- 登出为纯无状态：`POST /api/auth/logout` 仅返回 `{ success: true }`。
