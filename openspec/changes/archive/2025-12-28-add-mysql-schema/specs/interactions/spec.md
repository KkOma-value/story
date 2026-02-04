## ADDED Requirements

### Requirement: Favorites uniqueness
The system SHALL enforce at most one favorite record per user+novel.

#### Scenario: Duplicate favorite is prevented
- **GIVEN** a user has already favorited a novel
- **WHEN** the same user favorites the same novel again
- **THEN** the system SHALL NOT create a second active favorite
- **AND THEN** the database SHALL enforce uniqueness for the chosen favorite model

### Requirement: Favorites soft delete
The system SHALL support unfavorite by soft deleting the favorite record.

#### Scenario: Unfavorite marks deleted
- **WHEN** an authenticated user unfavorites a novel
- **THEN** the system SHALL mark the favorite record as deleted (by timestamp or flag)

### Requirement: Ratings uniqueness
The system SHALL enforce at most one rating per user+novel and allow updating it.

#### Scenario: Update rating overwrites
- **GIVEN** a user has rated a novel
- **WHEN** the user rates again
- **THEN** the system SHALL update the existing rating record
- **AND THEN** the database SHALL enforce uniqueness on (user_id, novel_id)

### Requirement: Comments threading via parentId
The system SHALL support nested replies using a self-referencing parent id.

#### Scenario: Reply references parent
- **WHEN** a user replies to a comment
- **THEN** the comment record SHALL store `parent_id=<commentId>`
- **AND THEN** the database SHALL support querying threads and replies via indexes
