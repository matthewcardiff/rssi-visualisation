# Stage 26C17 — Finance RLS design and security gate

## Result
Prepared an explicit, inspectable finance RLS **candidate** in `database/finance_rls_candidate.sql`. It is NOT applied and is NOT production-ready. The current Supabase security advisor reported finance tables with RLS enabled but no policies; this candidate addresses that *specific* missing-policy condition while restricting finance data to active finance/administrator users. No finance publication has been enabled.

## Critical architectural finding
A naive authenticated finance role policy granting INSERT/UPDATE on `finance_publications` and `finance_approval_events` permits a finance user to call the Supabase REST Data API directly and create publication/approval rows without the controlled RPC. Thus a simple RLS fix does **not** preserve audit, versioning, reconciliation or immutability guarantees. This candidate is for security review only. Do not deploy it as a final approval solution.

## Recommended remediation before enabling publication
1. Move finance writes behind tightly controlled RPCs and remove direct finance-table INSERT/UPDATE grants for `authenticated`; use carefully audited privileged functions in a non-exposed schema, with fixed `search_path`, explicit active role/org checks and limited EXECUTE grants via a controlled gateway, or a similarly strong architecture. Never make a broad SECURITY DEFINER public RPC.
2. Scope finance authorisation to the organisation on both the caller role and target records; inspect existing `departments`, `reporting_weeks`, `profiles`, `user_roles` constraints and current RLS first.
3. Verify read policies for reporting_weeks, rail_calendar_periods, departments and user_roles, because SECURITY INVOKER RPCs require these reads.
4. Fix concurrency/uniqueness with unique indexes on file hashes, department/week/version and one published version; reconcile historic rows before adding constraints.
5. Test finance/admin positive cases, manager/host/anonymous negative cases, direct REST bypass attempts, rollback, simultaneous imports, simultaneous approvals, audit immutability, and the two-week lag using real staging JWTs.
6. Run security advisors and confirm no unintended table access. Do not enable finance publication until signed acceptance.

## Verification scope
Candidate SQL and documentation created; staging database unchanged. Local static build and ZIP integrity checks are required. Live SQL migration, browser role acceptance and transaction tests remain outstanding.
