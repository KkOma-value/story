# catalog Specification

## Purpose
TBD - created by archiving change add-backend-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Search novels
The system SHALL support the query parameters defined in the API contract (`q`, optional structured filters, `sort=hot`, `page`, `pageSize`).

#### Scenario: Structured filters
- **WHEN** a client requests `GET /api/novels/search` with any of `{title, author, category, tag}`
- **THEN** the system SHALL apply the provided filters

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

### Requirement: Novel search
The system SHALL provide a search feature allowing users to search novels by name, author, or keyword.

#### Scenario: Search returns results
- **GIVEN** the user is on the search page
- **WHEN** the user enters a query and submits the search
- **THEN** the system SHALL display a list of matching novels

#### Scenario: Search returns no results
- **GIVEN** the user is on the search page
- **WHEN** the user enters a query and submits the search
- **THEN** the system SHALL display an empty state indicating no matches

### Requirement: View novel details
The system SHALL allow the user to open a novel detail view showing the novel's name, author, category, and introduction.

#### Scenario: User opens a novel detail page
- **GIVEN** the user is viewing a list of novels
- **WHEN** the user selects a novel
- **THEN** the system navigates to the novel detail page
- **AND THEN** the system displays name, author, category, and introduction

### Requirement: Basic loading and error states
The system SHALL provide basic loading indication and error feedback for search and detail views.

#### Scenario: Search is loading
- **GIVEN** the user has submitted a search query
- **WHEN** the system is waiting for search results
- **THEN** the system SHALL display a loading state

#### Scenario: Detail request fails
- **GIVEN** the user is opening a novel detail page
- **WHEN** the system fails to load novel details
- **THEN** the system SHALL display an error state

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

