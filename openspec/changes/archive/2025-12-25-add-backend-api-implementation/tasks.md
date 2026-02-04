# Tasks: Add backend API implementation

## 1. Project setup
- [x] 1.1 Choose framework (Django+DRF default; confirm if Flask)
- [x] 1.2 Scaffold backend service folder (e.g. `backend/`) with dependency management and env config
- [x] 1.3 Add local run workflow (dev server, DB migrations, seed)

## 2. Cross-cutting API conventions
- [x] 2.1 Implement unified JSON response envelope `{ success, message, data }`
- [x] 2.2 Implement error mapping to HTTP status + human-readable `message`
- [x] 2.3 Implement pagination contract (`page`, `pageSize`, and `items/total/page/pageSize` response)

## 3. Auth & Users
- [x] 3.1 Email code issuance, TTL, and basic rate limit
- [x] 3.2 Registration (email unique), password hashing, basic validation
- [x] 3.3 Login (email+password) returns JWT + user profile
- [x] 3.4 Logout per selected policy (stateless vs server-side invalidation)
- [x] 3.5 Users: `GET/PUT /users/me`, `PUT /users/me/password`, `GET /users/me/favorites`

## 4. Catalog & Interactions
- [x] 4.1 Novel search endpoint with filters and sorting
- [x] 4.2 Novel detail endpoint; increment views; include `myFavorite/myRating` when authenticated
- [x] 4.3 Favorite/unfavorite idempotency + logical delete
- [x] 4.4 Rating create/update; maintain aggregates as needed
- [x] 4.5 Comments: create root/reply, list threads, list replies, delete own comment (soft delete)

## 5. Recommendations
- [x] 5.1 Hot list (favorites desc) and latest list (updatedAt desc)
- [x] 5.2 Personalized list (authenticated); minimal strategy acceptable (e.g. based on favorites/ratings)

## 6. Admin & Analytics
- [x] 6.1 Admin authz guard for `/api/admin/*`
- [x] 6.2 Admin novels: list/filter, create, update, status change, logical delete
- [x] 6.3 Admin novels export to XLSX (binary response)
- [x] 6.4 Admin users: list/filter, get, update, ban/unban, logical delete
- [x] 6.5 Analytics: novels and users aggregated endpoints with date range + pagination

## 7. Validation
- [x] 7.1 Add unit tests for core services (auth, pagination, permissions)
- [x] 7.2 Add API-level tests for representative endpoints
- [x] 7.3 Ensure OpenAPI contract alignment (manual check or generate from code)

## 8. Documentation
- [x] 8.1 Document env vars, local run commands, and test commands
- [x] 8.2 Document how frontend points to the backend base URL
