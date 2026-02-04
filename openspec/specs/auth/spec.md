# auth Specification

## Purpose
TBD - created by archiving change add-backend-api-contract. Update Purpose after archive.
## Requirements
### Requirement: Auth endpoints
The system SHALL provide REST endpoints under `/api/auth/*` and enforce the unified JSON response envelope.

#### Scenario: Auth responses use envelope
- **WHEN** a client calls any `/api/auth/*` endpoint
- **THEN** the system SHALL respond using `{ success, message, data }` per API conventions

### Requirement: Auth errors
The system SHALL use HTTP status codes for auth failures and return a human-readable `message`.

#### Scenario: Invalid credentials
- **WHEN** a client submits invalid email/password to `POST /api/auth/login`
- **THEN** the system SHALL respond with HTTP 401 and `{ success=false, message="..." }`

### Requirement: User registration
The system SHALL allow a visitor to register a new account by providing required information and submitting the registration form.

#### Scenario: Registration succeeds
- **GIVEN** the visitor is on the registration page
- **WHEN** the visitor submits valid required fields
- **THEN** the system registers the account
- **AND THEN** the system displays a success confirmation
- **AND THEN** the system navigates the visitor to the login page

#### Scenario: Registration fails validation
- **GIVEN** the visitor is on the registration page
- **WHEN** the visitor submits missing or invalid fields
- **THEN** the system SHALL display validation feedback
- **AND THEN** the system SHALL NOT submit the registration request

### Requirement: User login and JWT storage
The system SHALL allow a registered user to log in and SHALL store the returned JWT token for subsequent authenticated requests.

#### Scenario: Login succeeds (user role)
- **GIVEN** the user is on the login page
- **WHEN** the user submits valid credentials
- **THEN** the system stores the JWT token
- **AND THEN** the system marks the session as authenticated
- **AND THEN** the system redirects the user to the user home page

#### Scenario: Login succeeds (admin role)
- **GIVEN** the user is on the login page
- **WHEN** the user submits valid credentials and the returned role is `admin`
- **THEN** the system stores the JWT token
- **AND THEN** the system redirects the user to the admin entry page

#### Scenario: Login fails
- **GIVEN** the user is on the login page
- **WHEN** the user submits invalid credentials
- **THEN** the system SHALL display an error message
- **AND THEN** the system SHALL remain unauthenticated

### Requirement: Authenticated requests
The system SHALL attach the JWT token to API requests as an HTTP `Authorization` header using the `Bearer` scheme.

#### Scenario: Auth header is attached
- **GIVEN** the user is authenticated
- **WHEN** the system performs an API request that requires authentication
- **THEN** the request SHALL include `Authorization: Bearer <token>`

#### Scenario: Unauthorized response handling
- **GIVEN** the user has an expired or invalid JWT
- **WHEN** the frontend receives HTTP 401 from any authenticated endpoint
- **THEN** the system SHALL clear stored auth state
- **AND THEN** the system SHALL navigate the user to the login page

### Requirement: Logout
The system SHALL allow an authenticated user to log out by clearing stored authentication state.

#### Scenario: Logout succeeds
- **GIVEN** the user is authenticated
- **WHEN** the user triggers logout
- **THEN** the system clears stored token and user state
- **AND THEN** the system navigates to the login page

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

