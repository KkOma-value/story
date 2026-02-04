# 📚 玄幻阁 - 小说推荐系统

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-green.svg)
![Django](https://img.shields.io/badge/Django-5.2+-brightgreen.svg)
![React](https://img.shields.io/badge/React-19.2-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

**一个现代化的全栈小说推荐系统，融合智能推荐算法与沉浸式阅读体验**

[在线演示](#) · [功能介绍](#-核心功能) · [快速开始](#-快速开始) · [技术栈](#-技术栈) · [API 文档](#-api-文档)

</div>

---

## ✨ 核心功能

### 🎯 智能推荐系统
- **基于内容的推荐** - 使用 TF-IDF + 余弦相似度分析小说标签、分类和描述
- **协同过滤推荐** - 基于用户行为矩阵，发现相似用户的阅读偏好
- **离线预计算** - 定时任务批量计算推荐结果，24小时缓存机制

### 📖 沉浸式阅读体验
- **章节阅读器** - 支持翻页、进度保存、阅读设置
- **阅读历史追踪** - 记录阅读进度，支持断点续读
- **书架管理** - 收藏喜爱的小说，一键管理

### 💬 用户互动系统
- **嵌套评论** - 支持楼中楼回复，无限层级嵌套
- **评分系统** - 1-5 星评分，实时更新小说评分
- **收藏功能** - 一键收藏/取消，软删除机制

### 🎨 现代化前端
- **3D 视觉效果** - Three.js + React Three Fiber 打造沉浸式首页
- **响应式设计** - 适配桌面端与移动端
- **流畅动画** - Framer Motion 驱动的交互动效

### 🔐 完善的用户系统
- **JWT 认证** - 安全的 Token 认证机制
- **邮箱登录** - 支持邮箱注册、验证码验证
- **角色权限** - 普通用户与管理员权限分离

### 📊 后台管理
- **小说管理** - CRUD 操作、发布/下架控制
- **用户管理** - 查看用户、封禁/解封
- **数据分析** - 登录、搜索、浏览事件追踪

---

## 🚀 快速开始

### 环境要求

- **Python** 3.10+
- **Node.js** 18+
- **数据库** SQLite（默认）或 MySQL 8.0+

### 后端启动

```bash
# 1. 进入后端目录
cd backend

# 2. 创建并激活虚拟环境
python -m venv venw
.\venw\Scripts\Activate.ps1    # Windows PowerShell
# source venw/bin/activate     # Linux/Mac

# 3. 安装依赖
pip install -r requirements.txt

# 4. 数据库迁移
python manage.py migrate

# 5. 导入小说数据（可选）
python manage.py import_novels_csv ../sql/novels_mysql.csv

# 6. 计算推荐（可选）
python manage.py compute_recommendations

# 7. 启动服务器
python manage.py runserver 0.0.0.0:8000
```

### 前端启动

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 **http://localhost:5173** 开始使用！

---

## 🛠 技术栈

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Django | 5.2+ | Web 框架 |
| Django REST Framework | 3.15+ | RESTful API |
| SimpleJWT | 5.3+ | JWT 认证 |
| scikit-learn | 1.4+ | 推荐算法 |
| Jieba | 0.42+ | 中文分词 |
| Pandas | 2.1+ | 数据处理 |

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2 | UI 框架 |
| TypeScript | 5.9 | 类型系统 |
| Vite | 7.2 | 构建工具 |
| Ant Design | 6.1 | UI 组件库 |
| Three.js | 0.182 | 3D 图形 |
| Tailwind CSS | 3.4 | 样式框架 |

---

## 📁 项目结构

```
story/
├── backend/                 # Django 后端
│   ├── server/              # Django 主配置
│   ├── core/                # 核心功能（异常处理、分页、权限）
│   ├── users/               # 用户模块
│   ├── novels/              # 小说模块
│   ├── interactions/        # 用户互动（收藏、评分、评论）
│   ├── recommendations/     # 推荐系统
│   ├── analytics/           # 数据分析
│   └── admin_api/           # 后台管理 API
│
├── frontend/                # React 前端
│   ├── src/
│   │   ├── api/             # API 客户端
│   │   ├── components/      # 组件（含 3D 效果）
│   │   ├── pages/           # 页面
│   │   ├── store/           # 状态管理
│   │   └── router/          # 路由配置
│   └── ...
│
└── docs/                    # 项目文档
```

---

## 📡 API 文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |

### 小说接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/novels/` | 搜索小说 |
| GET | `/api/novels/{id}/` | 获取小说详情 |
| GET | `/api/novels/{id}/chapters/` | 获取章节列表 |
| GET | `/api/novels/{novelId}/chapters/{chapterId}/` | 获取章节内容 |

### 互动接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/interactions/favorites/` | 收藏/取消收藏 |
| POST | `/api/interactions/ratings/` | 提交评分 |
| GET/POST | `/api/interactions/comments/` | 获取/发表评论 |
| GET/POST | `/api/interactions/history/` | 阅读历史 |

### 推荐接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/recommendations/` | 获取个性化推荐 |

---

## ⚙️ 环境配置

### 后端配置 (`backend/.env`)

```bash
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# 数据库（默认 SQLite，可切换 MySQL）
DB_ENGINE=sqlite
# DB_ENGINE=mysql
# DB_NAME=story
# DB_USER=root
# DB_PASSWORD=
# DB_HOST=127.0.0.1
# DB_PORT=3306
```

### 前端配置 (`frontend/.env.development`)

```bash
VITE_API_MODE=real
VITE_API_BASE_URL=
```

---

## 🔧 常用命令

### 后端

```bash
# 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 导入小说数据
python manage.py import_novels_csv ../sql/novels_mysql.csv

# 计算推荐
python manage.py compute_recommendations --algorithm=cf    # 协同过滤
python manage.py compute_recommendations --algorithm=content  # 内容推荐

# 运行测试
python manage.py test
```

### 前端

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 运行测试
npm run test
```

---

## 📝 开发说明

1. **认证方式**：JWT Token，有效期 24 小时
2. **用户模型**：使用邮箱作为登录凭证，用户名可重复
3. **软删除机制**：用户、小说、收藏记录使用逻辑删除
4. **API 风格**：RESTful，统一响应格式 `{success, message, data}`
5. **时区设置**：后端使用 `Asia/Shanghai` 时区

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by Story Team

</div>
