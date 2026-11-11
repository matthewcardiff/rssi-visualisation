# Visualisation Hub — Netlify staging hosting package, Build 052

This package is ready to host the disabled sign-in screen on Netlify. It is NOT
ready for shared-user acceptance: Supabase accounts/data, OpenRouter and Microsoft
365 email are not connected. It includes the application source for subsequent
integration. Hosting does not activate these services. No secret values are needed.

## Deploy manually

1. Extract this ZIP completely.
2. Sign in to Netlify and choose the option to add a project/site using manual deployment.
3. Upload or drag the **public** folder, which contains index.html. Do not upload
   the enclosing project folder, the earlier Build050 file, or a saved data copy.
4. Open the generated URL. Expect the RSS branding, Build 052 badge, disabled
   email/password fields, disabled Sign in and an account-service connection message.
5. Verify /deployment-status.json reports Build 052 with all connections false.
6. Check /robots.txt and the response headers (listed in public/_headers).

Manual deployments do not execute build checks. Checks have been run on the
included public folder. After editing, run `node scripts/verify.cjs` before uploading.

## Deploy from a Git repository

Commit this package's contents at the repository root, then import that repository
into Netlify. Base directory: leave empty. Build command: `node scripts/verify.cjs`.
Publish directory: `public`. No framework preset or install dependencies required.
netlify.toml supplies the same settings. Only public/ is published; docs/scripts
remain outside it. No site or repository has been created by this preparation.

## Expected limitations and next work

- Sign-in and navigation are deliberately disabled, including with JavaScript off.
- There is no hosted authentication, database connection or secure shared reporting.
- The in-page gate is a preparation control, not a security boundary for data.
- No passwords, API keys, demo accounts or saved operational data are supplied.
- No live emails, scheduled tasks or AI requests can run from this deployment.
- Search indexing is discouraged; robots/noindex are not access control. Configure
  Netlify's site access protection separately if the URL must be restricted.
- HTTP headers are applied by Netlify; local file preview cannot verify them.
- Security policy deliberately blocks outbound connections and form submission.
  Update it to precise approved service endpoints as part of backend integration.
- Inline scripts/styles remain for compatibility with the existing single-file app.
- Legacy browser-storage feature code remains for migration; do not enable the UI
  until shared persistence, authenticated membership, server policies and tests pass.

## Before operational staging acceptance

Connect Supabase authentication and shared storage together; replace the deny-only
identity hooks and email-based legacy role assumptions with real memberships and
database policies. Enable multiple named users per department. Preserve independent
department submission, nine departments and the intentional two-week finance lag.
Then configure Netlify server functions, OpenRouter and Microsoft365 mail. Set
`OPENROUTER_API_KEY` as a server-side Netlify secret; optionally set
`OPENROUTER_MODEL` (defaults to `openai/gpt-oss-120b`). Keep
server secrets in service settings. Test two-user isolation, sessions, simultaneous
edits, finance, action reminders and recovery before inviting users.

No deployment or live service configuration was performed. Syntax, package and
isolated gate checks pass. Full Edge/browser and hosted HTTP checks remain pending.

Official references:
- https://docs.netlify.com/deploy/create-deploys/
- https://docs.netlify.com/build/configure-builds/file-based-configuration/
- https://docs.netlify.com/manage/routing/headers/
