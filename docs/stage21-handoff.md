# Stage 21 — Controlled isolation and authentication loading fix

## Verified database tests
Temporary Managed Environments and Montel department reports and meeting actions were inserted in a single transaction. Under the authenticated database role with User A's UID, one report and one action were visible. With User B's UID, both were visible. With an unknown UID, none were visible. SQL assertions passed and the transaction was rolled back. Previous transactional write tests established that User A cannot create Presenter actions and User B cannot create department reports.

## Interface change
The Stage 20 acceptance page now shows a loading state while restoring a stored session after F5. The sign-in form does not flash during restoration. A generation guard prevents stale async responses from restoring the wrong account after sign-out. Password input is cleared on sign-out and successful login.

## Remaining acceptance gates
The Build 052 main interface is still disabled. This package is not a full reporting UI integration. The original interface uses browser-local state and cannot safely be switched to central persistence merely by enabling its login. Full integration requires mapping each reporting and action operation to Supabase, write policies for sections/items, finance separation, version handling, audit tests and live browser/API negative tests. Do not promote as production-ready.

## Deployment
Deploy via Netlify Drop using this zip; preserve SUPABASE_URL and SUPABASE_ANON_KEY. Verify F5 loading state and User A -> B -> A sign-out sequence in a browser. No credentials should be shared.
