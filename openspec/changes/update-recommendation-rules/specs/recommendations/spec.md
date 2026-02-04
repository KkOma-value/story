## ADDED Requirements
### Requirement: Behavior signal weighting
The system SHALL compute behavior interaction scores by combining favorites and ratings with a weight ratio of 8:2, and SHALL include read history as an implicit positive signal.

#### Scenario: Favorite and rating are combined
- **GIVEN** a user has favorites and ratings for novels
- **WHEN** the system builds interaction scores for recommendation
- **THEN** favorites SHALL contribute 0.8 and ratings SHALL contribute 0.2 (ratings normalized to 0-1)

#### Scenario: Read history adds implicit signal
- **GIVEN** a user has read history records
- **WHEN** the system builds interaction scores for recommendation
- **THEN** each read history entry SHALL add an implicit positive signal with weight 0.5

## MODIFIED Requirements
### Requirement: Personalized recommendations
The system SHALL require authentication for personalized recommendations, and SHALL generate results using a hybrid score that combines collaborative filtering and content-based recommendations with weights 0.6 and 0.4 respectively. If no usable behavior signals exist, the system SHALL fall back to hot recommendations.

#### Scenario: Unauthenticated access
- **WHEN** a client requests `GET /api/recommendations/personalized` without a valid JWT
- **THEN** the system SHALL respond with HTTP 401 and an error `message`

#### Scenario: Hybrid weighting applied
- **GIVEN** the user is authenticated and has behavior signals
- **WHEN** the system returns personalized recommendations
- **THEN** the system SHALL combine CF and content scores using weights 0.6 and 0.4

#### Scenario: Cold-start fallback
- **GIVEN** the user is authenticated but has no usable behavior signals
- **WHEN** the system returns personalized recommendations
- **THEN** the system SHALL return the hot recommendations list

### Requirement: Hot recommendations
The system SHALL provide a public endpoint to return hot novels ranked by a weighted popularity score computed as 50% favorites count, 30% views, and 20% average rating (all normalized with min-max; zero-division yields 0).

#### Scenario: Get hot list
- **WHEN** a client requests `GET /api/recommendations/hot?limit=6`
- **THEN** the system SHALL return a list of novels sorted by the weighted popularity score descending

#### Scenario: Normalization with zero range
- **GIVEN** all candidates have identical metric values for one factor
- **WHEN** the popularity score is computed
- **THEN** that factor SHALL contribute 0 to the final score
