# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个小说推荐系统的全栈应用项目，包含前端（React 19 + TypeScript + Vite）和后端（Django 5.2 + Django REST Framework）。采用前后端分离架构，使用 JWT 认证，支持用户注册登录、小说浏览搜索、章节阅读、个性化推荐、用户互动（收藏、评分、嵌套评论）、阅读历史追踪、数据分析以及后台管理功能。

**核心特性：**
- 智能推荐系统（基于内容和协同过滤算法）
- 阅读进度追踪和历史记录
- 嵌套评论系统（支持楼中楼回复）
- 用户行为分析（登录、搜索、浏览事件追踪）
- 3D 视觉效果（Three.js + React Three Fiber）
- 离线推荐计算与缓存系统
- 密码重置功能

## Commands

### Backend (Django API)

Windows 虚拟环境路径：d:\JavaCode\story\backend\venw

```bash
# 1. 激活虚拟环境
cd backend
.\venw\Scripts\Activate.ps1  # PowerShell
# source venw/bin/activate   # Linux/Mac

# 2. 安装依赖
pip install -r requirements.txt

# 3. 数据库迁移
python manage.py migrate

# 4. 运行开发服务器（默认 0.0.0.0:8000）
python manage.py runserver 0.0.0.0:8000

# 5. 运行测试
python manage.py test

# 6. 创建数据库迁移文件
python manage.py makemigrations

# 7. 导入小说数据（CSV）
python manage.py import_novels_csv ../sql/novels_mysql.csv

# 8. 计算推荐（离线任务）
python manage.py compute_recommendations
```

### Frontend (React)

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认 localhost:5173）
npm run dev

# 4. 构建生产版本
npm run build

# 5. 运行代码检查
npm run lint

# 6. 运行测试
npm run test
npm run test:watch  # 监听模式

# 7. 预览生产构建
npm run preview
```

### Database Management

```bash
# SQLite - 导出数据库结构
cd backend
sqlite3 db.sqlite3 .dump > ../sql/schema.sql

# SQLite - 导入数据（需先创建表结构）
sqlite3 db.sqlite3 < ../sql/novels_data.sql

