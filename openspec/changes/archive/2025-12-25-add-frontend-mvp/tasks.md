## 1. Proposal validation
- [x] Run `openspec validate add-frontend-mvp --strict` and fix all findings

## 2. Frontend scaffolding (React + TS + Vite + npm)
- [x] Initialize Vite React+TS project structure
- [x] Add Ant Design and configure basic layout shell
- [x] Add routing (public/user/admin route groups)

## 3. Auth (register/login/logout + role redirect)
- [x] Implement Register page (form + client validation + submit)
- [x] Implement Login page (form + submit)
- [x] Implement auth state (token + user info + role)
- [x] Implement route guards and post-login redirect (admin → `/admin`, user → `/`)

## 4. Search & browse
- [x] Implement Search page (keyword input + results list)
- [x] Implement Novel detail page (name/author/category/intro)
- [x] Wire navigation from list → detail

## 5. Recommendations
- [x] Implement Home page with 3 sections: Personalized / Hot / Latest
- [x] Each section renders a list and navigates to detail

## 6. API adapter + mock data
- [x] Define TypeScript DTOs and API interface (auth, catalog, recommendations)
- [x] Provide mock implementation with simulated latency
- [x] Provide real implementation placeholder (TODOs) to be filled when backend API lands
- [x] Provide config switch (`VITE_API_MODE=mock|real`)

## 7. Quality gates
- [x] Add lint/format config (ESLint + Prettier)
- [x] Add basic tests for route guard and auth token injection (minimal)
- [x] Ensure `npm run build` passes
