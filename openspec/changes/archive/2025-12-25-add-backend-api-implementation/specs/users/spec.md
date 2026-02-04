# users Specification Delta

## ADDED Requirements
### Requirement: Email is unique
The system SHALL treat user email as globally unique and reject registration attempts that reuse an email.

#### Scenario: Duplicate email
- **WHEN** a client attempts to register with an email that already exists
- **THEN** the system SHALL respond with HTTP 409 and an error `message`

### Requirement: Partial profile update
The system SHALL treat `PUT /api/users/me` as a partial update for optional fields.

#### Scenario: Missing fields are preserved
- **WHEN** an authenticated user updates only `displayName`
- **THEN** the system SHALL preserve other profile fields
