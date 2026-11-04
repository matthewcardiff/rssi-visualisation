# Stage 26C22 - publication version ordering fix

The finance publication function now supersedes the previous published version **before** inserting the next published version. The partial unique index on (department_id, reporting_week_id) where status=published can therefore be enforced within one PostgreSQL transaction. If any insert, metric copy, or approval audit write fails, PostgreSQL rolls back the supersede operation as well. A reporting-week row lock serialises concurrent publication calls.

The database SQL remains an intentionally rolled-back review candidate. It has **not** been deployed, and finance release gate remains closed.

## Additional prerequisites before applying
- Review SECURITY DEFINER ownership, execute grants, search_path, privilege escalation, and organisational scoping with DBA.
- Verify user_roles/profiles read permissions and role-check behaviour.
- Validate SQL in a disposable/staging transaction and test first and replacement publication, duplicate imports, rollback, concurrent calls, and non-finance access.
- Verify no existing duplicate live publication rows before creating unique indexes.
- Confirm source-period calculation and all finance metric semantics against fixtures.
- Confirm RLS read policies allow the intended published figures to departmental/presenter users; current review policies restrict finance tables to finance/admin and may block existing finance display.
- Check reconciliation audit immutability and whether separation of duties is required.
