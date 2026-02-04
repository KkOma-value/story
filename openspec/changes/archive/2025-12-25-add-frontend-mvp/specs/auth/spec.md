## ADDED Requirements

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

### Requirement: Logout
The system SHALL allow an authenticated user to log out by clearing stored authentication state.

#### Scenario: Logout succeeds
- **GIVEN** the user is authenticated
- **WHEN** the user triggers logout
- **THEN** the system clears stored token and user state
- **AND THEN** the system navigates to the login page
