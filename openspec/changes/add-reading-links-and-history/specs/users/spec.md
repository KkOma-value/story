## ADDED Requirements
### Requirement: Protected bookshelf and history routes
The system SHALL prevent unauthenticated users from accessing the bookshelf and history pages.

#### Scenario: Unauthenticated access is blocked
- **GIVEN** the user is not authenticated
- **WHEN** the user navigates to `/bookshelf` or `/history`
- **THEN** the system SHALL redirect the user to login or show an authentication-required state
