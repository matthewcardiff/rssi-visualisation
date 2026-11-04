# Stage 26C23 - Published finance visibility

## Implemented locally

Added `database/finance_published_visibility_26c23.sql` as an unapplied policy candidate. It separates published visibility for executives, meeting hosts and active department members from the finance/admin review of unpublished publication records. Publication value access is inherited through the parent publication's row-level policy. It grants SELECT only; writes remain blocked.

## Release blockers

1. Apply and verify the prior secure RPC-only finance migration (currently marked review-only and ending in ROLLBACK), with database-owner review of SECURITY DEFINER permissions.
2. Confirm that `profiles`, `user_roles` and `department_memberships` SELECT policies permit the intended self-role and membership lookups without recursive RLS failures.
3. Verify organisation isolation where multiple organisations share a database. Membership-based visibility must never cross organisations.
4. Test authenticated users for finance, administrator, executive, meeting_host, department_manager, department_contributor and an unrelated user. Test draft/superseded visibility and direct mutation denial.
5. Confirm the finance publication API returns no unpublished data and the 2-week source period remains correct.

No database mutation has been performed. The finance gate must remain disabled. The SQL is a review candidate, not a deployment-approved migration.
