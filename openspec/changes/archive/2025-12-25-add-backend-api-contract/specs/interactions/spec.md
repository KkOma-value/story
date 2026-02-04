## ADDED Requirements

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
