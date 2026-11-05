-- Replace the existing XLSX staging RPC so reviewed workbook findings are
-- persisted atomically with the import. This migration does not reconcile or
-- publish finance data.
DROP FUNCTION IF EXISTS public.vh_finance_stage_import(text,text,uuid,jsonb);

CREATE FUNCTION public.vh_finance_stage_import(
  p_file_name text,
  p_file_sha256 text,
  p_reporting_week_id uuid,
  p_metrics jsonb,
  p_findings jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_source uuid;
  v_import uuid;
  v_count integer;
  v_org uuid;
  v_findings jsonb;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.user_roles r
    JOIN public.profiles p ON p.id=r.user_id
    WHERE r.user_id=v_user
      AND p.active
      AND r.role IN ('finance','administrator')
  ) THEN
    RAISE EXCEPTION 'Not authorised' USING ERRCODE='42501';
  END IF;

  IF p_file_name IS NULL
     OR length(p_file_name)>120
     OR p_file_name !~* '^[a-z0-9_.() -]+[.](csv|xlsx)$'
     OR p_file_sha256 !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid file metadata';
  END IF;
  IF jsonb_typeof(p_metrics) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_metrics) NOT BETWEEN 4 AND 300 THEN
    RAISE EXCEPTION 'Invalid metrics';
  END IF;
  IF jsonb_typeof(p_findings) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Workbook findings must be a JSON array';
  END IF;
  IF jsonb_array_length(p_findings)>100 THEN
    RAISE EXCEPTION 'Too many workbook findings';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_findings) AS f(value)
    WHERE jsonb_typeof(f.value) IS DISTINCT FROM 'string'
       OR length(btrim(f.value #>> '{}')) NOT BETWEEN 1 AND 1000
  ) THEN
    RAISE EXCEPTION 'Invalid workbook finding';
  END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(btrim(f.value))), '[]'::jsonb)
  INTO v_findings
  FROM jsonb_array_elements_text(p_findings) AS f(value);

  SELECT src.id INTO v_source
  FROM public.reporting_weeks rw
  JOIN public.rail_calendar_periods cur ON cur.id=rw.rail_period_id
  JOIN public.rail_calendar_periods src ON src.start_date=(
    SELECT start_date
    FROM public.rail_calendar_periods
    WHERE start_date<cur.start_date
    ORDER BY start_date DESC
    OFFSET 1 LIMIT 1
  )
  WHERE rw.id=p_reporting_week_id;
  IF v_source IS NULL THEN RAISE EXCEPTION 'Source period unavailable'; END IF;

  PERFORM 1 FROM public.reporting_weeks WHERE id=p_reporting_week_id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM public.finance_imports WHERE file_sha256=p_file_sha256) THEN
    RAISE EXCEPTION 'Duplicate import' USING ERRCODE='23505';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_metrics) AS m(
      department_id uuid, reporting_week_id uuid, source_period_id uuid,
      metric_key text, input_state text, amount numeric
    )
    LEFT JOIN public.departments d ON d.id=m.department_id
    WHERE d.id IS NULL
       OR d.active IS DISTINCT FROM true
       OR NOT EXISTS (
         SELECT 1 FROM public.user_roles r
         WHERE r.user_id=v_user AND r.organisation_id=d.organisation_id
           AND r.role IN ('finance','administrator')
       )
       OR m.reporting_week_id IS DISTINCT FROM p_reporting_week_id
       OR m.source_period_id IS DISTINCT FROM v_source
       OR m.metric_key NOT IN ('weekly_budget','weekly_revenue','ytd_budget','ytd_revenue')
       OR m.metric_key IS NULL
       OR m.input_state NOT IN ('missing','zero','value')
       OR m.input_state IS NULL
       OR (m.input_state='missing' AND m.amount IS NOT NULL)
       OR (m.input_state='zero' AND m.amount IS DISTINCT FROM 0)
       OR (m.input_state='value' AND (m.amount IS NULL OR m.amount=0))
  ) THEN
    RAISE EXCEPTION 'Invalid or unauthorised metric' USING ERRCODE='42501';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_metrics) AS m(department_id uuid,metric_key text)
    GROUP BY department_id
    HAVING count(*)<>4 OR count(DISTINCT metric_key)<>4
  ) THEN
    RAISE EXCEPTION 'Incomplete department metrics';
  END IF;

  SELECT (array_agg(DISTINCT d.organisation_id))[1] INTO v_org
  FROM jsonb_to_recordset(p_metrics) AS m(department_id uuid)
  JOIN public.departments d ON d.id=m.department_id
  HAVING count(DISTINCT d.organisation_id)=1;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'One organisation per import is required' USING ERRCODE='42501';
  END IF;

  INSERT INTO public.finance_imports(
    organisation_id,file_name,file_sha256,reporting_week_id,uploaded_by,
    reconciliation_status,findings
  ) VALUES (
    v_org,p_file_name,p_file_sha256,p_reporting_week_id,v_user,'pending',v_findings
  ) RETURNING id INTO v_import;

  INSERT INTO public.finance_metric_values(
    finance_import_id,department_id,reporting_week_id,metric_key,amount,
    source_period_id,input_state,mapping_status,issues
  )
  SELECT v_import,m.department_id,p_reporting_week_id,m.metric_key,m.amount,
         v_source,m.input_state,'pending','[]'::jsonb
  FROM jsonb_to_recordset(p_metrics) AS m(
    department_id uuid,metric_key text,input_state text,amount numeric
  );

  SELECT count(*) INTO v_count
  FROM public.finance_metric_values WHERE finance_import_id=v_import;
  IF v_count<>jsonb_array_length(p_metrics) THEN RAISE EXCEPTION 'Incomplete insert'; END IF;

  RETURN jsonb_build_object(
    'import_id',v_import,
    'imported_rows',v_count,
    'finding_count',jsonb_array_length(v_findings),
    'reconciliation_status','pending',
    'published',false
  );
END
$function$;

REVOKE ALL ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb,jsonb) TO authenticated;