# MySQL - 创建数据库
mysql -u root -p -e "CREATE DATABASE story CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# MySQL - 导入数据
mysql -u root -p story < ../sql/novels_mysql.sql
```

## Architecture

### Backend Structure

```
backend/
├── server/               # Django 主项目配置
│   ├── settings.py      # Django 设置（支持 SQLite/MySQL 切换）
│   ├── urls.py          # 主 URL 配置
│   └── wsgi.py
├── core/                 # 核心功能
│   ├── exception_handler.py  # 统一异常处理
│   ├── pagination.py         # 分页配置
│   ├── permissions.py        # 权限控制（isStaffUser 等）
│   ├── responses.py          # 统一响应格式
│   └── urls.py               # 核心 API 路由 (/api/*)
├── users/                # 用户模块
│   ├── models.py        # 自定义 User 模型（邮箱登录，角色管理）
│   ├── api_auth.py      # 认证 API（注册、登录、登出、验证码、密码重置）
│   └── api_me.py        # 个人信息 API
├── novels/               # 小说模块
│   ├── models.py        # Novel、Chapter 模型
│   ├── api.py           # 小说 API（搜索、详情、章节列表）
│   └── management/      # 数据导入命令（CSV 导入）
├── interactions/         # 用户互动模块
│   ├── models.py        # Favorite、Rating、Comment（嵌套）、ReadHistory
│   └── api.py           # 互动 API（收藏、评分、评论、阅读进度）
├── recommendations/      # 推荐模块
│   ├── models.py        # RecommendationCache、NovelSimilarity、FeatureVector
│   ├── api.py           # 推荐 API（个性化推荐、热门、最新、相似）
│   ├── management/      # 推荐计算命令
│   └── algorithms/      # 推荐算法目录
│       ├── collaborative_filtering.py  # 协同过滤算法
│       └── content_based.py            # 基于内容的推荐算法
├── admin_api/            # 后台管理 API
│   ├── api.py           # 管理员 API（小说、用户、导出）
│   └── views.py         # 管理视图
├── analytics/            # 数据分析模块
│   ├── models.py        # LoginEvent、SearchEvent、ViewEvent
│   └── api.py           # 分析事件追踪 API
└── venw/                 # Python 虚拟环境
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/             # API 客户端（mock 和 real 模式）
│   ├── components/      # React 组件
│   │   ├── ui/         # UI 组件库（背景效果、卡片、输入框等）
│   │   ├── Hero3D.tsx  # 3D 视觉效果组件（Three.js）
│   │   ├── Hero.tsx    # 首页 Hero 组件
│   │   ├── SolarSystem.tsx  # 太阳系 3D 组件
│   │   ├── FloatingNavbar.tsx  # 浮动导航栏
│   │   ├── PageBackground.tsx  # 页面背景
│   │   ├── NovelCard.tsx       # 小说卡片
│   │   ├── FavoritesGrid.tsx   # 收藏网格
│   │   ├── CommentSection.tsx  # 评论区域
│   │   ├── ProfileHeader.tsx   # 个人资料头部
│   │   ├── ProfileEditCard.tsx # 个人资料编辑卡片
│   │   ├── PasswordChangeCard.tsx  # 密码修改卡片
│   │   ├── AdminBackground.tsx  # 管理后台背景
│   │   └── RequireAuth.tsx      # 认证守卫
│   ├── pages/          # 页面组件
│   │   ├── HomePage.tsx         # 首页
│   │   ├── SearchPage.tsx       # 搜索页
│   │   ├── NovelDetailPage.tsx  # 小说详情页
│   │   ├── ReaderPage.tsx       # 阅读器页（章节阅读，沉浸式）
│   │   ├── LoginPage.tsx        # 登录页
│   │   ├── RegisterPage.tsx     # 注册页
│   │   ├── ResetPasswordPage.tsx # 重置密码页
│   │   ├── CategoryPage.tsx     # 分类页
│   │   ├── RankingPage.tsx      # 排行榜页
│   │   ├── BookshelfPage.tsx    # 书架（收藏）
│   │   ├── HistoryPage.tsx      # 阅读历史
│   │   ├── ProfilePage.tsx      # 个人资料
│   │   └── admin/               # 管理后台页面
│   │       ├── AdminDashboard.tsx  # 仪表盘
│   │       ├── AdminNovels.tsx    # 小说管理
│   │       ├── AdminUsers.tsx     # 用户管理
│   │       └── AdminAnalytics.tsx # 数据分析
│   ├── store/          # 状态管理（auth store）
│   ├── layouts/        # 布局组件
│   │   ├── UserLayout.tsx   # 用户布局
│   │   └── AdminLayout.tsx  # 管理员布局
│   ├── router/         # 路由配置（路由守卫）
│   │   └── index.tsx
│   ├── styles/         # 样式文件（Tailwind CSS）
│   ├── types/          # TypeScript 类型定义
│   ├── hooks/          # 自定义 Hooks
│   └── utils/          # 工具函数
├── public/             # 静态资源
├── dist/               # 构建输出
├── vite.config.ts      # Vite 配置（代理设置）
├── tailwind.config.js  # Tailwind CSS 配置
└── tsconfig.json       # TypeScript 配置
```

### Key Design Decisions

1. **认证方式**：JWT Token (Bearer)，有效期24小时，通过 `Authorization` Header 传递
2. **用户模型**：自定义 User 模型，使用 email 作为登录凭证（唯一），用户名可重复
3. **角色系统**：用户角色分为 `user`（普通用户）和 `admin`（管理员），状态分为 `active`、`banned`、`deleted`
4. **API 风格**：RESTful + JSON，统一响应格式 `{success, message, data}`
5. **软删除**：用户、小说、收藏记录均使用逻辑删除（isDeleted 字段）
6. **分页**：所有列表接口支持 `page` 和 `pageSize` 参数
7. **CORS**：开发环境允许 `localhost:5173`，生产环境需要配置反向代理
8. **数据库**：默认 SQLite，可通过 `DB_ENGINE=mysql` 环境变量切换至 MySQL
9. **主键类型**：所有模型使用 UUID 作为主键（安全性更好）
10. **时区**：后端使用 `Asia/Shanghai` 时区
11. **路由模式**：使用 React Router v7 的 `RouterProvider`，支持嵌套布局和权限守卫

### API Proxy

前端开发服务器配置代理，所有 `/api` 请求自动转发到后端 `http://127.0.0.1:8000`（配置在 `frontend/vite.config.ts`）。生产环境需要 Nginx 反向代理或配置 `VITE_API_BASE_URL`。

## Environment Variables

### Backend (.env)

