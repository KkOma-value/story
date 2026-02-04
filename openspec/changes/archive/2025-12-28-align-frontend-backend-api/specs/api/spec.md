# api Delta Specification (align-frontend-backend-api)

## ADDED Requirements

### Requirement: Client connectivity in development
The system SHALL provide a stable development-time connectivity strategy so the frontend can reach backend endpoints under `/api/*`.

#### Scenario: Frontend calls backend via dev proxy (recommended)
- **GIVEN** the backend is running on `http://127.0.0.1:8000`
- **AND GIVEN** the frontend dev server is running (Vite)
- **WHEN** the frontend issues requests to relative paths under `/api/*`
- **THEN** the dev server SHALL proxy `/api/*` to the backend origin
- **AND THEN** requests SHALL reach the backend without requiring CORS changes

#### Scenario: Frontend calls backend via baseURL (alternative)
- **GIVEN** the frontend is configured with `VITE_API_BASE_URL=http://127.0.0.1:8000`
- **WHEN** the frontend issues requests under `/api/*`
- **THEN** the HTTP client SHALL resolve the full URL to `http://127.0.0.1:8000/api/*`

