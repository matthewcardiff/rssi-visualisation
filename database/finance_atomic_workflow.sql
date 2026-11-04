-- Stage 26C14. STAGING ONLY. Review and apply under a controlled change window.
-- All writes execute within one PostgreSQL transaction. The invoker must be an
-- active authorised finance or administrator user; no service-role bypass.
CREATE OR REPLACE FUNCTION public.vh_finance_publish(p_import_id uuid, p_comment text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
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
    UPDATE public.finance_publications SET status='superseded'
      WHERE department_id=v_dept AND reporting_week_id=v_imp.reporting_week_id
        AND id<>v_pub_id AND status='published';
    v_count:=v_count+1;
  END LOOP;
  RETURN jsonb_build_object('published_departments',v_count,'import_id',p_import_id);
END $$;
REVOKE ALL ON FUNCTION public.vh_finance_publish(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vh_finance_publish(uuid,text) TO authenticated;
