# Stage 26C15 — Atomic finance import remediation candidate

The old two-POST finance staging import was replaced with one authenticated PostgreSQL RPC call. The candidate SQL is in `database/finance_atomic_import.sql`. This is **not applied** to staging or production. Until the RPC is installed, the API fails closed rather than writing an import header without metric rows. SQL revalidates role, reporting-week/source-week offset, department references, four distinct metrics, amount states and dataset hash before inserting both header and rows in one transaction. Imported data stays pending, never published.

Deployment gate: review invoker RLS and table privileges, SQL security, function grants, and compatibility with publication RPC; test rollback, duplicate/concurrent submissions, finance/non-finance access and recovery in staging. Existing `vh_finance_publish` migration also remains unapplied. This package does **not** enable approval/publication. No database writes were performed.

Local validation: Node syntax, configured build verifier, ZIP integrity. The verifier is static, not a browser or database transaction test.
