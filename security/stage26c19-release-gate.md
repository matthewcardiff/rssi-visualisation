# Stage 26C19 — finance write release gate

## Verified finding
The Supabase security advisor on 2026-11-03 reports `rls_enabled_no_policy` on all five finance tables. Existing SECURITY INVOKER RPCs cannot write under this configuration. No database migration was executed.

## Implementation
`netlify/functions/acceptance.mjs` returns HTTP 503 `FINANCE_SECURITY_GATE` for `finance_import` and `finance_publish` unless a server-only Netlify environment variable `VH_FINANCE_WRITES_ACCEPTED` equals `staging-verified-26c19`. This is a deployment kill switch, **not** an authorisation mechanism and not evidence that the database workflow is secure. Do not set this variable before the tests below pass.

## Required work before enabling
1. Take and verify a recoverable staging database backup.
2. Independently review database function ownership, security definer scope, qualified references, fixed search_path, EXECUTE grants, and organisation scoping.
3. Apply a coordinated migration: restricted ledger access; atomic import; server-controlled reconciliation; atomic approval and publication; immutable audit events. Existing invoker SQL candidates are NOT sufficient.
4. Execute the entire `security/stage26c18-test-matrix.md` with authenticated finance, administrator, contributor, and unauthenticated clients, including direct REST bypass tests and concurrent writes.
5. Confirm source period is two rail weeks behind the management week; finance remains independent of departmental submission.
6. Re-run Supabase security advisors; review findings and verify Build 052 visual parity.
7. Only then set `VH_FINANCE_WRITES_ACCEPTED` on staging, redeploy and repeat end-to-end tests. Never set it on production without separate approval.

## Status
Local syntax/build checks only. Database permissions and transactional acceptance NOT verified. Finance writes remain disabled by default.
