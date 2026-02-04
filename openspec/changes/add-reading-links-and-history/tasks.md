## 1. Implementation
- [ ] 1.1 Extend the novel data model to store an external reading link (source URL) and expose it in novel detail responses.
- [ ] 1.2 Update the XLS preprocessing and CSV import pipeline to read the “链接” column and map links to novels by title (author as tie-breaker when needed).
- [ ] 1.3 Update the novel detail UI so “开始修炼” opens the external link in a new tab when available.
- [ ] 1.4 Add read-history persistence and API endpoints to list, remove, and clear history for authenticated users.
- [ ] 1.5 Update the frontend to create a history record when an authenticated user clicks “开始修炼”, and ensure the history page uses the backend API.
- [ ] 1.6 Add/adjust tests for novel detail serialization, history APIs, and the start-reading action.

## 2. Validation
- [ ] 2.1 Backend: run Django tests related to novels/interactions.
- [ ] 2.2 Frontend: run relevant Vitest tests (or add new ones for start-reading and history).