```bash
# Django 基础配置
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# JWT 认证
JWT_ACCESS_HOURS=24

# CORS 允许的源
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# 数据库配置（可选）
DB_ENGINE=sqlite              # sqlite 或 mysql
# MySQL 配置（当 DB_ENGINE=mysql 时生效）
DB_NAME=story
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=3306
```

### Frontend (.env.development)

```bash
# API 模式：mock 使用本地假数据，real 连接后端
VITE_API_MODE=real

# 后端地址（使用代理时留空，直接连接时填完整 URL）
VITE_API_BASE_URL=
```

### Frontend (.env.production)

```bash
VITE_API_MODE=real
VITE_API_BASE_URL=https://your-api-domain.com
```

## Data Models

### User (users/models.py)
- `id` - UUID 主键
- `email` - 邮箱（唯一，登录凭证）
- `username` - 用户名（可重复）
- `password` - 加密密码
- `role` - 角色（user/admin）
- `status` - 状态（active/banned/deleted）
- `avatar` - 头像 URL
- `created_at`, `updated_at`

### Novel (novels/models.py)
- `id` - UUID 主键
- `title` - 标题
- `author` - 作者
- `intro` - 简介
- `cover_url` - 封面图 URL
- `source_url` - 来源 URL
- `category` - 分类
- `tags` - 标签（JSON 数组）
- `status` - 状态（published/shelved/deleted）
- `views` - 浏览次数
- `favorites_count` - 收藏次数
- `avg_rating` - 平均评分
- `rating_count` - 评分人数
- `created_at`, `updated_at`

### Chapter (novels/models.py)
- `id` - UUID 主键
- `novel` - 关联小说
- `title` - 章节标题
- `content` - 章节内容（文本）
- `word_count` - 字数
- `order` - 章节序号
- `created_at`, `updated_at`

### Favorite (interactions/models.py)
- `id` - UUID 主键
- `user` - 关联用户
- `novel` - 关联小说
- `isDeleted` - 软删除标记
- `created_at`

### Rating (interactions/models.py)
- `id` - UUID 主键
- `user` - 关联用户
- `novel` - 关联小说
- `score` - 评分（1-5）
- `created_at`, `updated_at`

### Comment (interactions/models.py)
- `id` - UUID 主键
- `user` - 关联用户
- `novel` - 关联小说
- `content` - 评论内容
- `parent` - 父评论（支持嵌套回复）
- `isDeleted` - 软删除标记
- `created_at`, `updated_at`

### ReadHistory (interactions/models.py)
- `id` - UUID 主键
- `user` - 关联用户
- `novel` - 关联小说
- `chapter` - 当前阅读章节
- `progress` - 阅读进度（百分比）
- `last_read_at` - 最后阅读时间

### RecommendationCache (recommendations/models.py)
- `id` - UUID 主键
- `user` - 关联用户
- `novel` - 关联推荐小说（每条记录一个小说）
- `score` - 推荐分数
- `algorithm` - 推荐算法类型（cf/content/hybrid）
- `created_at`

### NovelSimilarity (recommendations/models.py)
- `id` - UUID 主键
- `novel_a`, `novel_b` - 关联小说对
- `similarity` - 相似度分数
- `algorithm` - 计算算法（item_cf/content）
- `created_at`

### NovelFeatureVector (recommendations/models.py)
- `id` - UUID 主键
- `novel` - 关联小说
- `vector_data` - 特征向量数据（JSON）
- `created_at`, `updated_at`

### Analytics Events (analytics/models.py)
- `LoginEvent` - 登录事件追踪
- `SearchEvent` - 搜索事件追踪（关键词、结果数）
- `ViewEvent` - 浏览事件追踪（小说、章节）

## API Endpoints Overview

### 认证相关 `/api/auth/`
- `POST /auth/email-code` - 发送邮箱验证码
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `POST /auth/reset-code` - 发送重置密码验证码
- `POST /auth/reset-password` - 重置密码

### 用户相关 `/api/users/`
- `GET /users/me` - 获取个人信息
- `PUT /users/me` - 更新个人信息
- `PUT /users/me/password` - 修改密码
- `GET /users/me/favorites` - 获取我的收藏
- `GET /users/me/comments` - 获取我的评论
- `GET /users/me/ratings` - 获取我的评分

### 小说相关 `/api/novels/`
- `GET /novels/search` - 搜索小说（支持 title、author、category、tags 过滤）
- `GET /novels/{id}` - 获取小说详情
- `GET /novels/{id}/chapters` - 获取章节列表
- `GET /novels/{novelId}/chapters/{chapterId}` - 获取章节内容

