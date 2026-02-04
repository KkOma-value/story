## ADDED Requirements

### Requirement: Auth endpoints
The system SHALL provide REST endpoints under `/api/auth/*` to support email verification, registration, login, and logout.

#### Scenario: Send email code
- **WHEN** a public client requests `POST /api/auth/email-code` with a valid email and purpose `register`
- **THEN** the system SHALL respond with HTTP 200 and `{ success=true, data.sent=true }`

#### Scenario: Register user
- **WHEN** a public client requests `POST /api/auth/register` with username, displayName, email, code, password, and confirmPassword
- **THEN** the system SHALL create a new user and respond with HTTP 200 and a new `userId`

#### Scenario: Email already registered
- **WHEN** a public client requests `POST /api/auth/register` with an email that is already registered
- **THEN** the system SHALL respond with HTTP 409 and an error `message`

#### Scenario: Login
- **WHEN** a public client requests `POST /api/auth/login` with `email` and `password`
- **THEN** the system SHALL respond with HTTP 200 and return a JWT token and user profile

#### Scenario: Logout
- **WHEN** an authenticated client requests `POST /api/auth/logout`
- **THEN** the system SHALL respond with HTTP 200 and invalidate the session token according to server policy

### Requirement: Auth errors
The system SHALL use HTTP status codes for auth failures and return a human-readable `message`.

#### Scenario: Invalid credentials
- **WHEN** a client submits invalid email/password to `POST /api/auth/login`
- **THEN** the system SHALL respond with HTTP 401 and `{ success=false, message="..." }`
