## ADDED Requirements

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
