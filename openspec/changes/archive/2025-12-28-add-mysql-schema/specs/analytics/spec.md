## ADDED Requirements

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
