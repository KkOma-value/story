## Context
The project imports novels from an Excel dataset into a CSV and then into Django models. The UI currently routes “开始修炼” to an internal reader page, while the user expects to jump to the external link provided in the Excel “链接” column. The history page exists in the frontend but lacks backend support.

## Goals / Non-Goals
- Goals:
  - Store and serve a per-novel external reading link derived from the Excel dataset.
  - Open the external link in a new tab from the novel detail page.
  - Record a read-history entry when authenticated users start reading.
  - Ensure history records surface in the “足迹” page via backend APIs.
- Non-Goals:
  - Rebuild the reader experience or change recommendation algorithms.
  - Modify authentication flows beyond existing route guards.

## Decisions
- Decision: Introduce a new nullable field on `Novel` for the external reading link (e.g., `source_url`).
  - Rationale: The link is a first-class novel attribute and should be available in detail responses.
- Decision: Extend the XLS preprocessing and CSV import pipeline to capture the Excel “链接” column.
  - Rationale: The project already uses the XLS → CSV → Django import pipeline; extending it keeps data alignment consistent.
- Decision: Use book title as the primary match key, with author as a tie-breaker, and fall back to `source_book_id` when available.
  - Rationale: The Excel data includes title/author and `书号`, and current imports already use `source_book_id` for deterministic IDs.
- Decision: Record history when the user clicks “开始修炼” on the detail page.
  - Rationale: This aligns with the requested behavior and avoids requiring a full read session.

## Risks / Trade-offs
- Duplicate titles may map to incorrect links without author or source ID; add author tie-breaker and log/skip ambiguous rows.
- Introducing a new field requires a database migration and backfilling imported data.

## Migration Plan
1. Extend XLS preprocessing to extract “链接” and write it to the CSV.
2. Add `source_url` to the `Novel` model and include it in serializers.
3. Update CSV import to populate `source_url`.
4. Add read-history storage and APIs.
5. Update frontend detail page to open external links and create history entries.

## Open Questions
- If a novel has no external link, should “开始修炼” be disabled or fall back to internal reading?
