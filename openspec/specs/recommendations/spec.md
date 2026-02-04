# recommendations Specification

## Purpose
TBD - created by archiving change add-backend-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Personalized recommendations
The system SHALL require authentication for personalized recommendations.

#### Scenario: Unauthenticated access
- **WHEN** a client requests `GET /api/recommendations/personalized` without a valid JWT
- **THEN** the system SHALL respond with HTTP 401 and an error `message`

### Requirement: Hot recommendations
The system SHALL provide a public endpoint to return hot novels ranked by favorites count.

#### Scenario: Get hot list
- **WHEN** a client requests `GET /api/recommendations/hot?limit=6`
- **THEN** the system SHALL return a list of novels sorted by favorites count descending

### Requirement: Latest recommendations
The system SHALL provide a public endpoint to return latest novels ordered by update time.

#### Scenario: Get latest list
- **WHEN** a client requests `GET /api/recommendations/latest?limit=6`
- **THEN** the system SHALL return a list of novels ordered by update time descending

### Requirement: Personalized recommendations UI
The system SHALL display a personalized recommendation list for an authenticated user based on the user's behavior and similar-user preferences (as provided by the backend).

#### Scenario: Personalized recommendations are shown
- **GIVEN** the user is authenticated
- **WHEN** the user opens the home page
- **THEN** the system SHALL display a personalized recommendation section

#### Scenario: Personalized recommendations are unavailable
- **GIVEN** the user is authenticated
- **WHEN** the system cannot load personalized recommendations
- **THEN** the system SHALL display an error or empty state for that section

### Requirement: Hot recommendations UI
The system SHALL display a hot novels recommendation list based on popularity metrics provided by the backend.

#### Scenario: Hot recommendations are shown
- **GIVEN** the user is on the home page
- **WHEN** the system loads hot recommendations
- **THEN** the system SHALL display a hot recommendation section

### Requirement: Latest recommendations UI
The system SHALL display a latest novels recommendation list based on update time provided by the backend.

#### Scenario: Latest recommendations are shown
- **GIVEN** the user is on the home page
- **WHEN** the system loads latest recommendations
- **THEN** the system SHALL display a latest recommendation section

### Requirement: Navigation to novel details
The system SHALL allow users to open a novel detail page from any recommendation list.

#### Scenario: Open detail from recommendation
- **GIVEN** the user is viewing a recommendation list
- **WHEN** the user selects a novel item
- **THEN** the system navigates to the novel detail page

### Requirement: Limit parameter
The system SHALL support an optional `limit` query parameter for recommendation endpoints.

#### Scenario: Limit applies
- **WHEN** a client requests `GET /api/recommendations/hot?limit=6`
- **THEN** the system SHALL return at most `limit` items

