# auth Specification Delta

## ADDED Requirements
### Requirement: Token validity
The system SHALL issue JWT access tokens for successful logins and SHALL set an access token validity period.

#### Scenario: Default validity period
- **WHEN** the system issues a token on `POST /api/auth/login`
- **THEN** the token validity period SHOULD be 24 hours unless configured otherwise

### Requirement: Email code TTL
The system SHALL store email verification codes with a short TTL and validate them during registration.

#### Scenario: Code expires
- **GIVEN** an email code was issued for a specific email
- **WHEN** the client attempts to register with an expired code
- **THEN** the system SHALL reject the request with HTTP 400 and an error `message`

### Requirement: Password hashing
The system SHALL store passwords using a secure one-way hash and SHALL NOT store plaintext passwords.

#### Scenario: Register stores hash
- **WHEN** a user registers successfully
- **THEN** the system SHALL persist a password hash (not the plaintext)

## MODIFIED Requirements
### Requirement: Auth endpoints
The system SHALL provide REST endpoints under `/api/auth/*` and enforce the unified JSON response envelope.

#### Scenario: Auth responses use envelope
- **WHEN** a client calls any `/api/auth/*` endpoint
- **THEN** the system SHALL respond using `{ success, message, data }` per API conventions
