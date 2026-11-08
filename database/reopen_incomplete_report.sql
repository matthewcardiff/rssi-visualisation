-- Permit an authenticated administrator/host/executive to reopen a report only when
-- required sections are still incomplete. RLS and the trigger both enforce this path.
CREATE POLICY vh_reopen_incomplete_report
ON public.department_reports
FOR UPDATE
TO authenticated
USING (
  status = 'submitted'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.active = true
  )
  AND EXISTS (
    SELECT 1
    FROM public.user_roles r
    JOIN public.departments d ON d.organisation_id = r.organisation_id
    WHERE r.user_id = (SELECT auth.uid())
      AND r.role IN ('meeting_host','administrator','executive')
      AND d.id = department_reports.department_id
  )
)
WITH CHECK (
  status = 'reopened'
  AND submitted_by IS NULL
  AND submitted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.active = true
  )
  AND EXISTS (
    SELECT 1
    FROM public.user_roles r
    JOIN public.departments d ON d.organisation_id = r.organisation_id
    WHERE r.user_id = (SELECT auth.uid())
      AND r.role IN ('meeting_host','administrator','executive')
      AND d.id = department_reports.department_id
  )
);

CREATE OR REPLACE FUNCTION vh_internal.guard_department_report_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_department_code text;
  v_required text[];
  v_key text;
  v_content jsonb;
  v_complete boolean;
begin
  if new.id is distinct from old.id
     or new.department_id is distinct from old.department_id
     or new.reporting_week_id is distinct from old.reporting_week_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Report identity fields are immutable';
  end if;

  if old.status = 'submitted' and new.status = 'reopened' then
    if new.submitted_by is not null or new.submitted_at is not null then
      raise exception 'Reopened reports cannot retain submission metadata';
    end if;
    if not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.active = true
    ) or not exists (
      select 1
      from public.user_roles r
      join public.departments d on d.organisation_id = r.organisation_id
      where r.user_id = auth.uid()
        and r.role in ('meeting_host','administrator','executive')
        and d.id = old.department_id
    ) then
      raise exception 'Only an active meeting host, administrator or executive may reopen a report';
    end if;

    select d.code into v_department_code
    from public.departments d where d.id = old.department_id;
    if v_department_code = 'hsqe' then
      v_required := array['hsqe_accidents','hsqe_close_calls','hsqe_assurance','hsqe_events','hsqe_documents'];
    else
      v_required := array['pipeline','delivery','programme','risks','resources'];
    end if;

    foreach v_key in array v_required loop
      select rs.content into v_content
      from public.report_sections rs
      where rs.report_id = old.id and rs.section_key = v_key;
      v_complete := false;
      if v_content is not null then
        if v_key = 'pipeline' then
          v_complete := nullif(btrim(coalesce(v_content->>'notes','')), '') is not null
            or exists (
              select 1 from jsonb_array_elements(coalesce(v_content->'entries','[]'::jsonb)) as e(value)
              where nullif(btrim(concat_ws(' ',e.value->>'title',e.value->>'update')),'') is not null
            )
            or exists (
              select 1 from public.pipeline_opportunities po
              where po.department_id = old.department_id and po.status <> 'removed'
            );
        elsif v_department_code = 'hsqe' then
          v_complete := exists (
            select 1 from jsonb_each_text(coalesce(v_content->'fields','{}'::jsonb)) as f(key,value)
            where nullif(btrim(f.value), '') is not null
          );
        else
          v_complete := nullif(btrim(coalesce(v_content->>'notes','')), '') is not null
            or exists (
              select 1 from jsonb_array_elements(coalesce(v_content->'entries','[]'::jsonb)) as e(value)
              where nullif(btrim(concat_ws(' ',e.value->>'title',e.value->>'update',e.value->>'owner',e.value->>'support',e.value->>'required_by')),'') is not null
            );
        end if;
      end if;
      if not coalesce(v_complete,false) then
        new.revision := old.revision + 1;
        new.updated_at := now();
        return new;
      end if;
    end loop;
    raise exception 'This report has all required sections complete and cannot be reopened as incomplete';
  end if;

  if old.status not in ('draft', 'reopened') then
    raise exception 'Submitted reports cannot be edited directly';
  end if;
  if new.status not in ('draft', 'submitted') then
    raise exception 'Unsupported report status transition';
  end if;
  if new.status = 'submitted' then
    if new.submitted_by is distinct from auth.uid() or new.submitted_at is null then
      raise exception 'Submission actor and timestamp required';
    end if;
    if not exists (
      select 1 from public.reporting_weeks w
      where w.id = new.reporting_week_id and w.status = 'open'
    ) then
      raise exception 'Reporting week is not open';
    end if;
  else
    if new.submitted_by is distinct from old.submitted_by
       or new.submitted_at is distinct from old.submitted_at then
      raise exception 'Submission metadata cannot be edited';
    end if;
  end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end
$function$;
