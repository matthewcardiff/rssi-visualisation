-- Stage 26C21 SECURITY REVIEW CANDIDATE - NOT APPLIED.
-- Run ONLY in a dedicated staging change window after DBA review and backup.
-- The RPCs below are SECURITY DEFINER because direct table writes must remain denied.
-- Their caller role checks are mandatory; never expose service credentials to clients.
BEGIN;
CREATE TABLE IF NOT EXISTS public.finance_reconciliation_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 finance_import_id uuid NOT NULL REFERENCES public.finance_imports(id),
 reconciled_by uuid NOT NULL REFERENCES public.profiles(id),
 reconciled_at timestamptz NOT NULL DEFAULT now(),
 rationale text NOT NULL CHECK (length(trim(rationale)) BETWEEN 8 AND 2000)
);
ALTER TABLE public.finance_reconciliation_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.finance_reconciliation_events FROM PUBLIC, anon, authenticated;
-- Read access is intentionally limited to finance operators by RLS.
CREATE POLICY vh_finance_reconciliation_read ON public.finance_reconciliation_events
 FOR SELECT TO authenticated USING (EXISTS (
 SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
 WHERE r.user_id=(SELECT auth.uid()) AND p.active=true AND r.role IN ('finance','administrator')));
GRANT SELECT ON public.finance_reconciliation_events TO authenticated;
-- No direct finance-table mutations for authenticated clients.
REVOKE INSERT, UPDATE, DELETE ON public.finance_imports FROM PUBLIC, anon, authenticated;
ALTER TABLE public.finance_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY vh_finance_read_26c21 ON public.finance_imports FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
 WHERE r.user_id=(SELECT auth.uid()) AND p.active=true AND r.role IN ('finance','administrator')));
GRANT SELECT ON public.finance_imports TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.finance_metric_values FROM PUBLIC, anon, authenticated;
ALTER TABLE public.finance_metric_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY vh_finance_read_26c21 ON public.finance_metric_values FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
 WHERE r.user_id=(SELECT auth.uid()) AND p.active=true AND r.role IN ('finance','administrator')));
GRANT SELECT ON public.finance_metric_values TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.finance_publications FROM PUBLIC, anon, authenticated;
ALTER TABLE public.finance_publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY vh_finance_read_26c21 ON public.finance_publications FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
 WHERE r.user_id=(SELECT auth.uid()) AND p.active=true AND r.role IN ('finance','administrator')));
GRANT SELECT ON public.finance_publications TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.finance_publication_values FROM PUBLIC, anon, authenticated;
ALTER TABLE public.finance_publication_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY vh_finance_read_26c21 ON public.finance_publication_values FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
 WHERE r.user_id=(SELECT auth.uid()) AND p.active=true AND r.role IN ('finance','administrator')));
GRANT SELECT ON public.finance_publication_values TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.finance_approval_events FROM PUBLIC, anon, authenticated;
ALTER TABLE public.finance_approval_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY vh_finance_read_26c21 ON public.finance_approval_events FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
 WHERE r.user_id=(SELECT auth.uid()) AND p.active=true AND r.role IN ('finance','administrator')));
