# Stage 26B1 - Approved login visual restoration

- Removed generic authentication overlay. The original Build 052 login layout, imagery, and form are used for authentication.
- Authentication calls the existing Netlify `/api/acceptance` service and verifies active role before retaining the session.
- After sign-in, redirects to `/acceptance.html` for connected, RLS-protected reporting.
- Original Build 052 operational pages are still locked down because they use browser-local data and have not been securely migrated. No local editing has been unlocked.
- This is a **login restoration only**, not completed visual parity for the connected reporting pages.
- No database migrations or record mutations.
