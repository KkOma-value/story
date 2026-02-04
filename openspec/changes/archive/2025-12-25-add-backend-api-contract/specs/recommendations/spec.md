## ADDED Requirements

### Requirement: Personalized recommendations
The system SHALL provide an authenticated endpoint to return personalized novel recommendations.

#### Scenario: Get personalized list
- **WHEN** an authenticated user requests `GET /api/recommendations/personalized?limit=6`
- **THEN** the system SHALL return a list of novels suitable for the user

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
