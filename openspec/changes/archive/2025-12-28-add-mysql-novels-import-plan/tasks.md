## 1. Discovery & alignment
- [x] 确认运行环境：本机 MySQL
- [x] 确认导入形态：一次性导入
- [x] 确认冲突策略：覆盖更新

## 2. Spec deltas (proposal stage)
- [x] 在 `admin` spec delta 中新增“CSV 导入 MySQL（覆盖更新）”要求与场景。
- [x] 明确导入前置条件（建表完成、字符集、local_infile）。

## 3. Documentation updates (apply stage)
- [x] 更新 `backend/sql/README.md`：给出覆盖更新版导入命令（Plan A），并补充 Plan B（可选）。
- [x] （可选）补充一份导入 smoke checklist（行数校验、抽样查询、JSON 字段解析）。

## 4. Validation
- [x] 运行 `openspec validate add-mysql-novels-import-plan --strict` 并修正所有问题。
- [ ] （手动验证，非本 change 强制）在本机 MySQL 执行：建表 + 导入 + 抽样查询，确认无乱码与字段错位。
