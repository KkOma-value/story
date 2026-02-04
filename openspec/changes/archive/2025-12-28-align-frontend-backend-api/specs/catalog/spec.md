# catalog Delta Specification (align-frontend-backend-api)

## MODIFIED Requirements

### Requirement: View novel detail
The system SHALL provide a novel detail endpoint.

#### Scenario: Authenticated detail includes my fields
- **GIVEN** the request includes a valid JWT
- **WHEN** the client requests `GET /api/novels/{novelId}`
- **THEN** the response `data` SHOULD include `myFavorite` and `myRating` when applicable

#### Scenario: Unauthenticated detail omits my fields
- **GIVEN** the request has no JWT
- **WHEN** the client requests `GET /api/novels/{novelId}`
- **THEN** the response `data` MAY omit `myFavorite` and `myRating`

