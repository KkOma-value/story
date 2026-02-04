# recommendations Specification Delta

## ADDED Requirements
### Requirement: Limit parameter
The system SHALL support an optional `limit` query parameter for recommendation endpoints.

#### Scenario: Limit applies
- **WHEN** a client requests `GET /api/recommendations/hot?limit=6`
- **THEN** the system SHALL return at most `limit` items

## MODIFIED Requirements
### Requirement: Personalized recommendations
The system SHALL require authentication for personalized recommendations.

#### Scenario: Unauthenticated access
- **WHEN** a client requests `GET /api/recommendations/personalized` without a valid JWT
- **THEN** the system SHALL respond with HTTP 401 and an error `message`
