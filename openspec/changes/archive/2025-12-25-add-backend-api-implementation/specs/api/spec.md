# api Specification Delta

## ADDED Requirements
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
