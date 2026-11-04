# Stage 26C13 — Finance approval preflight hardening

The finance reconciliation register now checks the two-rail-week source mapping, all four metric keys, null/zero/value consistency, import findings, department/week identifiers and existing mapping flags. An explicit `ready_for_review` boolean is returned for each import, but **no approval or publication is enabled**. The current staging import remains two separate REST writes and is not atomic. No database migration or data mutation was performed. This package is not an authorised finance publication workflow.

Before enabling approval: implement and verify a single database transaction for import and publication, explicit database role authorization, reviewer sign-off, immutable versioning, RLS and rollback tests. Validate with two separate authenticated finance and non-finance accounts on staging. Browser testing is outstanding.
