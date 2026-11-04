# Stage 26A — Restored Build 052 interface

- `/` is the unmodified Build 052 user experience with a staging authentication overlay, local-data warning, secure editor shortcut and sign-out.
- `/acceptance.html` remains the Stage 25E connected Supabase reporting app, with existing server functions and RLS.
- Legacy Build 052 remains browser-local and is **NOT** integrated with Supabase. Do not use its edit controls for shared operational data.
- This is a UX restoration preview, not Stage 26 complete. Existing submitted reports and database records are untouched.
- Do not expose this preview as production or remove the warning until legacy persistence has been migrated and tested.
- Next: migrate Build 052 department routing, reporting and pipeline onto authenticated API calls; enforce department permissions and submitted locks in the actual interface.
- TWS is Track Warning Systems. The historical Stage 2 migration plan incorrectly labels it Temporary Works; do not adopt that mapping.
