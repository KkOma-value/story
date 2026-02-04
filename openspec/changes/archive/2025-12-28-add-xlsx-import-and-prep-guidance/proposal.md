# Change: Add XLS preprocessing & MySQL seed guidance

## Why
目前项目缺少“把既有 Excel 源数据预处理为可导入 MySQL 的演示数据集”的明确规范与导入路径。
这会导致字段不匹配、主键无法关联（UUID vs 原始书号）、以及热门排序所需的聚合指标难以稳定复现。

## What Changes
- 固化根目录 `.xls`（书级聚合指标）为唯一长期数据源。
- 定义从 `.xls` 清洗并输出 MySQL 可导入 CSV 的字段映射、类型规范、去重策略（主键为 `书号`）。
- 提供建表 SQL、索引与导入说明，使数据集可重复生成与导入。

## Impact
- Affected specs: `admin`（新增数据预处理与导入规范）
- Affected code: `backend/sql/preprocess_novels_to_mysql_csv.py`、`backend/sql/create_tables.sql`、`backend/sql/README.md`
- Backward compatibility: 不影响现有 API

## Out of Scope
- 不引入新的推荐算法训练管线。
- 不在应用内新增“管理员导入交互明细”的能力（源数据不含 user 维度）。

## Open Questions
- `source_book_id(书号)` 是否需要回写到 Django 系统中可追溯（例如扩展 `Novel` 模型字段），还是仅作为离线 MySQL 数据集主键？
- 后续是否会提供“用户-小说-行为”的明细数据源（收藏/评分/浏览），以支持导入交互明细？
