## ADDED Requirements

### Requirement: Users table constraints
The system SHALL persist users in MySQL with database-level constraints that enforce API requirements.

#### Scenario: Email is unique
- **GIVEN** an existing user with email `a@example.com`
- **WHEN** a client attempts to register a new user with the same email
- **THEN** the system SHALL reject the request
- **AND THEN** the database SHALL enforce uniqueness on `email`

#### Scenario: Username may repeat
- **GIVEN** an existing user with username `tom`
- **WHEN** a different user registers with username `tom`
- **THEN** the system SHALL allow the registration
- **AND THEN** the database SHALL NOT enforce uniqueness on `username`

### Requirement: User role and status persistence
The system SHALL persist user `role` and `status` in MySQL and keep them queryable.

#### Scenario: Admin role is stored
- **WHEN** a user is created with role `admin`
- **THEN** the database SHALL store `role='admin'`

### Requirement: Password hash storage
The system SHALL store password hashes and SHALL NOT store plaintext passwords.

#### Scenario: Password stored as hash
- **WHEN** a user registers successfully
- **THEN** the system SHALL persist a password hash
- **AND THEN** the database SHALL NOT have any plaintext password column
