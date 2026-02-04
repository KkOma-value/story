# interactions Specification

## Purpose
TBD - created by archiving change add-backend-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Favorites
The system SHALL allow an authenticated user to favorite and unfavorite a novel.

#### Scenario: Favorite a novel
- **WHEN** an authenticated user requests `POST /api/novels/{novelId}/favorite`
- **THEN** the system SHALL create at most one favorite per user+novel and return HTTP 200

#### Scenario: Unfavorite a novel
- **WHEN** an authenticated user requests `DELETE /api/novels/{novelId}/favorite`
- **THEN** the system SHALL logically delete the favorite record and return HTTP 200

### Requirement: Ratings
The system SHALL allow an authenticated user to rate a novel with a score from 1 to 5 and update their own rating.

#### Scenario: Rate a novel
- **WHEN** an authenticated user requests `PUT /api/novels/{novelId}/rating` with score 1-5
- **THEN** the system SHALL persist the score and allow overwriting an existing user score

### Requirement: Comments with threading
The system SHALL support user comments with nested replies using a parentId model.

#### Scenario: Post a root comment
- **WHEN** an authenticated user posts `POST /api/novels/{novelId}/comments` with parentId=null
- **THEN** the system SHALL create a root comment

#### Scenario: Reply to a comment
- **WHEN** an authenticated user posts `POST /api/novels/{novelId}/comments` with parentId=<commentId>
- **THEN** the system SHALL create a nested reply (楼中楼)

#### Scenario: Delete my comment
- **WHEN** an authenticated user requests `DELETE /api/comments/{commentId}` for their own comment
- **THEN** the system SHALL delete (or soft-delete) the comment and return HTTP 200

### Requirement: Comments listing
The system SHALL provide public endpoints to list comment threads and replies as defined in the API contract.

#### Scenario: List comment threads
- **WHEN** a client requests `GET /api/novels/{novelId}/comments?page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of comment threads

#### Scenario: List replies
- **WHEN** a client requests `GET /api/comments/{commentId}/replies?page=1&pageSize=10`
- **THEN** the system SHALL return a paginated list of comments

### Requirement: Soft delete comments
The system SHALL soft-delete comments when a user deletes their own comment.

#### Scenario: Delete comment marks deleted
- **WHEN** an authenticated user requests `DELETE /api/comments/{commentId}` for their own comment
- **THEN** the system SHALL mark the comment as deleted and keep the record for auditing

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

