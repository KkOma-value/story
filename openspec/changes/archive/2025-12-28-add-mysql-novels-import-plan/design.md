# Design: Import novels seed CSV into local MySQL (overwrite semantics)

## Context
仓库已具备：
- 可导入 MySQL 的 `novels_mysql.csv`
- MySQL 8.x 推荐的 `create_tables.sql`（`novels` 主键为 `source_book_id`）

你确认的目标是：本机一次性导入，并在重复 `source_book_id` 时覆盖更新。

## Goals
- 最小化导入步骤与依赖（本机 MySQL 可执行）
- 明确“覆盖更新”的精确定义与边界
- 为常见失败点提供可预期的错误与排障指引（local_infile、编码、换行）

## Non-goals
- 不引入应用内导入 UI/接口
- 不做跨环境（远程服务器 secure_file_priv）自动化

## Key decisions
### 1) Import mechanism
**Plan A (minimal, recommended):** `LOAD DATA LOCAL INFILE ... REPLACE`
- 语义：遇到主键冲突时，以新行替换旧行（实现覆盖更新）
- 风险：`REPLACE` 是“删+插”，可能影响由数据库默认生成的字段（如 `created_at`）以及应用运行时累积字段（如 `rating_count/avg_rating`）

**Plan B (optional safer):** staging + upsert
- 语义：先导入 staging，再 `INSERT ... ON DUPLICATE KEY UPDATE`
- 好处：可以选择只覆盖“数据集字段”（title/author/category/...），保留运行时字段
- 代价：多一张表与多一步 SQL

本 change 的默认推荐为 Plan A（因为你明确为一次性导入）。如果后续你希望“允许重跑导入但不覆盖运行时指标”，再切换到 Plan B。

### 2) Character set & line endings
- 表结构使用 `utf8mb4` 以支持中文。
- CSV 导入应明确 `CHARACTER SET utf8mb4`。
- `LINES TERMINATED BY` 在 Windows/MySQL 客户端可能出现 `\r\n` 与 `\n` 差异；规范中需要允许按实际 CSV 调整。

### 3) Local infile policy
- 规范将 `local_infile=1` 视为 Plan A 的前提条件。
- 若无法开启（安全策略限制），需要改用 Plan B（服务器端导入）或改用 MySQL Workbench 导入（仍属人工流程）。

## Open questions (not blocking the proposal)
- 未来是否会让系统在 MySQL 上持续运行并累积指标？若会，建议尽早采用 Plan B。
