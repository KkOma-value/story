# users Specification

## Purpose
TBD - created by archiving change add-backend-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Profile management
The system SHALL allow an authenticated user to read and update their own profile.

#### Scenario: Read my profile
- **WHEN** an authenticated user requests `GET /api/users/me`
- **THEN** the system SHALL return HTTP 200 and the current user profile

#### Scenario: Update my profile
- **WHEN** an authenticated user requests `PUT /api/users/me` with any of {username, displayName, avatarUrl, bio}
- **THEN** the system SHALL update the user profile and return the updated profile

### Requirement: Password change
The system SHALL allow an authenticated user to change their password.

#### Scenario: Change password
- **WHEN** an authenticated user requests `PUT /api/users/me/password` with oldPassword, newPassword, confirmPassword
- **THEN** the system SHALL validate the old password and update to the new password

### Requirement: Favorites list
The system SHALL allow an authenticated user to list their favorite novels.

#### Scenario: List favorites
- **WHEN** an authenticated user requests `GET /api/users/me/favorites?page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of novels

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

### Requirement: Users table constraints
The system SHALL persist users in MySQL with database-level constraints that enforce API requirements.

#### Scenario: Email is unique
- **GIVEN** an existing user with email `a@example.com`
- **WHEN** a client attempts to register a new user with the same email
- **THEN** the system SHALL reject the request
- **AND THEN** the database SHALL enforce uniqueness on `email`

#### Scenario: Username may repeat
- **GIVEN** an existing user with username `tom`
- **WHEN** a different user registers with username `tom`
- **THEN** the system SHALL allow the registration
- **AND THEN** the database SHALL NOT enforce uniqueness on `username`

### Requirement: User role and status persistence
The system SHALL persist user `role` and `status` in MySQL and keep them queryable.

#### Scenario: Admin role is stored
- **WHEN** a user is created with role `admin`
- **THEN** the database SHALL store `role='admin'`

### Requirement: Password hash storage
The system SHALL store password hashes and SHALL NOT store plaintext passwords.

#### Scenario: Password stored as hash
- **WHEN** a user registers successfully
- **THEN** the system SHALL persist a password hash
- **AND THEN** the database SHALL NOT have any plaintext password column

### Requirement: Personal center UI
The system SHALL provide an authenticated-user personal center entry where the user can manage profile information and favorites.

#### Scenario: Open personal center
- **GIVEN** the user is authenticated
- **WHEN** the user opens the personal center page (e.g. route `.../profile`)
- **THEN** the system SHALL display profile management and favorites management entries

#### Scenario: Unauthenticated access
- **GIVEN** the user is not authenticated
- **WHEN** the user opens the personal center page
- **THEN** the system SHALL redirect the user to login (or show an authentication-required state)

### Requirement: Profile information management UI
The system SHALL allow an authenticated user to view and update their own basic profile fields from the personal center UI.

#### Scenario: View profile in UI
- **WHEN** an authenticated user opens the profile section
- **THEN** the UI SHALL display the current profile returned by `GET /api/users/me`

#### Scenario: Update profile in UI
- **WHEN** an authenticated user updates any of {displayName, avatarUrl, bio}
- **AND** the UI calls `PUT /api/users/me`
- **THEN** the UI SHALL show a success feedback and reflect the updated profile

### Requirement: Favorites management UI
The system SHALL allow an authenticated user to view and remove items from their favorites list.

#### Scenario: View favorites list in UI
- **WHEN** an authenticated user opens the favorites section
- **THEN** the UI SHALL request `GET /api/users/me/favorites?page=1&pageSize=10` (or equivalent paging)
- **AND THEN** the UI SHALL render the returned list of novels

#### Scenario: Remove a favorite from the list
- **GIVEN** the user has at least one favorited novel in the list
- **WHEN** the user triggers "remove" on a novel
- **AND** the UI calls `DELETE /api/novels/{novelId}/favorite`
- **THEN** the UI SHALL remove the novel from the rendered favorites list

