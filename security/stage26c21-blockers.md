# Stage 26C21 - release blockers (review candidate)

1. The candidate SQL ends in `ROLLBACK` intentionally. **Do not remove it** until the items below are fixed and verified.
2. The existing publication RPC inserts a new `published` version before superseding the previous one. A unique active-publication index requires reversing that order within the same transaction.
3. SECURITY DEFINER must be created by a tightly controlled owner; verify every function checks `auth.uid()`, active profile, and finance/admin role. `EXECUTE` is granted only to `authenticated`; the function still rejects other authenticated roles.
4. Review the SQL for all existing policies and grants. `CREATE POLICY` is not idempotent; do not apply without checking existing policy names.
5. `finance_reconciliation_events` captures immutable reconciliation decisions. No client INSERT/UPDATE/DELETE grants. Verify database owner/operator access and append-only audit handling.
6. Current finance APIs use a closed server-side release gate. Keep it closed until real staging tests pass: finance import, reconcile, publish, duplicate/concurrency, rollback, anonymous, contributor, revoked finance user, and direct REST mutation denial.
7. Test the intentional two-rail-period lag against real calendar boundaries and distinguish missing, zero and value.
8. Confirm RLS on `user_roles` and `profiles` supports the intended read checks and no role escalation.
9. This is a review deliverable, not a deployable SQL migration or proof of functional acceptance.
