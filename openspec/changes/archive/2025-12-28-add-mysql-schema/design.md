# Design: MySQL schema for story project

## Context
The repo currently contains:
- Django models using UUID primary keys for `User` and `Novel`.
- A MySQL import pipeline for novels where the Excel "书号" (`source_book_id`) is the primary key (BIGINT).

This creates a key architectural fork: whether the system treats the Excel dataset identifier as the canonical novel id, or keeps an internal UUID id and stores the dataset id separately.

## Goals
- Minimal, straightforward MySQL schema that supports the current API contract.
- Preserve or intentionally replace the existing novels import workflow.
- Make constraints explicit (unique, FK, soft delete) to prevent data anomalies.

## Non-goals
- Not deciding recommendation algorithm storage (recommendations app has no models yet).
- Not optimizing for extreme scale; choose clarity first.

## Key decisions

### 1) Novel primary key strategy

**Option A: dataset-first (BIGINT PK = source_book_id)**
- Pros: aligns with backend/sql/create_tables.sql and LOAD DATA import; simplest for novels data.
- Cons: Django models and OpenAPI currently treat ids as strings/UUID; would require model/API alignment.

**Option B: app-first (UUID PK + BIGINT UNIQUE source_book_id)**
- Pros: aligns with current Django code; keeps API stable as UUID.
- Cons: import flow needs mapping logic; joins require an extra lookup unless FK uses UUID.

Recommendation: choose Option A if the dataset is truly the only novels source; choose Option B if the app will ingest novels from multiple sources or needs opaque ids.

### 2) UUID storage type (if UUID used)
- `CHAR(36)`: simple and readable, slightly larger indexes.
- `BINARY(16)`: compact and faster, but requires encoding conventions.

Default recommendation for minimal complexity: `CHAR(36)`.

### 3) Soft delete semantics
- Favorites: keep `deleted_at` to allow re-favoriting without losing history; enforce uniqueness only for active rows (requires either partial unique via generated column or application-level enforcement).
- Ratings: overwrite allowed; keep a unique (user_id, novel_id) constraint.
- Comments: keep record, set `deleted=1`; content retention policy TBD.

### 4) Index strategy
Align with Django models:
- `novels`: (status, updated_at), favorites_count, views
- `favorites`: (user_id, deleted_at), (novel_id, deleted_at)
- `comments`: (novel_id, created_at), (parent_id, created_at)
- analytics events: (created_at), (user_id, created_at), (novel_id, created_at)

### 5) Charset/collation
For Chinese text fields, use `utf8mb4`. Prefer MySQL 8 collation `utf8mb4_0900_ai_ci` if available.

## Open questions to resolve with user
- Which primary key option to pick for novels?
- Do we need FULLTEXT search, or is BTREE index enough for now?
- Do we need soft delete for users/novels beyond status flags?
- MySQL version and whether JSON is supported.
