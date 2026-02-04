# interactions Specification Delta

## ADDED Requirements
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
