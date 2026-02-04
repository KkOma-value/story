## ADDED Requirements

### Requirement: Search novels
The system SHALL provide a search endpoint supporting queries by title/author/keyword/category/tag and return results sorted by hotness.

#### Scenario: Search with keyword
- **WHEN** a client requests `GET /api/novels/search?q=<keyword>&page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of novels sorted by hotness

### Requirement: View novel detail
The system SHALL provide a novel detail endpoint.

#### Scenario: Get novel by id
- **WHEN** a client requests `GET /api/novels/{novelId}` for an existing novel
- **THEN** the system SHALL return HTTP 200 with the novel detail

#### Scenario: Novel not found
- **WHEN** a client requests `GET /api/novels/{novelId}` for a non-existing novel
- **THEN** the system SHALL return HTTP 404 with an error `message`