GRANT SELECT ON public.finance_approval_events TO authenticated;
CREATE OR REPLACE FUNCTION public.vh_finance_stage_import(
 p_file_name text, p_file_sha256 text, p_reporting_week_id uuid, p_metrics jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
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
REVOKE ALL ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vh_finance_stage_import(text,text,uuid,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.vh_finance_reconcile(p_import_id uuid,p_comment text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
 v_user uuid := auth.uid(); v_imp public.finance_imports%ROWTYPE;
 v_expected uuid; v_rows integer; v_groups integer;
BEGIN
 IF v_user IS NULL OR NOT EXISTS (
  SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
  WHERE r.user_id=v_user AND p.active=true AND r.role IN ('finance','administrator')
 ) THEN RAISE EXCEPTION 'Not authorised' USING ERRCODE='42501'; END IF;
 IF p_comment IS NULL OR length(trim(p_comment)) NOT BETWEEN 8 AND 2000
 THEN RAISE EXCEPTION 'A reconciliation rationale is required'; END IF;
 SELECT * INTO v_imp FROM public.finance_imports WHERE id=p_import_id FOR UPDATE;
 IF NOT FOUND OR v_imp.reconciliation_status IS DISTINCT FROM 'pending'
 THEN RAISE EXCEPTION 'Import not available for reconciliation'; END IF;
 IF jsonb_typeof(v_imp.findings) IS DISTINCT FROM 'array' OR jsonb_array_length(v_imp.findings)<>0
 THEN RAISE EXCEPTION 'Outstanding import findings'; END IF;
 IF EXISTS (SELECT 1 FROM public.finance_publications WHERE source_import_id=p_import_id)
 THEN RAISE EXCEPTION 'Already used for publication'; END IF;
 SELECT src.id INTO v_expected FROM public.reporting_weeks rw
 JOIN public.rail_calendar_periods cur ON cur.id=rw.rail_period_id
 JOIN public.rail_calendar_periods src ON src.start_date=(
  SELECT start_date FROM public.rail_calendar_periods WHERE start_date<cur.start_date
  ORDER BY start_date DESC OFFSET 1 LIMIT 1)
 WHERE rw.id=v_imp.reporting_week_id;
 IF v_expected IS NULL THEN RAISE EXCEPTION 'Finance source period unavailable'; END IF;
 SELECT count(*),count(DISTINCT department_id) INTO v_rows,v_groups
 FROM public.finance_metric_values WHERE finance_import_id=p_import_id;
 IF v_rows=0 OR v_rows<>v_groups*4 THEN RAISE EXCEPTION 'Incomplete metric groups'; END IF;
 IF EXISTS (
  SELECT 1 FROM public.finance_metric_values m
  LEFT JOIN public.departments d ON d.id=m.department_id
  WHERE m.finance_import_id=p_import_id AND (
   d.id IS NULL OR m.reporting_week_id IS DISTINCT FROM v_imp.reporting_week_id
   OR m.source_period_id IS DISTINCT FROM v_expected
   OR m.mapping_status IS DISTINCT FROM 'pending'
   OR jsonb_typeof(m.issues) IS DISTINCT FROM 'array' OR jsonb_array_length(m.issues)<>0
   OR m.input_state NOT IN ('missing','zero','value')
   OR (m.input_state='missing' AND m.amount IS NOT NULL)
   OR (m.input_state='zero' AND m.amount IS DISTINCT FROM 0)
   OR (m.input_state='value' AND (m.amount IS NULL OR m.amount=0))
  )
 ) THEN RAISE EXCEPTION 'Metric validation failed'; END IF;
 IF EXISTS (
  SELECT 1 FROM public.finance_metric_values WHERE finance_import_id=p_import_id
  GROUP BY department_id HAVING count(*)<>4 OR count(DISTINCT metric_key)<>4
 ) THEN RAISE EXCEPTION 'Duplicate or missing metrics'; END IF;
 UPDATE public.finance_metric_values SET mapping_status='reconciled'
 WHERE finance_import_id=p_import_id AND mapping_status='pending';
 IF NOT FOUND THEN RAISE EXCEPTION 'No metrics reconciled'; END IF;
 UPDATE public.finance_imports SET reconciliation_status='reconciled'
 WHERE id=p_import_id AND reconciliation_status='pending';
 IF NOT FOUND THEN RAISE EXCEPTION 'Reconciliation conflict'; END IF;
 INSERT INTO public.finance_reconciliation_events(finance_import_id,reconciled_by,rationale)
 VALUES (p_import_id,v_user,trim(p_comment));
 RETURN jsonb_build_object('import_id',p_import_id,'reconciled_metrics',v_rows,'reconciled',true);
END $$;
REVOKE ALL ON FUNCTION public.vh_finance_reconcile(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vh_finance_reconcile(uuid,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.vh_finance_publish(p_import_id uuid, p_comment text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := auth.uid();
  v_imp public.finance_imports%ROWTYPE;
  v_rows integer;
  v_departments integer;
  v_expected uuid;
  v_pub_id uuid;
  v_dept uuid;
  v_version integer;
  v_count integer := 0;
BEGIN
  IF v_user IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
    WHERE r.user_id=v_user AND p.active=true AND r.role IN ('finance','administrator')
  ) THEN RAISE EXCEPTION 'Finance approval not authorised' USING ERRCODE='42501'; END IF;
  SELECT * INTO v_imp FROM public.finance_imports WHERE id=p_import_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Import unavailable'; END IF;
  IF EXISTS (SELECT 1 FROM public.finance_publications WHERE source_import_id=p_import_id AND status IN ('published','superseded')) THEN
    RAISE EXCEPTION 'Import already published'; END IF;
  IF v_imp.reconciliation_status <> 'reconciled' OR
     jsonb_typeof(v_imp.findings) <> 'array' OR jsonb_array_length(v_imp.findings) <> 0 THEN
     RAISE EXCEPTION 'Import not reconciled'; END IF;
  -- Source period is exactly two calendar periods before the management period.
  SELECT src.id INTO v_expected
  FROM public.reporting_weeks rw
  JOIN public.rail_calendar_periods current_period ON current_period.id=rw.rail_period_id
  JOIN public.rail_calendar_periods src ON src.start_date=(
    SELECT start_date FROM public.rail_calendar_periods
    WHERE start_date < current_period.start_date ORDER BY start_date DESC OFFSET 1 LIMIT 1)
  WHERE rw.id=v_imp.reporting_week_id;
  IF v_expected IS NULL THEN RAISE EXCEPTION 'Source period unavailable'; END IF;
  SELECT count(*),count(DISTINCT department_id) INTO v_rows,v_departments
  FROM public.finance_metric_values WHERE finance_import_id=p_import_id;
  IF v_rows=0 OR v_rows<>v_departments*4 THEN RAISE EXCEPTION 'Incomplete finance metrics'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.finance_metric_values m
    WHERE m.finance_import_id=p_import_id AND (
      m.reporting_week_id IS DISTINCT FROM v_imp.reporting_week_id OR
      m.source_period_id IS DISTINCT FROM v_expected OR
      m.mapping_status <> 'reconciled' OR
      m.issues IS NULL OR jsonb_typeof(m.issues)<>'array' OR jsonb_array_length(m.issues)<>0 OR
      m.input_state NOT IN ('missing','zero','value') OR
      (m.input_state='missing' AND m.amount IS NOT NULL) OR
      (m.input_state='zero' AND m.amount IS DISTINCT FROM 0) OR
      (m.input_state='value' AND (m.amount IS NULL OR m.amount=0))
    )
  ) THEN RAISE EXCEPTION 'Metric validation failed'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.finance_metric_values m WHERE m.finance_import_id=p_import_id
    GROUP BY m.department_id HAVING count(*)<>4 OR count(DISTINCT m.metric_key)<>4
  ) THEN RAISE EXCEPTION 'Duplicate or missing metric keys'; END IF;
  -- Serialize publication decisions per reporting week to prevent concurrent versions.
  PERFORM 1 FROM public.reporting_weeks WHERE id=v_imp.reporting_week_id FOR UPDATE;
  FOR v_dept IN SELECT DISTINCT department_id FROM public.finance_metric_values WHERE finance_import_id=p_import_id LOOP
    SELECT coalesce(max(publication_version),0)+1 INTO v_version
    FROM public.finance_publications WHERE department_id=v_dept AND reporting_week_id=v_imp.reporting_week_id;
    -- Supersede the old live row before inserting its replacement. Both writes
    -- occur in this function's single PostgreSQL transaction; failures roll back.
    UPDATE public.finance_publications SET status='superseded'
      WHERE department_id=v_dept AND reporting_week_id=v_imp.reporting_week_id
        AND status='published';
    INSERT INTO public.finance_publications
      (department_id,reporting_week_id,publication_version,approved_by,published_at,status,source_import_id)
    VALUES (v_dept,v_imp.reporting_week_id,v_version,v_user,now(),'published',p_import_id)
    RETURNING id INTO v_pub_id;
    INSERT INTO public.finance_publication_values(publication_id,metric_key,amount,source_period_id,input_state)
      SELECT v_pub_id,metric_key,amount,source_period_id,input_state
      FROM public.finance_metric_values WHERE finance_import_id=p_import_id AND department_id=v_dept;
    IF (SELECT count(*) FROM public.finance_publication_values WHERE publication_id=v_pub_id)<>4 THEN
      RAISE EXCEPTION 'Publication incomplete'; END IF;
    INSERT INTO public.finance_approval_events(publication_id,decision,decided_by,comments)
      VALUES(v_pub_id,'approved',v_user,left(coalesce(p_comment,''),2000));
    v_count:=v_count+1;
  END LOOP;
  RETURN jsonb_build_object('published_departments',v_count,'import_id',p_import_id);
END $$;
REVOKE ALL ON FUNCTION public.vh_finance_publish(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.vh_finance_publish(uuid,text) TO authenticated;
-- A dedicated unique index prevents duplicate publication versions even under races.
CREATE UNIQUE INDEX IF NOT EXISTS vh_finance_pub_unique_version_26c21
 ON public.finance_publications(department_id,reporting_week_id,publication_version);
-- One published version per department/week, enforced by the database.
CREATE UNIQUE INDEX IF NOT EXISTS vh_finance_pub_one_live_26c21
 ON public.finance_publications(department_id,reporting_week_id) WHERE status='published';
-- Stage 26C22: supersede-before-insert resolves the live-publication unique-index
-- conflict. Still a review candidate: no live authenticated database tests.
ROLLBACK; -- REVIEW ONLY. Intentionally no schema changes when pasted as-is.
