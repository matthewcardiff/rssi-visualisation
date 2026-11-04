# Stage 26C7 - departmental meeting actions

Native departmental action list and meeting-host-only creation/edit/completion are connected to the existing `meeting_actions` table. Open and completed actions are displayed independently of reporting week, so open items carry forward. Creation is tagged with the selected reporting week. The API enforces the existing meeting-host role and uses the caller JWT for Supabase RLS; no service-role credentials are used. Optimistic version matching prevents stale overwrites.

Existing database policies permit meeting hosts, not department managers, to mutate actions. No policy change has been made. Browser acceptance, including two-user authorisation and completion transitions, remains outstanding. The original Build 052 UI parity, action export, finance and presenter mode remain incomplete.
