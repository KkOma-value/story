## ADDED Requirements
### Requirement: Novel external reading link
The system SHALL store an external reading link for each novel when provided by the Excel data source and expose it on novel detail.

#### Scenario: Novel detail includes source URL
- **GIVEN** a novel has an external link from the Excel “链接” column
- **WHEN** a client requests `GET /api/novels/{novelId}`
- **THEN** the response `data` SHALL include `sourceUrl`

### Requirement: Start reading opens external link
The system SHALL open the external reading link in a new tab when the user clicks “开始修炼” on the novel detail page.

#### Scenario: Start reading opens external link in new tab
- **GIVEN** the novel detail response includes `sourceUrl`
- **WHEN** the user clicks “开始修炼” on the novel detail page
- **THEN** the system SHALL open `sourceUrl` in a new browser tab
