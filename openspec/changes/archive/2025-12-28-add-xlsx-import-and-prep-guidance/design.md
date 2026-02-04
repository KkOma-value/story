# Design: XLS preprocessing & MySQL seed

## Goals
- 把根目录 `.xls` 数据清洗为 MySQL 可导入 CSV（以 `书号` 作为唯一键）。
- 产出可重复执行的导入流程（脚本 + 建表 SQL + 导入说明）。

## Current code constraints
- `Novel.id`、`User.id`、交互表主键均为 UUID。
- `Novel.tags` 在 DB 中为 JSON 数组；现有导出把 tags 以逗号拼接成字符串。
- `favorites_count` 在运行时由收藏接口增减；`avg_rating/rating_count` 由评分接口聚合刷新。

## Source of truth (Excel)

本仓库已明确：不再使用其他 Excel 文件作为数据源；唯一长期数据源为根目录的传统 `.xls` 文件（书级聚合指标）。

## Canonical source schema (.xls)

本节基于对你当前项目内 `.xls` 的实际检测结果整理（2025-12-28）。

### File: `(全部)20年5月至24年5月2日天榜双榜数据、首日收藏6000(或2000v)，以及近2个月综合数据前500、v收排行前500的作品数据(4).xls`

该文件为传统 `.xls`（OLE2）格式，包含 4 个 sheet：
- `全部天榜双榜数据`（5580+ 行，21 列）
- `全部首日6000收或2000v`（795+ 行，20 列）
- `最新2个月首日v收排行前500`（500 行，19 列）
- `最新2个月首日数据排行500`（500 行，19 列）

这些 sheet 的核心列包含：`书号/书名/一级分类/二级分类/作者/字数/阅读/首日v收/首日收藏/...` 等。

重要结论：该文件不包含“用户级”交互明细（没有 user 维度），因此无法直接导入为交互明细表；它更适合作为“小说热度/首日表现”的聚合特征来源。

字段映射建议（面向 MySQL 种子表）：
- 以 `书号` 作为主键 `source_book_id`
- `title` <- `书名`
- `author` <- `作者`
- `category` <- `一级分类`
- `subcategory` <- `二级分类`
- `views_proxy` <- `阅读`（best-effort）
- `favorites_count` <- `首日收藏`（当源无更可靠收藏数时做兜底）

（可选）日期转换：`.xls` 中的 `入库时间/首次上榜日期/...` 往往是 Excel 序列号；预处理时需要按 datemode 转成真实日期。

## Validation checklist (data-level)
- `source_book_id` 非空且为整数；去重后唯一。
- `title/author/category` 尽量非空；`intro` 由脚本兜底生成。
- 数字指标列为非负整数或空。
