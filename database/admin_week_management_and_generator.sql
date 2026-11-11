-- Production admin reporting access and Monday noon UK reporting-week automation.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create or replace function public.vh_is_active_administrator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = (select auth.uid())
      and r.role = 'administrator'
      and p.active = true
  );
$function$;

create or replace function public.vh_is_active_department_administrator(p_department_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.user_roles r
    join public.profiles p on p.id = r.user_id
    join public.departments d on d.organisation_id = r.organisation_id
    where r.user_id = (select auth.uid())
      and r.role = 'administrator'
      and p.active = true
      and d.id = p_department_id
  );
$function$;

revoke all on function public.vh_is_active_administrator() from public, anon;
revoke all on function public.vh_is_active_department_administrator(uuid) from public, anon;
grant execute on function public.vh_is_active_administrator() to authenticated;
grant execute on function public.vh_is_active_department_administrator(uuid) to authenticated;

-- Admins can create weeks and change their status while preserving the audit identity.
drop policy if exists vh_manual_week_create on public.reporting_weeks;
create policy vh_manual_week_create
on public.reporting_weeks
for insert
to authenticated
with check (
  creation_method = 'manual'
  and created_by = (select auth.uid())
  and (
    (status = 'planned' and opened_at is null)
    or (status = 'open' and opened_at is not null)
  )
  and exists (
    select 1
    from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = (select auth.uid())
      and r.role in ('administrator', 'meeting_host')
      and p.active = true
  )
);

drop policy if exists vh_admin_week_update on public.reporting_weeks;
create policy vh_admin_week_update
on public.reporting_weeks
for update
to authenticated
using (public.vh_is_active_administrator())
with check (public.vh_is_active_administrator());

-- Administrator edits cover all departments and reporting weeks. Department managers
-- remain restricted by the existing membership, open-week and report-status policies.
drop policy if exists vh_admin_department_report_insert on public.department_reports;
create policy vh_admin_department_report_insert
on public.department_reports
for insert
to authenticated
with check (public.vh_is_active_department_administrator(department_id));

drop policy if exists vh_admin_department_report_update on public.department_reports;
create policy vh_admin_department_report_update
on public.department_reports
for update
to authenticated
using (public.vh_is_active_department_administrator(department_id))
with check (public.vh_is_active_department_administrator(department_id));

drop policy if exists vh_admin_report_section_insert on public.report_sections;
create policy vh_admin_report_section_insert
on public.report_sections
for insert
to authenticated
with check (
  exists (
    select 1
    from public.department_reports r
    where r.id = report_sections.report_id
      and public.vh_is_active_department_administrator(r.department_id)
  )
);

drop policy if exists vh_admin_report_section_update on public.report_sections;
create policy vh_admin_report_section_update
on public.report_sections
for update
to authenticated
using (
  exists (
    select 1
    from public.department_reports r
    where r.id = report_sections.report_id
      and public.vh_is_active_department_administrator(r.department_id)
  )
)
with check (
  exists (
    select 1
    from public.department_reports r
    where r.id = report_sections.report_id
      and public.vh_is_active_department_administrator(r.department_id)
  )
);

drop policy if exists vh_admin_report_item_manage on public.report_items;
create policy vh_admin_report_item_manage
on public.report_items
for all
to authenticated
using (
  exists (
    select 1
    from public.department_reports r
    where r.id = report_items.report_id
      and public.vh_is_active_department_administrator(r.department_id)
  )
)
with check (
  exists (
    select 1
    from public.department_reports r
    where r.id = report_items.report_id
      and public.vh_is_active_department_administrator(r.department_id)
  )
);

drop policy if exists vh_admin_pipeline_manage on public.pipeline_opportunities;
create policy vh_admin_pipeline_manage
on public.pipeline_opportunities
for all
to authenticated
using (public.vh_is_active_department_administrator(department_id))
with check (public.vh_is_active_department_administrator(department_id));

