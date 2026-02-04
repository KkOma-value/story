# admin Specification Delta

## ADDED Requirements
### Requirement: Admin lists and filters
The system SHALL provide list endpoints for admin novels and admin users with pagination and basic filters as defined in the API contract.

#### Scenario: List admin novels
- **WHEN** an admin requests `GET /api/admin/novels?page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of novels

#### Scenario: List admin users
- **WHEN** an admin requests `GET /api/admin/users?page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of users

### Requirement: Logical delete for admin entities
The system SHALL logically delete novels and users when removed via admin endpoints.

#### Scenario: Delete novel is logical
- **WHEN** an admin requests `DELETE /api/admin/novels/{novelId}`
- **THEN** the system SHALL logically delete the novel record

#### Scenario: Delete user is logical
- **WHEN** an admin requests `DELETE /api/admin/users/{userId}`
- **THEN** the system SHALL logically delete the user record

### Requirement: Export novels XLSX
The system SHALL support exporting novels as an XLSX file via the admin export endpoint.

#### Scenario: Export returns binary
- **WHEN** an admin requests `GET /api/admin/novels/export`
- **THEN** the system SHALL return an XLSX binary response (not JSON envelope)
