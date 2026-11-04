# Stage 23 — Connected read-only integration shell

- Builds upon Stage 22. Original Build 052 application remains disabled. No localStorage report migration, write operations or deployment performed.
- Four authenticated navigation sections: Overview, Department reporting, Pipeline, Meeting actions.
- Report sections and report items fetched via user JWT through Supabase RLS; no service role key.
- Pipeline is shown only where records expose an authorised department_id. No inference from untrusted names.
- `TWS` remains the original Build 052 identifier; canonical Supabase `track-warning-systems` / Track Warning Systems. Do not change historical source keys.
- All source-backed records remain read-only. Finance two-week source-week rule unchanged; finance not integrated.
- **Next acceptance gates:** verify table grants and RLS for sections/items/pipeline; test User A -> sign out -> User B -> sign out -> User A, verify direct unauthorised API requests, confirm empty datasets; then implement controlled writes with audit events, finance source-week logic and full legacy UI migration.
- Do not publish this stage until authenticated testing has passed. Existing Netlify site remains unchanged.
