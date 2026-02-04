# Change: add-mysql-schema

## Why
当前后端使用 SQLite（Django 默认），但项目已存在用于导入 Excel 清洗数据的 MySQL 建表与导入流程（见 backend/sql）。同时，系统还需要用户、互动（收藏/评分/评论）与行为分析等表来支撑 API 合约与推荐相关功能。

为了后续稳定迭代，需要先明确：
- MySQL 中需要哪些表（最小集合）
- 每张表的关键字段/约束/索引/外键
- 小说主键策略（与 Excel `source_book_id` 的关系）

本 change 仅产出“数据库表设计提案 + 待确认项”，不直接生成或执行建表 SQL。

## What Changes
- 定义 MySQL 目标表清单（users / novels / favorites / ratings / comments / analytics events）。
- 定义关键约束：唯一性、外键、软删除策略、索引策略、字符集与排序规则。
- 识别与现有实现/脚本的冲突点（尤其是 novels 的主键：UUID vs `source_book_id`）。

## Out of Scope (for proposal stage)
- 不编写/执行实际 `CREATE TABLE ...` 语句
- 不修改 Django models / migrations
- 不切换 Django 数据库配置到 MySQL

## Sources (current repo)
- Django models: backend/users/models.py, backend/novels/models.py, backend/interactions/models.py, backend/analytics/models.py
- MySQL import pipeline for novels: backend/sql/README.md, backend/sql/create_tables.sql
- API contract: api-design/openapi.yaml
- OpenSpec specs: openspec/specs/{users,catalog,interactions,analytics,auth,api}/spec.md

## Decisions needed (please confirm before we write DDL)
1. **Novel 主键策略**
   - Option A (dataset-first): `novels.id = BIGINT source_book_id`（Excel 书号作为主键，最贴合现有导入脚本）
   - Option B (app-first): `novels.id = UUID`，并增加 `source_book_id BIGINT UNIQUE`（保留导入映射，但需要调整导入与后端模型）

2. **UUID 存储形式（若选择 UUID 作为某些表的 PK/FK）**
   - `CHAR(36)`（可读、简单）
   - `BINARY(16)`（更省空间、索引更快，但需要 UUID 编码/解码约定）

3. **软删除策略**
   - Favorites：当前实现是 `deleted_at`（逻辑删除后可重新收藏）
   - Comments：当前实现是 `deleted` boolean（保留内容或内容置空？）
   - Users/Novels：是否需要软删除？目前模型里 novels 有 `status=deleted`，users 有 `status=deleted`

4. **MySQL 版本与字符集/排序规则**
   - MySQL 8.x（推荐，支持 JSON、utf8mb4_0900_ai_ci、FULLTEXT 等）
   - 若低版本：JSON/FULLTEXT 的替代方案

5. **搜索能力**
   - 仅普通索引（title/author/category/tag）
   - 启用 FULLTEXT（title/author/intro）以支持关键词搜索（与后端/前端预期对齐）

## Acceptance
- 提案文档明确列出每张表的字段/约束/索引建议，并列出所有待你确认的决策点。
- `openspec validate add-mysql-schema --strict` 通过。
