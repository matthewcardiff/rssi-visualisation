# Stage 26C16 — Supabase finance security gate

## Verified finding (3 November 2026)
Supabase security advisors report `rls_enabled_no_policy` on `public.finance_imports`, `finance_metric_values`, `finance_publications`, `finance_publication_values` and `finance_approval_events`. RLS is enabled, but no policies exist on these tables. This prevents ordinary authenticated finance users from accessing rows via the SECURITY INVOKER RPCs in the candidate SQL. This is a **deployment blocker**, not a cosmetic lint.

Supabase remediation reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## Required controlled change
1. Confirm finance/admin role membership, active profile, organisation scoping and existing table grants. Do not rely on a frontend role check.
2. Create narrowly scoped RLS policies for authenticated finance/admin users for import header/metric rows, and approved publication records. Ensure UPDATE has both SELECT and WITH CHECK policies. Do not allow arbitrary changes to published records.
3. Verify `SECURITY INVOKER` function calls can read/write the exact tables under caller RLS. Keep EXECUTE revoked from PUBLIC and anon.
4. Avoid a blanket policy granting all authenticated users finance access. For dashboard read access, implement only the intended department-scoped published finance visibility.
5. Verify the exact two-prior-rail-period source mapping, duplicate/concurrent import handling, failed transaction rollback, publication versioning, and signed approval audit.
6. Test using real staging JWTs: finance, administrator, department manager, meeting host, anonymous and revoked user. Confirm negative cases fail.
7. Run Supabase security advisors again and record the acceptance results before deployment.

## Additional source review
`finance_atomic_import.sql` and `finance_atomic_workflow.sql` are candidate SQL only. Neither is applied. `finance_atomic_workflow.sql` uses SECURITY INVOKER and requires UPDATE access to supersede an older publication. It also requires INSERT access to publication values and approval events. All must be covered by narrowly scoped RLS. The API currently calls these RPCs and should continue to fail closed until installed.

## Status
BLOCKED — no database migration or data writes were performed. This package is a review/acceptance handoff, not a deployable finance approval release.
