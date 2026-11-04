# Stage 26C10 — Finance CSV reconciliation preview

- Added finance/admin-restricted server-side CSV row validation against caller-JWT-accessible departments, management weeks and rail periods.
- Requires four metrics per department/week, detects duplicates, validates missing/zero/value and enforces two-rail-week lag.
- Added CSV upload control for validation preview only; no records are persisted, approved or published.
- Client parser supports quoted fields and limits upload size; server limits row count.
- No schema changes. Live browser authentication and finance-role acceptance remain untested.
- Finance import persistence, approval workflow, and publication still outstanding.
