# Stage 26C20 - reconciliation RPC integration candidate

## Scope
- Added `finance_reconcile` authenticated Netlify endpoint, disabled by existing server-side finance release gate.
- Added PostgreSQL reconciliation candidate with row validation and one-statement transaction semantics.
- No database migration applied and no live write attempted.

## Critical blockers before activation
1. **Reconciliation audit trail missing.** The existing `finance_approval_events` only accepts approved/rejected decisions tied to a publication. Add a dedicated immutable reconciliation audit table and write it in the same transaction before deployment.
2. **RPC-only permissions unresolved.** SECURITY INVOKER needs UPDATE policies; allowing UPDATE to authenticated finance users lets them bypass the RPC. Use a tightly reviewed, least-privileged SECURITY DEFINER design or another safe privileged execution boundary; do not activate this invoker candidate as-is.
3. Existing import and publication invoker RPCs likewise need hardened permission design.
4. Database schema, grants, policies, transaction rollback and role isolation must pass staging tests.
5. The client UI has no reconciliation action yet; deliberately not added until the server/database audit is complete.

## Safety
Keep `VH_FINANCE_WRITES_ACCEPTED` unset. Never set it until all gates pass. No live Supabase modifications in this package.
