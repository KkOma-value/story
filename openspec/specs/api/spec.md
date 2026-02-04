# api Specification

## Purpose
TBD - created by archiving change add-backend-api-implementation. Update Purpose after archive.
## Requirements
### Requirement: Unified JSON response envelope
The system SHALL wrap JSON responses (except binary downloads) with the envelope `{ success, message, data }`.

#### Scenario: Successful response
- **WHEN** an endpoint completes successfully
- **THEN** the system SHALL return HTTP 2xx and `{ success=true, message="OK", data=<payload> }`

#### Scenario: Error response
- **WHEN** an endpoint fails due to client or server error
- **THEN** the system SHALL return HTTP 4xx/5xx and `{ success=false, message="...", data=null }`

### Requirement: Pagination contract
The system SHALL support pagination parameters `page` (1-based) and `pageSize` for list endpoints defined as paginated in the API contract.

#### Scenario: Paginated response shape
- **WHEN** a client requests a paginated list endpoint with `page` and `pageSize`
- **THEN** the system SHALL return `{ items, total, page, pageSize }` as `data`

### Requirement: Binary download exception
The system SHALL return binary content for export endpoints and SHALL NOT wrap such responses in the JSON envelope.

#### Scenario: Export novels as XLSX
- **WHEN** an admin requests `GET /api/admin/novels/export`
- **THEN** the system SHALL return an XLSX binary stream with appropriate `Content-Type`

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

