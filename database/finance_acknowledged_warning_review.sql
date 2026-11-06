-- Staging-only finance workflow update.
-- Acknowledged missing source values remain visible as warnings and Not reported.
-- Finance review still requires a separate rationale; publication remains separate.
BEGIN;

ALTER TABLE public.finance_imports
  ADD COLUMN IF NOT EXISTS findings_acknowledged_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS findings_acknowledged_at timestamptz;

ALTER TABLE public.finance_reconciliation_events
  ADD COLUMN IF NOT EXISTS accepted_findings jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.vh_finance_stage_import(
  p_file_name text,
  p_file_sha256 text,
  p_reporting_week_id uuid,
  p_metrics jsonb,
  p_findings jsonb,
  p_findings_acknowledged boolean
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := auth.uid();
  v_source uuid;
  v_import uuid;
  v_count integer;
  v_org uuid;
  v_findings jsonb;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
    WHERE r.user_id=v_user AND p.active AND r.role IN ('finance','administrator')
  ) THEN RAISE EXCEPTION 'Not authorised' USING ERRCODE='42501'; END IF;

  IF p_file_name IS NULL OR length(p_file_name)>120
     OR p_file_name !~* '^[a-z0-9_.() -]+[.](csv|xlsx)$'
     OR p_file_sha256 !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid file metadata'; END IF;
  IF jsonb_typeof(p_metrics) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_metrics) NOT BETWEEN 4 AND 300 THEN RAISE EXCEPTION 'Invalid metrics'; END IF;
  IF jsonb_typeof(p_findings) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_findings)>100 THEN RAISE EXCEPTION 'Invalid workbook findings'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_findings) AS f(value)
    WHERE jsonb_typeof(f.value) IS DISTINCT FROM 'string'
       OR length(btrim(f.value #>> '{}')) NOT BETWEEN 1 AND 1000
  ) THEN RAISE EXCEPTION 'Invalid workbook finding'; END IF;
  IF jsonb_array_length(p_findings)>0 AND p_findings_acknowledged IS DISTINCT FROM true
  THEN RAISE EXCEPTION 'Workbook findings must be acknowledged before staging'; END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(btrim(f.value))), '[]'::jsonb)
  INTO v_findings FROM jsonb_array_elements_text(p_findings) AS f(value);

  SELECT src.id INTO v_source
  FROM public.reporting_weeks rw
  JOIN public.rail_calendar_periods cur ON cur.id=rw.rail_period_id
  JOIN public.rail_calendar_periods src ON src.start_date=(
    SELECT start_date FROM public.rail_calendar_periods WHERE start_date<cur.start_date
    ORDER BY start_date DESC OFFSET 1 LIMIT 1
  ) WHERE rw.id=p_reporting_week_id;
  IF v_source IS NULL THEN RAISE EXCEPTION 'Source period unavailable'; END IF;

  PERFORM 1 FROM public.reporting_weeks WHERE id=p_reporting_week_id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM public.finance_imports WHERE file_sha256=p_file_sha256)
  THEN RAISE EXCEPTION 'Duplicate import' USING ERRCODE='23505'; END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_metrics) AS m(
      department_id uuid,reporting_week_id uuid,source_period_id uuid,
      metric_key text,input_state text,amount numeric
    )
    LEFT JOIN public.departments d ON d.id=m.department_id
    WHERE d.id IS NULL OR d.active IS DISTINCT FROM true
       OR NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=v_user
         AND r.organisation_id=d.organisation_id AND r.role IN ('finance','administrator'))
       OR m.reporting_week_id IS DISTINCT FROM p_reporting_week_id
       OR m.source_period_id IS DISTINCT FROM v_source
       OR m.metric_key IS NULL OR m.metric_key NOT IN ('weekly_budget','weekly_revenue','ytd_budget','ytd_revenue')
       OR m.input_state IS NULL OR m.input_state NOT IN ('missing','zero','value')
       OR (m.input_state='missing' AND m.amount IS NOT NULL)
       OR (m.input_state='zero' AND m.amount IS DISTINCT FROM 0)
       OR (m.input_state='value' AND (m.amount IS NULL OR m.amount=0))
  ) THEN RAISE EXCEPTION 'Invalid or unauthorised metric' USING ERRCODE='42501'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_metrics) AS m(department_id uuid,metric_key text)
    GROUP BY department_id HAVING count(*)<>4 OR count(DISTINCT metric_key)<>4
  ) THEN RAISE EXCEPTION 'Incomplete department metrics'; END IF;

  SELECT (array_agg(DISTINCT d.organisation_id))[1] INTO v_org
  FROM jsonb_to_recordset(p_metrics) AS m(department_id uuid)
  JOIN public.departments d ON d.id=m.department_id
  HAVING count(DISTINCT d.organisation_id)=1;
  IF v_org IS NULL THEN RAISE EXCEPTION 'One organisation per import is required' USING ERRCODE='42501'; END IF;

  INSERT INTO public.finance_imports(
    organisation_id,file_name,file_sha256,reporting_week_id,uploaded_by,
    reconciliation_status,findings,findings_acknowledged_by,findings_acknowledged_at
  ) VALUES (
    v_org,p_file_name,p_file_sha256,p_reporting_week_id,v_user,'pending',v_findings,
    CASE WHEN jsonb_array_length(v_findings)>0 THEN v_user ELSE NULL END,
    CASE WHEN jsonb_array_length(v_findings)>0 THEN now() ELSE NULL END
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
  SELECT count(*) INTO v_count FROM public.finance_metric_values WHERE finance_import_id=v_import;
  IF v_count<>jsonb_array_length(p_metrics) THEN RAISE EXCEPTION 'Incomplete insert'; END IF;
  RETURN jsonb_build_object('import_id',v_import,'imported_rows',v_count,
    'finding_count',jsonb_array_length(v_findings),'reconciliation_status','pending','published',false);
END $$;

REVOKE ALL ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb,jsonb,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb,jsonb,boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.vh_finance_reconcile(p_import_id uuid,p_comment text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid:=auth.uid();
  v_imp public.finance_imports%ROWTYPE;
  v_expected uuid;
  v_rows integer;
  v_groups integer;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
    WHERE r.user_id=v_user AND p.active AND r.role IN ('finance','administrator')
  ) THEN RAISE EXCEPTION 'Not authorised' USING ERRCODE='42501'; END IF;
  IF p_comment IS NULL OR length(trim(p_comment)) NOT BETWEEN 8 AND 2000
  THEN RAISE EXCEPTION 'Reconciliation rationale required'; END IF;
  SELECT * INTO v_imp FROM public.finance_imports WHERE id=p_import_id FOR UPDATE;
  IF NOT FOUND OR v_imp.reconciliation_status IS DISTINCT FROM 'pending'
  THEN RAISE EXCEPTION 'Import not pending'; END IF;
  IF jsonb_typeof(v_imp.findings) IS DISTINCT FROM 'array'
  THEN RAISE EXCEPTION 'Import findings could not be verified'; END IF;
  IF jsonb_array_length(v_imp.findings)>0 AND (
    v_imp.findings_acknowledged_by IS NULL OR v_imp.findings_acknowledged_at IS NULL OR
    EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(v_imp.findings) AS f(value)
      WHERE NOT EXISTS (
        SELECT 1 FROM public.finance_metric_values m
        JOIN public.departments d ON d.id=m.department_id
        WHERE m.finance_import_id=p_import_id AND m.input_state='missing'
          AND ((f.value=d.display_name||': Weekly revenue missing or unverified' AND m.metric_key='weekly_revenue')
            OR (f.value=d.display_name||': YTD revenue incomplete/unverified' AND m.metric_key='ytd_revenue'))
      )
    )
  ) THEN RAISE EXCEPTION 'Unacknowledged or unsupported workbook findings'; END IF;
  IF EXISTS(SELECT 1 FROM public.finance_publications WHERE source_import_id=p_import_id)
  THEN RAISE EXCEPTION 'Import already published'; END IF;

  SELECT src.id INTO v_expected FROM public.reporting_weeks rw
  JOIN public.rail_calendar_periods cur ON cur.id=rw.rail_period_id
  JOIN public.rail_calendar_periods src ON src.start_date=(
    SELECT start_date FROM public.rail_calendar_periods WHERE start_date<cur.start_date
    ORDER BY start_date DESC OFFSET 1 LIMIT 1
  ) WHERE rw.id=v_imp.reporting_week_id;
  IF v_expected IS NULL THEN RAISE EXCEPTION 'Two-week source period unavailable'; END IF;

  SELECT count(*),count(DISTINCT department_id) INTO v_rows,v_groups
  FROM public.finance_metric_values WHERE finance_import_id=p_import_id;
  IF v_rows=0 OR v_rows<>v_groups*4 THEN RAISE EXCEPTION 'Incomplete metric groups'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.finance_metric_values m LEFT JOIN public.departments d ON d.id=m.department_id
    WHERE m.finance_import_id=p_import_id AND (d.id IS NULL OR NOT EXISTS(
      SELECT 1 FROM public.user_roles r WHERE r.user_id=v_user AND r.organisation_id=d.organisation_id
        AND r.role IN ('finance','administrator')))
  ) THEN RAISE EXCEPTION 'Organisation access denied' USING ERRCODE='42501'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.finance_metric_values m WHERE m.finance_import_id=p_import_id AND (
      m.reporting_week_id IS DISTINCT FROM v_imp.reporting_week_id OR m.source_period_id IS DISTINCT FROM v_expected
      OR m.mapping_status IS DISTINCT FROM 'pending' OR jsonb_typeof(m.issues) IS DISTINCT FROM 'array'
      OR jsonb_array_length(m.issues)<>0 OR m.input_state NOT IN ('missing','zero','value')
      OR (m.input_state='missing' AND m.amount IS NOT NULL)
      OR (m.input_state='zero' AND m.amount IS DISTINCT FROM 0)
      OR (m.input_state='value' AND (m.amount IS NULL OR m.amount=0))
    )
  ) THEN RAISE EXCEPTION 'Metric validation failed'; END IF;
  IF EXISTS (SELECT 1 FROM public.finance_metric_values WHERE finance_import_id=p_import_id
    GROUP BY department_id HAVING count(*)<>4 OR count(DISTINCT metric_key)<>4)
  THEN RAISE EXCEPTION 'Duplicate or missing metrics'; END IF;

  INSERT INTO public.finance_reconciliation_events(finance_import_id,reconciled_by,rationale,accepted_findings)
  VALUES(p_import_id,v_user,trim(p_comment),v_imp.findings);
  UPDATE public.finance_metric_values SET mapping_status='reconciled'
  WHERE finance_import_id=p_import_id AND mapping_status='pending';
  UPDATE public.finance_imports SET reconciliation_status='reconciled',findings='[]'::jsonb
  WHERE id=p_import_id AND reconciliation_status='pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Reconciliation conflict'; END IF;
  RETURN jsonb_build_object('import_id',p_import_id,'reconciled_metrics',v_rows,'reconciled',true,
    'accepted_findings',v_imp.findings);
END $$;
REVOKE ALL ON FUNCTION public.vh_finance_reconcile(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.vh_finance_reconcile(uuid,text) TO authenticated;

-- This import's Apply operation was gated by the UI checkbox, which the API required
-- before the import transaction. Backfill that verified acknowledgement for this row only.
UPDATE public.finance_imports
SET findings_acknowledged_by=uploaded_by,findings_acknowledged_at=imported_at
WHERE id='f969abf0-d51a-4ff6-b73c-cdcf78355165'
  AND reconciliation_status='pending'
  AND findings='["HS2: Weekly revenue missing or unverified","HS2: YTD revenue incomplete/unverified"]'::jsonb
  AND findings_acknowledged_by IS NULL;

COMMIT;
