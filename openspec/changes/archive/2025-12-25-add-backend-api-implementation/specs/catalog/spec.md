# catalog Specification Delta

## ADDED Requirements
### Requirement: Detail personalization fields
The system SHALL include personalization fields on novel detail when the request is authenticated.

#### Scenario: Authenticated detail includes my fields
- **GIVEN** the request includes a valid JWT
- **WHEN** the client requests `GET /api/novels/{novelId}`
- **THEN** the response `data` SHOULD include `myFavorite` and `myRating` when applicable

### Requirement: Views counting
The system SHALL record a view when a client requests a novel detail.

#### Scenario: View count increments
- **WHEN** a client requests `GET /api/novels/{novelId}` for an existing novel
- **THEN** the system SHALL increment (or record) the novel view metric according to server policy

## MODIFIED Requirements
### Requirement: Search novels
The system SHALL support the query parameters defined in the API contract (`q`, optional structured filters, `sort=hot`, `page`, `pageSize`).

#### Scenario: Structured filters
- **WHEN** a client requests `GET /api/novels/search` with any of `{title, author, category, tag}`
- **THEN** the system SHALL apply the provided filters
