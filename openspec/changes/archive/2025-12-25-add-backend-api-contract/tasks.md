## 1. Proposal validation
- [x] Run `openspec validate add-backend-api-contract --strict` and fix all findings

## 2. API contract docs (deliverables)
- [x] Add Markdown API doc in `api-design/api.md`
- [x] Add OpenAPI 3.0 spec in `api-design/openapi.yaml`
- [x] Ensure endpoints cover modules 2.1–2.8 with roles: Public/Auth/Admin

## 3. Consistency & conventions
- [x] Define unified response envelope and error conventions
- [x] Define pagination contract and apply consistently
- [x] Document soft-delete semantics where required
- [x] Document comment threading (parentId + replies listing)
- [x] Document export as XLSX binary response (exception to JSON envelope)

## 4. Verification steps (for implementers)
- [x] Frontend: adapt `realApi` mapping to unwrap `data` envelope
- [ ] Backend: smoke test each endpoint with Postman/curl (auth → search → detail → favorite → rating → comment) (requires backend running)
- [ ] Admin: verify role-based access control (403/401 paths) (requires backend running)
