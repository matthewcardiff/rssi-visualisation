# Stage 20 — Authenticated acceptance harness (not a deployment)

The original Build 052 application remains disabled. A separate `/acceptance.html` tests real Supabase Auth sessions, roles, department memberships, report visibility, and meeting-action visibility using Netlify Functions. No writes are implemented. The Netlify Function forwards each user's JWT to Supabase RLS, and validates it against `/auth/v1/user` before data reads. No service-role key is used.

## Deployment prerequisites

Configure **Netlify server-side environment variables** (not embedded in the public site):

- `SUPABASE_URL=https://iykikoyluuhvnwnypdyl.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY=<Supabase project's publishable key>`

Do not set a service-role or secret key for this harness. The publishable key can be used with RLS, but is kept server-side here. Netlify must build with Node 22 and the repository root contents, not a manual public-folder drag-and-drop, because the acceptance endpoint is a Netlify Function.

## Verification sequence

1. Deploy to a **preview/staging** environment; do not replace the approved live deployment until reviewed.
2. Open `/acceptance.html`. User A signs in, verify `department_manager` and Managed Environments membership; user B signs in separately, verify `meeting_host` and no department membership.
3. With actual populated reports/actions, verify User A only sees Managed Environments, User B sees all nine. Current empty tables are not sufficient to prove live row isolation.
4. Refresh page and verify session renewal, then sign out and verify browser session storage is cleared. Test expired session, inactive profile, wrong password and direct API requests.
5. Check browser network and Netlify logs for 401/403/5xx, CSP, cookie and caching behavior. Test concurrent users in separate browser profiles.
6. Do not enable the original app until its localStorage reporting, finance, pipeline and actions have been replaced with authenticated Supabase persistence and recovery tests.

## Known limitations

- The harness is **read-only**; no report submission, action changes, finance imports, or legacy data migration.
- Session tokens are stored in sessionStorage to allow page-refresh acceptance; clear on sign-out and test browser isolation. For production, adopt a reviewed session management strategy and account for token revocation.
- This package is not proof of browser acceptance or Netlify deployment. It requires the actual environment variables, hosting, and two real user logins.
- RLS permissions and server configuration must be reviewed before wider access.
