# users Spec Delta (add-user-personal-center-ui)

## ADDED Requirements

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
