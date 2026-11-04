# Stage 26C12 — Finance reconciliation register and publication safety gate

- Added a finance/admin-restricted, caller-JWT/RLS-scoped read-only finance import register.
- Checks for four distinct metrics per department/week, mapping reconciliation flags, recorded issues, and import status.
- Displays import IDs and publication counts without exposing financial values in the review listing.
- Approval and publication are deliberately disabled: current two-step REST import is not atomic and there is no verified transactional approval/publish RPC.
- No database changes or test writes. Live authenticated browser and role tests remain outstanding.
- Follow-up: transactional staging/import recovery, reviewer approval, immutable versioning, and publication in a single database transaction with verified RLS.
