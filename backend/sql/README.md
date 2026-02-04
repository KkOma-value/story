# backend/sql

本目录用于把项目根目录下的两份 Excel 清洗成可导入 MySQL 的 CSV，并提供建表 SQL。

## 输入文件（已在仓库根目录）
- `(全部)20年5月至24年5月2日天榜双榜数据、首日收藏6000(或2000v)，以及近2个月综合数据前500、v收排行前500的作品数据(4).xls`

## 1) 生成 CSV
在仓库根目录执行：

- Windows PowerShell:
  - `D:/JavaCode/story/backend/venw/Scripts/python.exe backend/sql/preprocess_novels_to_mysql_csv.py --out backend/sql/novels_mysql.csv`

输出：
- `backend/sql/novels_mysql.csv`

说明：
- CSV 的唯一键为 `source_book_id`（对应 `.xls` 的 `书号`）。
- 本方案将 `.xls` 预处理数据作为系统后续唯一数据源。

## 2) 建表
- 执行 `backend/sql/create_tables.sql`

说明：
- 该脚本现在会创建项目所需的最小 MySQL 表集合：`novels`（数据集导入）、`users`、`favorites`、`ratings`、`comments`、以及 analytics 事件表（`login_events/search_events/novel_view_events`）。
- 已按你的确认采用：
  - Novel 主键：dataset-first（`novels.source_book_id BIGINT UNSIGNED` 为主键）
  - UUID 存储：`CHAR(36)`（ASCII）
  - MySQL 版本：8.x

## 3) 导入 MySQL
推荐方式（MySQL 8）：

### 一键初始化（推荐）
本机执行下列脚本会：创建数据库 → 执行建表 SQL → 导入 novels CSV（覆盖更新）。

- `powershell -ExecutionPolicy Bypass -File backend/sql/init_story_mysql.ps1 -User mysql -Host 127.0.0.1 -Port 3306 -Database story`

脚本会提示输入 MySQL 密码；不会把密码写入文件。

### 手动导入（Plan A）

- 覆盖更新导入（Plan A，按 `source_book_id` 覆盖同键记录）：
  - `LOAD DATA LOCAL INFILE 'D:/JavaCode/story/backend/sql/novels_mysql.csv'
     REPLACE
     INTO TABLE novels
     CHARACTER SET utf8mb4
  FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '"'
     LINES TERMINATED BY '\n'
     IGNORE 1 LINES
     (source_book_id,title,author,category,subcategory,intro,tags_json,favorites_count,views_proxy,word_count,status,updated_at,
      first_day_v,first_day_favorites,first_day_flowers,first_day_reward,first_day_rating,first_day_reviews,first_day_words_k,
      best_rank,worst_rank,total_times);
  `

  - Windows 换行提示：如果你发现导入报错/行数不对，可将 `LINES TERMINATED BY` 改为 `\r\n`：
    - `LINES TERMINATED BY '\r\n'`

  提示：
  - 由于本方案以 `source_book_id` 作为小说主键，互动与事件表中的 `novel_id` 外键也指向 `novels.source_book_id`。
  - 当前 Django 代码里的 `Novel.id` 是 UUID（SQLite 环境）。如果后续要切换 Django 到 MySQL，需要同步调整模型/迁移或增加映射层。

注意：
- 如果你的 MySQL 不允许 `LOCAL`，需要开启 `local_infile=1` 或改用其他导入方式。
  - 推荐用支持 `LOCAL` 的客户端连接并开启参数：`mysql --local-infile=1 -u root -p -h 127.0.0.1 -P 3306`
  - 导入前可检查：`SHOW VARIABLES LIKE 'local_infile';`
  - 如需临时开启（需要权限）：`SET GLOBAL local_infile = 1;`
- `tags_json` 列类型为 JSON；如果你的 MySQL 版本不支持 JSON，可把建表 SQL 里 `tags_json JSON` 改为 `tags_json TEXT`。

备注：
- `REPLACE` 的行为是“删+插”。如果你在导入后让系统在同一库上持续运行并累积运行时指标（例如 `rating_count/avg_rating/created_at`），重复导入可能会把这些字段重置为默认值。
  - 需要“可重跑但不覆盖运行时指标”时，建议改用 staging + upsert（Plan B，本目录未展开）。

## 索引说明
已为常用检索字段建立 BTREE 索引：`title`/`author`/`category`/`subcategory`，以及排序常用字段：`favorites_count`/`views_proxy`/`(status, updated_at)`。

可选：如果你需要关键词检索（类似后端 icontains），可以启用 FULLTEXT 索引（见 create_tables.sql 注释行）。

## Smoke checklist（手动验证建议）
- 导入 novels CSV：确认 `novels` 行数与 CSV 一致
- 插入 1 个用户到 `users`
- 插入 1 条 favorite（再把 `deleted_at` 置为非空，再置回 NULL，验证唯一约束与“重新收藏”流程）
- 插入/更新 1 条 rating（验证 (user_id, novel_id) 唯一与 score 1-5）
- 插入 1 条根评论 + 1 条回复（验证 parent 外键与索引）
- 插入 1 条 login/search/view 事件（验证 user_id 可空的外键行为）

## 本地 schema 校验（推荐）
为避免在命令行中暴露密码，可以用 PowerShell 脚本交互式输入密码并在临时库中应用 DDL：

- `powershell -ExecutionPolicy Bypass -File backend/sql/validate_schema.ps1 -User root -Host 127.0.0.1 -Port 3306 -Database story_schema_test`

脚本会：
- 创建数据库（如不存在）
- 执行 `create_tables.sql`
- 输出 `SHOW TABLES` 与 `SHOW CREATE TABLE favorites` 作为快速校验
