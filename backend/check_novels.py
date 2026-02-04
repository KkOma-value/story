import sqlite3
import json

conn = sqlite3.connect('db.sqlite3')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# 检查表结构
cursor.execute("PRAGMA table_info(novels_novel)")
columns = cursor.fetchall()
print("=== novels_novel 表结构 ===")
for col in columns:
    print(f"{col['name']}: {col['type']}")

print("\n=== 查询数据（包含tags） ===")
cursor.execute("""
    SELECT id, title, author, category, tags, intro, cover_url, status, 
           views, favorites_count, avg_rating 
    FROM novels_novel 
    WHERE status='published' 
    ORDER BY updated_at DESC 
    LIMIT 2
""")

rows = [dict(row) for row in cursor.fetchall()]
print(json.dumps(rows, indent=2, ensure_ascii=False))

conn.close()