create or replace function public.vh_generate_next_reporting_week(p_force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_local_now timestamp without time zone := timezone('Europe/London', clock_timestamp());
  v_scheduled_for timestamp with time zone := date_trunc('minute', clock_timestamp());
  v_latest_end date;
  v_next_period_id uuid;
  v_new_week_id uuid;
  v_existing_week_id uuid;
  v_run_id uuid;
  v_job_id bigint;
begin
  if not coalesce(p_force, false)
     and (
       extract(isodow from v_local_now) <> 1
       or extract(hour from v_local_now) <> 12
     ) then
    return jsonb_build_object('status', 'skipped', 'reason', 'outside Monday 12:00 Europe/London window');
  end if;

  if not coalesce(p_force, false) and exists (
    select 1
    from public.scheduled_job_runs j
    where j.job_name = 'rssi-weekly-reporting-week'
      and (j.scheduled_for at time zone 'Europe/London')::date = (v_scheduled_for at time zone 'Europe/London')::date
      and j.status in ('running', 'success')
  ) then
    return jsonb_build_object('status', 'skipped', 'reason', 'already ran for this UK date');
  end if;

  insert into public.scheduled_job_runs (job_name, scheduled_for, status, details)
  values ('rssi-weekly-reporting-week', v_scheduled_for, 'running', '{}'::jsonb)
  on conflict (job_name, scheduled_for) do nothing
  returning id into v_run_id;

  if v_run_id is null then
    return jsonb_build_object('status', 'skipped', 'reason', 'duplicate scheduled invocation');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('rssi-weekly-reporting-week'));

  select max(c.end_date)
    into v_latest_end
  from public.reporting_weeks w
  join public.rail_calendar_periods c on c.id = w.rail_period_id;

  select c.id
    into v_next_period_id
  from public.rail_calendar_periods c
  where v_latest_end is null or c.start_date > v_latest_end
  order by c.start_date
  limit 1;

  if v_next_period_id is null then
    update public.scheduled_job_runs
      set status = 'failed',
          completed_at = clock_timestamp(),
          details = jsonb_build_object('error', 'No later rail-calendar period is available')
    where id = v_run_id;
    return jsonb_build_object('status', 'failed', 'error', 'No later rail-calendar period is available');
  end if;

  update public.reporting_weeks w
     set status = 'closed'
    from public.rail_calendar_periods old_period,
         public.rail_calendar_periods next_period
   where w.rail_period_id = old_period.id
     and next_period.id = v_next_period_id
     and old_period.end_date < next_period.start_date
     and w.status = 'open';

  insert into public.reporting_weeks (rail_period_id, status, opened_at, created_by, creation_method)
  values (v_next_period_id, 'open', clock_timestamp(), null, 'scheduled')
  on conflict (rail_period_id) do nothing
  returning id into v_new_week_id;

  if v_new_week_id is null then
    select w.id into v_existing_week_id
    from public.reporting_weeks w
    where w.rail_period_id = v_next_period_id;
  end if;

  update public.scheduled_job_runs
     set status = 'success',
         completed_at = clock_timestamp(),
         details = jsonb_build_object(
           'reporting_week_id', coalesce(v_new_week_id, v_existing_week_id),
           'created', v_new_week_id is not null,
           'rail_period_id', v_next_period_id
         )
   where id = v_run_id;

  return jsonb_build_object(
    'status', 'success',
    'created', v_new_week_id is not null,
    'reporting_week_id', coalesce(v_new_week_id, v_existing_week_id),
    'rail_period_id', v_next_period_id
  );
exception when others then
  if v_run_id is not null then
    update public.scheduled_job_runs
       set status = 'failed',
           completed_at = clock_timestamp(),
           details = jsonb_build_object('error', left(sqlerrm, 500))
     where id = v_run_id;
  end if;
  return jsonb_build_object('status', 'failed', 'error', left(sqlerrm, 500));
end;
$function$;

revoke all on function public.vh_generate_next_reporting_week(boolean) from public, anon, authenticated;

do $block$
declare
  v_job_id bigint;
begin
  for v_job_id in
    select jobid from cron.job where jobname = 'rssi-weekly-reporting-week'
  loop
    perform cron.unschedule(v_job_id);
  end loop;
end;
$block$;

select cron.schedule(
  'rssi-weekly-reporting-week',
  '0 11,12 * * 1',
  'select public.vh_generate_next_reporting_week(false);'
);
