# Visualisation Hub release acceptance checklist

Last audit: 12 November 2026. This checklist separates verified staging fixes from release tests that remain open.

## Fixes verified in staging source or database

- [x] AI Review requires active membership in the requested department for department managers; focused AI unit suite previously passed 9/9.
- [x] Action Log route renders already-loaded rows on first entry and refreshes when its action list is empty; a source regression assertion was added.
- [x] Login label no longer hard-codes “Authenticated staging account.”
- [x] Revoked all `anon` privileges on `hsqe_assurance_register`, `hsqe_close_calls`, `hsqe_workforce_counts`, and `hsqe_close_call_totals` in staging. Effective privilege checks confirmed anonymous SELECT, INSERT and UPDATE are false, while authenticated SELECT remains available.

These checks establish source/database state only. The Netlify deployment for the latest source changes has not been verified.

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
- [ ] Enable Supabase leaked-password protection on staging and rerun the security advisor. Dashboard sign-in is currently blocked by hCaptcha; the setting has not been changed.
- [ ] Review multiple permissive policies and authenticated-accessible SECURITY DEFINER functions against their live grants, policy checks and role checks.
- [ ] Review a narrow, selected release change set against `main`. The staging branch is diverged; do not merge it wholesale.
- [ ] After staging acceptance and explicit approval, plan production rollout separately. No production data, schema or app was changed in this audit.
