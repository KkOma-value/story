## ADDED Requirements

### Requirement: Novels table supports API fields
The system SHALL persist novels in MySQL with fields sufficient to serve the API contract.

#### Scenario: Novel fields are persisted
- **GIVEN** a novel exists
- **WHEN** a client requests novel detail
- **THEN** the system SHALL be able to read `title, author, category, tags, intro, coverUrl, updatedAt, views, favorites`

### Requirement: Novel metrics are queryable
The system SHALL persist and index metrics needed for sorting and analytics.

#### Scenario: Sort by hot metrics
- **WHEN** a client requests `GET /api/novels/search?sort=hot`
- **THEN** the system SHALL be able to sort by a server-defined metric using indexed columns

### Requirement: Novel status is queryable
The system SHALL persist novel status and allow filtering.

#### Scenario: Filter published novels
- **WHEN** a client searches novels
- **THEN** the system SHALL be able to filter `status='published'` efficiently
