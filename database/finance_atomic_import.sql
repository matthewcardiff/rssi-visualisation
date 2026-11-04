-- Stage 26C15 candidate; NOT APPLIED. Deploy only after RLS and role acceptance.
-- SECURITY INVOKER: table RLS must permit finance users to insert imports and metrics.
CREATE OR REPLACE FUNCTION public.vh_finance_stage_import(
 p_file_name text, p_file_sha256 text, p_reporting_week_id uuid, p_metrics jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
 v_user uuid := auth.uid(); v_import uuid; v_expected uuid; v_count integer;
BEGIN
 IF v_user IS NULL OR NOT EXISTS (
  SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
  WHERE r.user_id=v_user AND p.active=true AND r.role IN ('finance','administrator')
 ) THEN RAISE EXCEPTION 'Finance import not authorised' USING ERRCODE='42501'; END IF;
 IF p_file_name IS NULL OR length(p_file_name)>120 OR p_file_name !~* '^[a-z0-9_.() -]+\.csv$'
    OR p_file_sha256 !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Invalid file metadata'; END IF;
 IF jsonb_typeof(p_metrics) IS DISTINCT FROM 'array' OR jsonb_array_length(p_metrics) NOT BETWEEN 4 AND 300
 THEN RAISE EXCEPTION 'Invalid metric payload'; END IF;
 SELECT src.id INTO v_expected FROM public.reporting_weeks rw
 JOIN public.rail_calendar_periods cur ON cur.id=rw.rail_period_id
 JOIN public.rail_calendar_periods src ON src.start_date=(
  SELECT start_date FROM public.rail_calendar_periods
  WHERE start_date<cur.start_date ORDER BY start_date DESC OFFSET 1 LIMIT 1)
 WHERE rw.id=p_reporting_week_id;
 IF v_expected IS NULL THEN RAISE EXCEPTION 'Finance source period unavailable'; END IF;
 -- Serialize duplicate checks and imports for this reporting week.
 PERFORM 1 FROM public.reporting_weeks WHERE id=p_reporting_week_id FOR UPDATE;
 IF EXISTS (SELECT 1 FROM public.finance_imports WHERE file_sha256=p_file_sha256)
 THEN RAISE EXCEPTION 'Dataset already imported' USING ERRCODE='23505'; END IF;
 WITH metrics AS (
  SELECT * FROM jsonb_to_recordset(p_metrics) AS m(
   department_id uuid, reporting_week_id uuid, source_period_id uuid,
   metric_key text, input_state text, amount numeric)
 )
 SELECT count(*) INTO v_count FROM metrics;
 IF v_count<>jsonb_array_length(p_metrics) THEN RAISE EXCEPTION 'Malformed metric rows'; END IF;
 IF EXISTS (
  SELECT 1 FROM jsonb_to_recordset(p_metrics) AS m(
   department_id uuid, reporting_week_id uuid, source_period_id uuid,
   metric_key text, input_state text, amount numeric)
  WHERE m.department_id IS NULL OR m.reporting_week_id IS DISTINCT FROM p_reporting_week_id
    OR m.source_period_id IS DISTINCT FROM v_expected
    OR m.metric_key IS NULL OR m.metric_key NOT IN ('weekly_budget','weekly_revenue','ytd_budget','ytd_revenue')
    OR m.input_state IS NULL OR m.input_state NOT IN ('missing','zero','value')
    OR (m.input_state='missing' AND m.amount IS NOT NULL)
    OR (m.input_state='zero' AND m.amount IS DISTINCT FROM 0)
    OR (m.input_state='value' AND (m.amount IS NULL OR m.amount=0))
 ) THEN RAISE EXCEPTION 'Invalid metric values or finance source period'; END IF;
 IF EXISTS (
  SELECT 1 FROM jsonb_to_recordset(p_metrics) AS m(department_id uuid,metric_key text)
  GROUP BY department_id HAVING count(*)<>4 OR count(DISTINCT metric_key)<>4
 ) THEN RAISE EXCEPTION 'Each department requires four distinct metrics'; END IF;
 IF EXISTS (
  SELECT 1 FROM jsonb_to_recordset(p_metrics) AS m(department_id uuid)
  LEFT JOIN public.departments d ON d.id=m.department_id WHERE d.id IS NULL
 ) THEN RAISE EXCEPTION 'Unknown department'; END IF;
 INSERT INTO public.finance_imports
  (file_name,file_sha256,reporting_week_id,uploaded_by,reconciliation_status,findings)
 VALUES (p_file_name,p_file_sha256,p_reporting_week_id,v_user,'pending','[]'::jsonb)
 RETURNING id INTO v_import;
 INSERT INTO public.finance_metric_values
  (finance_import_id,department_id,reporting_week_id,metric_key,amount,source_period_id,input_state,mapping_status,issues)
 SELECT v_import,m.department_id,p_reporting_week_id,m.metric_key,m.amount,v_expected,m.input_state,'pending','[]'::jsonb
 FROM jsonb_to_recordset(p_metrics) AS m(
  department_id uuid,metric_key text,input_state text,amount numeric);
 IF (SELECT count(*) FROM public.finance_metric_values WHERE finance_import_id=v_import)<>v_count
 THEN RAISE EXCEPTION 'Incomplete insert'; END IF;
 RETURN jsonb_build_object('import_id',v_import,'imported_rows',v_count,'reconciliation_status','pending','published',false,'committed',true);
END $$;
REVOKE ALL ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb) TO authenticated;
