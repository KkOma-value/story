# admin Specification

## Purpose
TBD - created by archiving change add-backend-api-contract. Update Purpose after archive.
## Requirements
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

### Requirement: Generate MySQL seed CSV from XLS
The system SHALL provide a documented preprocessing workflow to generate a MySQL-importable CSV from the canonical `.xls` source data.

#### Scenario: Preprocessing succeeds
- **GIVEN** an administrator has the canonical `.xls` file in the repository root
- **WHEN** the administrator runs the preprocessing script
- **THEN** the system SHALL output a CSV keyed by `source_book_id(书号)`
- **AND THEN** the output SHALL be importable into the provided MySQL table schema

#### Scenario: Preprocessing fails fast on missing source
- **GIVEN** the canonical `.xls` file is missing
- **WHEN** the administrator runs the preprocessing script
- **THEN** the system SHALL fail with a clear error describing the missing file path

### Requirement: Import novels seed CSV into local MySQL with overwrite updates
The system SHALL provide a documented procedure to import the generated novels seed CSV (`backend/sql/novels_mysql.csv`) into a local MySQL database table `novels`, using `source_book_id` as the unique key and overwriting existing rows on conflict.

#### Scenario: Successful one-time import into `novels`
- **GIVEN** a local MySQL 8.x instance is available
- **AND GIVEN** the schema has been created (e.g., by applying `backend/sql/create_tables.sql`)
- **WHEN** an administrator imports `backend/sql/novels_mysql.csv` into `novels`
- **THEN** the import SHALL load rows into `novels` with correct UTF-8 (utf8mb4) decoding
- **AND THEN** the number of rows in `novels` SHOULD match the number of data lines in the CSV

#### Scenario: Re-import overwrites existing rows by `source_book_id`
- **GIVEN** `novels` already contains a row with `source_book_id = X`
- **WHEN** the administrator imports a CSV row whose `source_book_id = X`
- **THEN** the stored row for `X` SHALL be overwritten according to the documented conflict strategy

#### Scenario: Import fails with a clear error when `LOCAL INFILE` is not allowed
- **GIVEN** the import method requires `LOAD DATA LOCAL INFILE`
- **AND GIVEN** the MySQL client/server policy disallows `LOCAL INFILE`
- **WHEN** the administrator attempts the documented import
- **THEN** the system documentation SHALL describe the expected failure mode
- **AND THEN** the documentation SHALL provide at least one workaround (e.g., enabling `local_infile` or using an alternative import method)

