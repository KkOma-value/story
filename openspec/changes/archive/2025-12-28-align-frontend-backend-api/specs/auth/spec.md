# auth Delta Specification (align-frontend-backend-api)

## MODIFIED Requirements

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

