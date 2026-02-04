# analytics Specification Delta

## ADDED Requirements
### Requirement: Date range filtering
The system SHALL accept `from` and `to` date parameters for analytics endpoints as defined in the API contract.

#### Scenario: Query novels analytics with date range
- **WHEN** an admin requests `GET /api/admin/analytics/novels?from=<date>&to=<date>&page=1&pageSize=10`
- **THEN** the system SHALL filter analytics within the provided date range

#### Scenario: Query users analytics with date range
- **WHEN** an admin requests `GET /api/admin/analytics/users?from=<date>&to=<date>&page=1&pageSize=10`
- **THEN** the system SHALL filter analytics within the provided date range
