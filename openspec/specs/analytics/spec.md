# analytics Specification

## Purpose
TBD - created by archiving change add-backend-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Novel analytics
The system SHALL provide admin-only endpoints to retrieve novel-level analytics including views, favorites, rating count, and average rating.

#### Scenario: Query novel analytics
- **WHEN** an admin requests `GET /api/admin/analytics/novels?from=<date>&to=<date>&page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of novel analytics rows

### Requirement: User behavior analytics
The system SHALL provide admin-only endpoints to retrieve aggregated user behavior analytics.

#### Scenario: Query user analytics
- **WHEN** an admin requests `GET /api/admin/analytics/users?from=<date>&to=<date>&page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of user analytics rows

### Requirement: Date range filtering
The system SHALL accept `from` and `to` date parameters for analytics endpoints as defined in the API contract.

#### Scenario: Query novels analytics with date range
- **WHEN** an admin requests `GET /api/admin/analytics/novels?from=<date>&to=<date>&page=1&pageSize=10`
- **THEN** the system SHALL filter analytics within the provided date range

#### Scenario: Query users analytics with date range
- **WHEN** an admin requests `GET /api/admin/analytics/users?from=<date>&to=<date>&page=1&pageSize=10`
- **THEN** the system SHALL filter analytics within the provided date range

### Requirement: Persist analytics events
The system SHALL persist login, search, and novel-view events in MySQL for admin analytics.

#### Scenario: Login event stored
- **WHEN** a user logs in
- **THEN** the system SHALL insert a login event row with `user_id` and `created_at`

#### Scenario: Search event stored
- **WHEN** a user performs a search
- **THEN** the system SHALL insert a search event row with `user_id` (nullable), `query` (structured), and `created_at`

#### Scenario: Novel view event stored
- **WHEN** a client requests novel detail
- **THEN** the system SHALL insert a novel view event row with `user_id` (nullable), `novel_id`, and `created_at`

