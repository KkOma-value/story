## 1. Discovery & alignment
- [x] 收集两份 Excel 的：文件名、sheet 名、列名、样例、总行数。
- [x] 确认第二份 Excel 的语义：书级聚合指标（无 user 维度）。
- [x] 确认小说唯一键策略：使用 `.xls` 的 `书号` 作为唯一键。

## 2. Define preprocessing rules (no code)
- [x] 固化两份 Excel 的实际列名与类型，并明确映射到 `Novel` 的规则。
- [x] 明确唯一键与合并策略：以 `书号` 为主键输出 MySQL CSV。
- [x] 记录结论：仅使用 `.xls` 作为唯一长期数据源。

## 3. Implementation (apply stage)
- [x] 新增清洗脚本：读取 `.xls` 并输出 MySQL 可导入 CSV（唯一键 `书号`）。
- [x] 新增 MySQL 建表 SQL：创建 `novels` 表并为常用检索字段创建索引。
- [x] 新增导入说明：如何生成 CSV、建表与导入 MySQL。

## 4. Validation
- [x] 本地运行脚本生成 `backend/sql/novels_mysql.csv`，确认行数与表头结构。
- [x] 文档化“如何从 Excel 清洗到可运行数据集（MySQL）”的步骤。
