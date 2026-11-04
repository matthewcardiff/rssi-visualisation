-- STAGE 26C20 CANDIDATE ONLY. NOT APPLIED. Requires reviewed finance RLS and transaction tests.
-- SECURITY INVOKER: relies on appropriately scoped SELECT and UPDATE policies.
-- Do NOT deploy with unrestricted finance UPDATE policies; these permit bypassing this RPC.
CREATE OR REPLACE FUNCTION public.vh_finance_reconcile(p_import_id uuid,p_comment text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
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
 -- Existing schema has no dedicated reconciliation audit table. Do not store a fake approval event.
 -- DBA must add immutable reconciliation event persistence before release.
 RETURN jsonb_build_object('import_id',p_import_id,'reconciled_metrics',v_rows,'reconciled',true);
END $$;
REVOKE ALL ON FUNCTION public.vh_finance_reconcile(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.vh_finance_reconcile(uuid,text) TO authenticated;
