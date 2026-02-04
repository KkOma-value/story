## 1. Discovery & alignment
- [x] Confirm MySQL version, charset/collation, and deployment environment. (MySQL 8.x)
- [x] Confirm novel primary key strategy (Option A vs B) and UUID storage form (CHAR(36) vs BINARY(16)). (A / CHAR(36))
- [x] Confirm soft-delete semantics for favorites/comments/users/novels. (favorites: deleted_at; comments: deleted flag; users/novels: status)

## 2. DDL authoring (apply stage)
- [x] Write MySQL DDL for: users, novels, favorites, ratings, comments, login_events, search_events, novel_view_events.
- [x] Add constraints: PK/FK, unique constraints, indexes (matching Django models and API behaviors).
- [x] Add migrations strategy: either Django migrations for MySQL or standalone SQL migration scripts. (standalone SQL in backend/sql)

## 3. Data import & compatibility
- [x] If dataset-first: keep `backend/sql` pipeline working end-to-end.
- [x] If app-first: update import pipeline to populate `source_book_id` and map to novel UUID. (N/A - dataset-first chosen)

## 4. Validation
- [x] Define smoke test checklist: create user, import novels, favorite/unfavorite, rate, comment thread/reply, analytics event inserts.
- [x] Run schema validation in a local MySQL instance (or CI) and verify index usage for common queries.
