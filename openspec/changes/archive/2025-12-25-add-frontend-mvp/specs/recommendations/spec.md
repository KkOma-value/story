## ADDED Requirements

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