### 互动相关 `/api/`
- `POST /novels/{novelId}/favorite` - 收藏/取消收藏
- `POST /novels/{novelId}/rating` - 提交评分
- `GET /novels/{novelId}/comments` - 获取评论列表（支持嵌套）
- `POST /novels/{novelId}/comments` - 发表评论
- `GET /comments/{commentId}/replies` - 获取评论回复
- `DELETE /comments/{commentId}` - 删除评论
- `GET /history` - 获取阅读历史
- `POST /history` - 更新阅读进度
- `DELETE /history/{historyId}` - 删除阅读历史

### 推荐相关 `/api/recommendations/`
- `GET /recommendations/personalized` - 获取个性化推荐
- `GET /recommendations/hot` - 获取热门小说
- `GET /recommendations/latest` - 获取最新小说
- `GET /recommendations/similar/{novelId}` - 获取相似小说

### 管理员相关 `/api/admin/`
- `GET /admin/novels` - 获取所有小说（管理视图）
- `POST /admin/novels` - 创建小说
- `PUT /admin/novels/{id}` - 更新小说
- `DELETE /admin/novels/{id}` - 删除小说
- `POST /admin/novels/{id}/status` - 变更小说状态（发布/下架）
- `GET /admin/novels/export` - 导出小说数据
- `GET /admin/users` - 获取所有用户
- `GET /admin/users/{id}` - 获取用户详情
- `POST /admin/users/{id}/ban` - 封禁用户
- `POST /admin/users/{id}/unban` - 解封用户

### 管理员分析 `/api/admin/analytics/`
- `GET /admin/analytics/novels` - 获取小说分析数据
- `GET /admin/analytics/users` - 获取用户分析数据

## Frontend Routes

### 公开路由
- `/login` - 登录页
- `/register` - 注册页
- `/forgot-password` - 重置密码页
- `/read/:id` - 阅读器页（沉浸式，无布局）

### 公开浏览路由（无认证）
- `/` - 首页
- `/search` - 搜索页
- `/novels/:id` - 小说详情页
- `/category` - 分类页
- `/ranking` - 排行榜页

### 受保护的用户路由
- `/bookshelf` - 书架（收藏）
- `/history` - 阅读历史
- `/profile` - 个人资料

### 管理员路由（需要 admin 权限）
- `/admin` - 管理后台仪表盘
- `/admin/novels` - 小说管理
- `/admin/users` - 用户管理
- `/admin/analytics` - 数据分析

## Recommendation System

推荐系统采用混合算法策略：

### 基于内容的推荐
- 使用小说的类别、标签计算相似度
- Jieba 中文分词处理描述文本
- TF-IDF 向量化 + 余弦相似度

### 协同过滤推荐
- 用户-物品矩阵分解
- 基于用户的相似度计算
- 基于物品的相似度计算

### 缓存机制
- `RecommendationCache` 模型存储预计算结果（每条记录一个小说）
- `NovelFeatureVector` 模型存储 TF-IDF 特征向量
- 离线任务定期更新推荐列表

### 管理命令
```bash
# 计算推荐（支持算法选择）
python manage.py compute_recommendations                         # 运行所有算法
python manage.py compute_recommendations --algorithm=cf          # 只运行协同过滤
python manage.py compute_recommendations --algorithm=content     # 只运行内容推荐
python manage.py compute_recommendations --min-interactions=2    # 用户/物品最少需要的交互数
python manage.py compute_recommendations --top-k=20              # 每个小说保留的最相似小说数量
python manage.py compute_recommendations --n-recommendations=20  # 每个用户的推荐数量

# 导入小说数据（CSV）
python manage.py import_novels_csv --path=../sql/novels_mysql.csv
python manage.py import_novels_csv --batch-size=500 --limit=1000
python manage.py import_novels_csv --truncate  # 删除现有数据后导入
```

## Test Data & Import

项目包含测试数据用于开发：

### CSV 数据导入
- `backend/sql/novels_mysql.csv` - 小说数据 CSV（约 2.6MB）
- `backend/sql/preprocess_novels_to_mysql_csv.py` - 数据预处理脚本

