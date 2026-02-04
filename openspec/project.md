# Project Context / 项目背景

## Purpose / 项目目的
本项目为毕业设计：面向男频网络小说的个性化推荐系统（Web 应用）。

- **用户侧目标**：提供小说检索、分类浏览、详情查看与推荐入口；登录后提供个性化推荐体验。
- **管理员侧目标**：提供管理端入口（与普通端共用一个 Web 工程，按角色路由分流）。

当前阶段：前端优先完成页面与交互骨架；后端与 API 逐步稳定，前端通过可替换的 API 适配层平滑对接。

## Tech Stack / 技术栈

### Frontend / 前端
- React 18
- TypeScript
- Vite
- npm
- UI：Ant Design (antd)
- 路由：React Router (v6+)
- 数据可视化（统计模块可用）：ECharts（优先）/ D3.js（按需）

### Backend / 后端
- Django
- Django REST Framework (DRF)
- 认证：JWT（服务端签发），前端使用 **HttpOnly Cookie** 持有 Token（避免 localStorage 存储敏感令牌）

### Dev / Tooling
- 前端格式化：Prettier
- 前端静态检查：ESLint（与 Prettier 规则一致）
- 前端测试：Vitest（CI）、React Testing Library（组件测试）
- 后端测试：Django test runner

## Project Conventions / 项目约定

### Code Style / 代码风格
- 语言：前端以 TypeScript 为主；避免 `any`，必要时在边界层（API/解析层）隔离并尽快转换为强类型。
- 命名：
	- React 组件：`PascalCase`（如 `LoginPage`, `NovelCard`）
	- Hooks：`useXxx`（如 `useAuth`）
	- 文件命名：与导出主实体一致（组件/页面用 `PascalCase.tsx`；工具/服务用 `camelCase.ts` 或 `kebab-case.ts`，以项目现有为准）
- UI：优先使用 Ant Design 组件与其推荐交互模式，减少自绘组件。

### Architecture Patterns / 架构模式
- 单一 Web 工程，按角色分流：
	- 普通用户：普通端路由空间
	- 管理员：管理端路由空间
	- 登录成功后根据用户角色跳转到对应入口

- 分层与边界（前端）：
	- `ui`：页面/组件，仅处理展示与交互
	- `api`：请求、DTO/序列化、错误归一、认证附加
	- `domain/types`：跨页面共享领域类型

- API 适配策略：
	- 在后端接口未稳定前，保留可替换 API 适配层（`mock` vs `real`），避免页面逻辑直接依赖具体接口形状。
	- 后端稳定后，统一收敛 DTO 定义与错误封装，避免业务层直接处理 Axios/Fetch 细节。

### Authentication & Security / 鉴权与安全
- 令牌承载：优先使用 **HttpOnly Cookie** 存储访问令牌/刷新令牌（由后端设置 Cookie）。
- 前端请求：通过同源或 dev proxy 调用后端 API（浏览器自动携带 Cookie），避免在 JS 中读取 Token。
- 401/403 约定：
	- 401：未登录/登录过期 → 前端跳转登录页或触发刷新逻辑
	- 403：已登录但权限不足 → 展示权限不足提示
- 日志与敏感信息：前端与后端日志不得输出密码、验证码、Token、个人敏感信息。

### Testing Strategy / 测试策略
- 前端单元测试：核心工具函数、API 适配与错误处理。
- 前端组件/交互测试：登录表单校验、路由守卫、关键页面渲染（RTL）。
- E2E（可选，后期）：Playwright 覆盖主流程（登录 → 首页推荐 → 搜索 → 详情）。
- 后端测试：认证与权限、核心 API（列表/详情/推荐）接口测试。

### Git Workflow / Git 工作流
- 分支：`main` 为稳定分支；使用短生命周期特性分支（如 `feature/add-auth`）。
- 提交信息：推荐 Conventional Commits（如 `feat: add login page` / `fix: ...`）。
- PR：每个变更提案（OpenSpec change）尽量对应一次 PR，便于审阅与归档。

## Domain Context / 领域上下文
- 核心实体：小说（名称、作者、分类、简介、标签/关键词、更新时间等）。
- 核心行为：搜索、浏览详情、（后续）收藏/评分/评论、基于行为生成推荐。
- 推荐入口：个性化推荐、热门推荐、最新推荐。
- 角色：普通用户与管理员（管理员拥有管理端能力入口）。

## Important Constraints / 重要约束
- 后端 API 存在演进：前端必须保持 API 适配层可替换，页面逻辑不直接耦合接口细节。
- 安全：密钥/JWT Secret/数据库密码等不得进入仓库；生产环境避免在前端持久化敏感令牌。
- 体验：列表与详情页面需具备加载态、空态与错误提示；关键操作（登录/收藏等）需要明确的失败提示。

## External Dependencies / 外部依赖
- 后端服务：用户认证服务、小说检索/详情服务、推荐服务（均通过 REST API 提供）。
- 可视化库（后续）：ECharts / D3.js。
