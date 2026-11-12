# RSS Infrastructure Visualisation Hub

This repository contains the Visualisation Hub application and its Netlify Functions. The active review environment is the `build052-visual-restoration` branch. Build 050 is the approved visual and functional baseline. Staging is connected to Supabase and supports departmental reporting, Presenter Mode, actions, and a staged finance workflow.

## Current staging release status

As of 12 November 2026, the branch contains fixes for the AI Review department-membership check, Action Log first-open rendering, and the misleading “Authenticated staging account” login label. The staging Supabase project also has unnecessary anonymous grants removed from the HSQE tables and totals view.

The current source commit is `f9911c29730a8cef2d0c9013775388d38bde5d69`. The Netlify deployment containing these changes has not been verified. The leaked-password protection setting is still pending: Supabase Dashboard sign-in reached an hCaptcha challenge. Production has not been changed.

The staging branch is intentionally isolated from `main`; it is 12 commits ahead and 48 behind. Do not merge the branch wholesale. Review any eventual release as a narrow, explicitly selected change set.

## Local checks

Use Node.js 22 or later.

```sh
npm test
npm run build
```

Netlify uses the staging branch build context and runs the test suite before publishing `public/`. Build and test results for the current audit changes are pending; do not infer a green build from a successful commit.

## Deployment and acceptance

The staging site is:

https://build052-visual-restoration--rssi-visualisation.netlify.app/

Verify the deployed commit or visible build marker before treating a source fix as deployed. Run acceptance using authorized test accounts. Finance upload/review/reconciliation/publication must use a dedicated synthetic staging week; Weeks 29–33 contain operational or existing data and must not be used for synthetic publication. Do not publish test figures into production.

The full release gate is tracked in [security/acceptance-checklist.md](security/acceptance-checklist.md). Key outstanding items include the full regression/build run, account-role and cross-department acceptance, the end-to-end finance workflow in an isolated week, and leaked-password protection in staging. Production release requires explicit acceptance after staging results are reviewed.

## Application structure

- `public/index.html` — authenticated meeting portal and host/presenter views.
- `public/acceptance.html`, `acceptance.js`, `acceptance.css` — departmental reporting interface.
- `netlify/functions/` — authenticated API handlers, including AI Review and Safety Moment.
- `database/` — SQL migrations and reviewed finance workflows.
- `scripts/` — regression tests and build checks.
- `public/deployment-status.json` — source release status, including deployment verification state.

Keep operational data and secrets out of source control. Netlify and Supabase environment settings hold deployment credentials.