### 导入流程
```bash
# 方法1：使用管理命令（推荐）- 从 CSV 文件导入
python manage.py import_novels_csv --path=../sql/novels_mysql.csv

# 方法2：使用管理命令（从 MySQL 数据库表导入）
python manage.py import_novels --table=novels --db-name=story --db-user=root

# 方法3：直接 SQL 导入（SQLite）
sqlite3 db.sqlite3 < ../sql/novels_data.sql

# 方法4：MySQL 批量导入
mysql -u root -p story < ../sql/novels_mysql.sql
```

## Frontend Technologies

- **React 19.2** - UI 框架
- **TypeScript 5.9** - 类型系统
- **Vite 7.2** - 构建工具
- **Ant Design 6.1** - UI 组件库
- **React Router 7.11** - 路由管理（使用 RouterProvider）
- **Axios 1.13** - HTTP 客户端
- **Three.js 0.182** - 3D 图形库
- **React Three Fiber 9.5** - React Three.js 集成
- **@react-three/drei 10.7** - Three.js 辅助库
- **Tailwind CSS 3.4** - 样式框架
- **Vitest 4.0** - 测试框架
- **Framer Motion 12.29** - 动画库
- **clsx 2.1** - 类名工具
- **tailwind-merge 3.4** - Tailwind 类名合并
- **@ant-design/icons 6.1** - Ant Design 图标

## Backend Dependencies

主要依赖版本：
- Django 5.0+
- Django REST Framework 3.15+
- djangorestframework-simplejwt 5.3+
- django-cors-headers 4.3+
- mysqlclient 2.2+ (MySQL 支持)
- scikit-learn 1.4+ (推荐算法)
- pandas 2.1+ (数据处理)
- numpy 1.26+ (数值计算)
- scipy 1.11+ (科学计算)
- jieba 0.42+ (中文分词)
- openpyxl 3.1+ (Excel 支持)
- xlrd 1.2.0 (Excel 读取)
- python-dotenv 1.0+ (环境变量管理)

## Important Notes

1. **邮箱验证码**：开发期"假发送"，验证码会在后端控制台输出
2. **登出实现**：无状态 JWT，仅返回 `{success: true}`，前端需清理本地 token
3. **401 处理**：前端 Axios 拦截器会捕捉 401 错误，自动跳转到登录页
4. **管理员接口**：需要 `role=admin` 权限，通过 `isStaffUser` 权限类控制
5. **文件上传**：当前假设封面图片通过外部 URL 提供，未实现文件上传功能
6. **软删除模式**：删除操作不会物理删除数据，而是设置 `isDeleted=true`
7. **嵌套评论**：评论通过 `parent` 字段实现父子关系，支持无限层级嵌套
8. **阅读进度**：`ReadHistory` 记录用户每本书的最后阅读章节和进度百分比
9. **推荐缓存**：推荐结果使用离线计算，每条记录一个小说，包含推荐分数
10. **分析追踪**：用户行为（登录、搜索、浏览）会自动记录到 analytics 表
11. **时区注意**：后端使用 `Asia/Shanghai` 时区，所有时间戳以此为准
12. **3D 组件**：Hero3D 和 SolarSystem 组件使用 Three.js 渲染 3D 效果
13. **阅读器页面**：`/read/:id` 路由是沉浸式页面，没有布局导航
14. **密码重置**：支持通过邮箱验证码重置密码功能

## Development Workflow

### 典型开发流程
1. 启动后端：`cd backend && python manage.py runserver`
2. 启动前端：`cd frontend && npm run dev`
3. 访问 `http://localhost:5173` 进行开发
4. API 请求通过 Vite 代理转发到后端

### 添加新功能
1. 后端：在对应 Django app 中添加 model 和 API
2. 运行 `python manage.py makemigrations` 和 `python manage.py migrate`
3. 前端：在 `src/api/` 中添加 API 客户端方法
4. 在 `src/pages/` 或 `src/components/` 中实现 UI
5. 更新 `src/router/index.tsx` 中的路由配置

### 数据库切换
```bash
# SQLite → MySQL
# 1. 创建 MySQL 数据库
mysql -u root -p -e "CREATE DATABASE story CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 修改 backend/.env
DB_ENGINE=mysql
DB_NAME=story
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=127.0.0.1
DB_PORT=3306

# 3. 安装 MySQL 客户端（如需要）
pip install mysqlclient

# 4. 运行迁移
python manage.py migrate
```

### 路由权限控制
- 公开路由：直接配置在根路由
- 用户路由：使用 `<RequireAuth>` 组件包裹
- 管理员路由：使用 `<RequireAuth requiredRole="admin">` 包裹
