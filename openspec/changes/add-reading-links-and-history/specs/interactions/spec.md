## ADDED Requirements
### Requirement: Reading history capture on start
The system SHALL create or update a reading history record when an authenticated user clicks “开始修炼” on a novel detail page.

#### Scenario: Start reading creates history
- **GIVEN** the user is authenticated
- **WHEN** the user clicks “开始修炼” on a novel detail page
- **THEN** the system SHALL create or update a history record for the novel with `lastReadAt` set to now

### Requirement: Reading history list management
The system SHALL provide endpoints for authenticated users to list, remove, and clear reading history entries.

#### Scenario: List reading history
- **GIVEN** the user is authenticated
- **WHEN** the user requests `GET /api/history`
- **THEN** the system SHALL return a list of history entries ordered by `lastReadAt` desc

#### Scenario: Remove a history entry
- **GIVEN** the user is authenticated
- **WHEN** the user requests `DELETE /api/history/{historyId}`
- **THEN** the system SHALL remove the specified history entry

#### Scenario: Clear history
- **GIVEN** the user is authenticated
- **WHEN** the user requests `DELETE /api/history`
- **THEN** the system SHALL remove all history entries for that user
