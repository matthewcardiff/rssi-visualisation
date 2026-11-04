# Stage 26C18 — RPC-only finance security gate

**Decision:** Stage 26C17 direct finance-table write policies are unsafe for approval integrity.
Stage 26C18 includes a candidate SQL revocation and review requirements, not a deployable finished workflow.

The previous import and publish RPCs use SECURITY INVOKER and cannot work with fully revoked direct writes. Do not apply this migration alone: it intentionally blocks finance writes until audited, tightly scoped RPC replacements and an approval/reconciliation workflow are installed together in a controlled migration.

Required before production: verify staging project and backup; independent review of definer-function ownership, schema search paths, EXECUTE grants and organisation scoping; authenticated tests in security/stage26c18-test-matrix.md; check SQL advisors; verify original Build 052 visual parity. No database changes have been performed.
