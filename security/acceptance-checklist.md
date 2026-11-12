# Visualisation Hub release acceptance checklist

Last audit: 12 November 2026. This checklist separates verified staging fixes from release tests that remain open.

## Fixes and reviews completed in staging

- [x] AI Review requires active membership in the requested department for department managers; focused AI unit suite passed 9/9.
- [x] Action Log route renders already-loaded rows on first entry and refreshes when its action list is empty; regression assertion is in the suite and the source check passed.
- [x] Login label no longer hard-codes “Authenticated staging account.”
- [x] Revoked all `anon` privileges on `hsqe_assurance_register`, `hsqe_close_calls`, `hsqe_workforce_counts`, and `hsqe_close_call_totals`. Effective privilege checks confirmed anonymous SELECT, INSERT and UPDATE are false while authenticated SELECT remains available.
- [x] Removed the redundant presenter INSERT and UPDATE policies on `meeting_actions`. The surviving policies continue to grant active hosts and administrators the same access; the source review confirmed they are covered by the broader action policies.
- [x] Reviewed remaining overlapping permissive policies. Only the two `department_reports` UPDATE policies share the command and role; their row-state conditions are distinct (manager updates from draft/reopened versus host reopen from submitted).
- [x] Reviewed the four SECURITY DEFINER RPCs flagged by the security advisor. Anonymous EXECUTE is false for all; exposed finance/calendar functions check the caller identity and finance/administrator or meeting-host/administrator role. The publish wrapper gates publication and delegates to an internal function that performs the role check.
- [x] Reviewed the 11 RLS-enabled/no-policy informational findings. Anonymous and authenticated users have no SELECT grants on those internal tables.

These checks establish staging source/database state only. The latest Netlify deployment has not been verified. The Supabase security advisor still reports the leaked-password protection setting as disabled.

## Release tests still required

- [ ] Confirm finance table RLS policies exist and are appropriately scoped.
- [ ] Confirm no finance data access for anonymous or ordinary departmental accounts beyond authorised published views.
- [ ] Verify finance/admin can stage a complete import with a real authenticated JWT.
- [ ] Verify non-finance account cannot stage or publish.
- [ ] Verify failed row insert rolls back header and all rows.
- [ ] Verify duplicate/concurrent imports fail without partial writes.
- [ ] Verify two-rail-week source mapping including rail-year boundary.
- [ ] Verify four distinct metrics per department and missing-vs-zero behaviour.
- [ ] Verify reconciliation approval is restricted and an audit event is written.
- [ ] Verify published version supersedes prior version atomically.
- [ ] Verify department submission without finance data.
- [ ] Test department-manager, finance-admin and senior-management permissions, including cross-department denial and post-submit read-only behavior.
- [ ] Test finance upload, extraction, review, reconciliation and publication using a dedicated synthetic staging week. Do not use Weeks 29–33 or publish synthetic data in production.
- [ ] Run the complete `npm test` and `npm run build` suites and retain their results.
- [ ] Confirm the staging Netlify deployment contains the accepted source commit.
- [ ] Enable Supabase leaked-password protection on staging and rerun the security advisor. Dashboard sign-in is currently stopped at hCaptcha; the setting has not been changed.
- [ ] Review staging/production differences and select a narrow change set for release. The staging branch is diverged; do not merge it wholesale.
- [ ] After staging acceptance and explicit approval, plan production rollout separately. No production data, schema or app was changed in this audit.
