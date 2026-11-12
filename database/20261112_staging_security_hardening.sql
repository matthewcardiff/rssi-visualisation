-- Staging-only security hardening applied on 12 November 2026.
-- Production was not changed. Reapplying this file is safe.
begin;

revoke all privileges on table public.hsqe_assurance_register from anon;
revoke all privileges on table public.hsqe_close_calls from anon;
revoke all privileges on table public.hsqe_workforce_counts from anon;
revoke all privileges on table public.hsqe_close_call_totals from anon;

-- These presenter policies were redundant subsets of the department action
-- policies, which already authorize active meeting hosts and administrators.
drop policy if exists vh_presenter_action_insert on public.meeting_actions;
drop policy if exists vh_presenter_action_update on public.meeting_actions;

commit;
