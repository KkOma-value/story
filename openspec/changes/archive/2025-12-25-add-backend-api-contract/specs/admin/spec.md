## ADDED Requirements

### Requirement: Admin access control
The system SHALL restrict `/api/admin/*` endpoints to users with admin role.

#### Scenario: Non-admin access
- **WHEN** a non-admin user requests any `/api/admin/*` endpoint
- **THEN** the system SHALL respond with HTTP 403 and an error message

### Requirement: Admin novel management
The system SHALL allow administrators to create, update, shelve, and logically delete novels.

#### Scenario: Create novel
- **WHEN** an admin requests `POST /api/admin/novels` with novel fields
- **THEN** the system SHALL create a novel and return its `novelId`

#### Scenario: Shelve novel
- **WHEN** an admin requests `PATCH /api/admin/novels/{novelId}/status` with status=shelved
- **THEN** the system SHALL mark the novel as shelved

#### Scenario: Delete novel
- **WHEN** an admin requests `DELETE /api/admin/novels/{novelId}`
- **THEN** the system SHALL logically delete the novel record

### Requirement: Export novels
The system SHALL allow administrators to export novel data to XLSX using the active filter criteria.

#### Scenario: Export with filters
- **WHEN** an admin requests `GET /api/admin/novels/export` with query filters
- **THEN** the system SHALL return an `.xlsx` file stream

### Requirement: Admin user management
The system SHALL allow administrators to view, edit, ban, permanently ban, unban, and logically delete users.

#### Scenario: Ban user
- **WHEN** an admin requests `POST /api/admin/users/{userId}/ban` with type=banned
- **THEN** the system SHALL disable login for that user

#### Scenario: Permanently ban user
- **WHEN** an admin requests `POST /api/admin/users/{userId}/ban` with type=permanent_banned
- **THEN** the system SHALL permanently disable login for that user

#### Scenario: Unban user
- **WHEN** an admin requests `POST /api/admin/users/{userId}/unban`
- **THEN** the system SHALL re-enable login for that user
