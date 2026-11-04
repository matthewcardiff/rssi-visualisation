# Stage 26C14 - Atomic finance publication candidate

Implemented a PostgreSQL SECURITY INVOKER publication function, invoked with the authenticated user's JWT through a Netlify API operation. The function checks active finance/administrator role, reconciliation, source period (two rail periods before reporting week), four unique metrics per department, input states, mapping issues and import-level findings. It locks the reporting week to serialize version allocation, inserts publication records, values and approval audit events, and supersedes earlier publications in a single database transaction. A duplicate import cannot be published twice.

**Deployment gate:** SQL in database/finance_atomic_workflow.sql is a proposed migration, NOT applied to Supabase. Existing RLS may block function writes; this must be reviewed with least-privilege policies. The earlier two-request staging import remains non-atomic and is not corrected by this publication function. There is no UI approval button in this package. The RPC must not be enabled in staging until migration review, RLS verification, import atomicity remediation, and finance/non-finance two-account acceptance including rollback and concurrency tests. No live records were changed.

Local verification: node --check of API, npm run build, ZIP integrity. These do not establish database or browser acceptance.
