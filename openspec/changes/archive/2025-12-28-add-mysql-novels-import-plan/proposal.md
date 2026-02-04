# Change: add-mysql-novels-import-plan

## Why
当前项目已经生成了可导入 MySQL 的数据集 CSV（`backend/sql/novels_mysql.csv`）与建表脚本（`backend/sql/create_tables.sql`），但“如何在本机 MySQL 中完成一次性导入，并在存在重复 `source_book_id` 时覆盖更新”的操作规范尚未被明确写入 OpenSpec。

缺少明确规范会导致：
- 导入命令参数不一致（编码/换行/引号/NULL 处理），造成乱码或字段错位
- 遇到重复主键时行为不确定（失败/跳过/覆盖），影响可重复操作与数据一致性
- MySQL `local_infile` / 权限策略不同导致导入失败，排障成本高

## What Changes
- 在 `admin` 规范中补充“导入 novels seed CSV 到 MySQL”的要求，明确：
  - 前提条件（已建表、本机导入、字符集）
  - 覆盖更新语义（以 `source_book_id` 为唯一键，重复导入覆盖同键记录）
  - 失败处理（`local_infile` 未开启等）
- 给出一个最小可执行的导入方案（推荐）与一个更安全的可选方案（可保留运行时指标）。

## Decisions (confirmed)
- 运行环境：本机 MySQL（推荐 8.x）
- 导入方式：一次性导入
- 冲突策略：覆盖更新（同 `source_book_id` 的记录以 CSV 为准）

## Proposed Import Plan (high-level)
### Plan A (recommended minimal): `LOAD DATA LOCAL INFILE ... REPLACE`
- 直接将 `novels_mysql.csv` 导入 `novels` 表
- 使用 `REPLACE` 语义实现“同主键覆盖”

### Plan B (optional safer): staging table + upsert
- 先导入到临时/中间表 `novels_staging`
- 再 `INSERT ... ON DUPLICATE KEY UPDATE` 合并到 `novels`
- 优点：可以选择性覆盖“数据集字段”，避免覆盖应用运行时字段（如 `rating_count/avg_rating/created_at`）

> 本 change 在 proposal 阶段只固化规范与导入语义；是否需要 Plan B 取决于你是否计划在导入后继续运行系统并产生运行时指标、且未来可能重跑导入。

## Impact
- Affected specs: `admin`
- Affected code/docs (apply stage): 可能需要把 `backend/sql/README.md` 中的导入示例补充为“覆盖更新版”（如加入 `REPLACE` 或 staging+upsert 说明）
- Backward compatibility: 不影响现有 API 行为；属于运维/数据导入规范。

## Out of Scope
- 不修改现有 CSV 生成脚本逻辑
- 不在应用内新增“导入 UI”或后台接口
- 不切换 Django 运行数据库到 MySQL（仍可独立使用 MySQL 作为数据集库）

## Sources (current repo)
- Data preprocessing & CSV: `backend/sql/preprocess_novels_to_mysql_csv.py`, `backend/sql/novels_mysql.csv`
- MySQL DDL: `backend/sql/create_tables.sql`
- Existing guidance: `backend/sql/README.md`
- Existing OpenSpec requirements: `openspec/specs/admin/spec.md`（含预处理要求）

## Acceptance
- 新增/修改的 spec delta 明确“本机一次性导入 + 覆盖更新”的语义与失败场景。
- `openspec validate add-mysql-novels-import-plan --strict` 通过。
