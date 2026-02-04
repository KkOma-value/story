## ADDED Requirements

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
