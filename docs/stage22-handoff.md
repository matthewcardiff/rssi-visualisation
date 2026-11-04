# Stage 22 — Connected reporting preview

## Scope
- Authenticated read-only dashboard for authorised departments, reporting weeks, department report status, and meeting actions.
- Keeps Stage 21 loading and sign-out isolation controls.
- Preserves the locked Build 052 legacy interface and does not enable writes.
- Existing finance two-week source lag is not changed; finance is not displayed in this preview.

## Deployment
Upload the ZIP to the same Netlify Drop project. Existing SUPABASE_URL and SUPABASE_ANON_KEY variables remain unchanged. Open /acceptance.html.

## Acceptance
1. User A sees Managed Environments as the only authorised department in the filter.
2. User B sees all nine departments in the filter.
3. Both see the real reporting week list from Supabase.
4. Refresh and sign-out work without showing another user's data.
5. Browser network confirms the reports/actions/weeks operations are read-only and authenticated.

## Limitations
- This is not the complete Visualisation Hub. Department form editing, submissions, action writes, finance, presenter reporting, exports and notifications are not yet connected to the frontend.
- Database isolation was tested transactionally in Stage 21; live browser API tests with populated records are still outstanding.
