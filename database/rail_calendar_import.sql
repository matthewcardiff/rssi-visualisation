-- Shared, authenticated replacement for the old browser-local calendar upload.
-- Imports are append-only: historical periods and periods already used by reports
-- are never edited. The RPC validates the complete calendar before transaction commit.
CREATE OR REPLACE FUNCTION public.vh_import_rail_calendar(p_periods jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_item jsonb;
  v_week integer;
  v_year integer;
  v_start date;
  v_end date;
  v_last_start date;
  v_last_end date;
  v_last_week integer;
  v_last_year integer;
  v_existing public.rail_calendar_periods%ROWTYPE;
  v_inserted integer := 0;
  v_count integer := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.user_roles r
    JOIN public.profiles p ON p.id = r.user_id
    WHERE r.user_id = auth.uid()
      AND p.active = true
      AND r.role IN ('meeting_host', 'administrator')
  ) THEN
    RAISE EXCEPTION 'Only an active meeting host or administrator may update the rail calendar';
  END IF;

  IF coalesce(jsonb_typeof(p_periods), '') <> 'array'
     OR jsonb_array_length(p_periods) < 1
     OR jsonb_array_length(p_periods) > 300 THEN
    RAISE EXCEPTION 'Provide between 1 and 300 calendar periods';
  END IF;

  -- Serialize calendar updates so two hosts cannot append competing periods.
  PERFORM pg_advisory_xact_lock(hashtext('vh_import_rail_calendar'));

  SELECT rail_year, rail_week, start_date, end_date
    INTO v_last_year, v_last_week, v_last_start, v_last_end
  FROM public.rail_calendar_periods
  ORDER BY start_date DESC
  LIMIT 1;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_periods) LOOP
    v_count := v_count + 1;
    IF coalesce(jsonb_typeof(v_item), '') <> 'object'
       OR coalesce(v_item->>'week_number', '') !~ '^[0-9]{1,2}$'
       OR coalesce(v_item->>'start_date', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       OR coalesce(v_item->>'end_date', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
      RAISE EXCEPTION 'Calendar row % has invalid fields', v_count;
    END IF;

    v_week := (v_item->>'week_number')::integer;
    v_start := (v_item->>'start_date')::date;
    v_end := (v_item->>'end_date')::date;
    IF v_week < 1 OR v_week > 53
       OR extract(isodow FROM v_start) <> 6
       OR v_end <> v_start + 6 THEN
      RAISE EXCEPTION 'Calendar row % must be week 1–53 and run Saturday to Friday', v_count;
    END IF;

    SELECT * INTO v_existing
    FROM public.rail_calendar_periods
    WHERE start_date = v_start;
    IF FOUND THEN
      IF v_existing.rail_week <> v_week OR v_existing.end_date <> v_end THEN
        RAISE EXCEPTION 'Calendar row % conflicts with an existing period; existing periods are preserved', v_count;
      END IF;
      CONTINUE;
    END IF;

    IF v_last_start IS NOT NULL THEN
      IF v_start <= v_last_start OR v_start <> v_last_end + 1 THEN
        RAISE EXCEPTION 'Calendar row % must extend the current calendar without changing history or leaving a gap', v_count;
      END IF;
      IF (v_last_week < 52 AND v_week <> v_last_week + 1)
         OR (v_last_week = 52 AND v_week NOT IN (1, 53))
         OR (v_last_week = 53 AND v_week <> 1) THEN
        RAISE EXCEPTION 'Calendar row % has an unexpected NRW week number', v_count;
      END IF;
      v_year := v_last_year + CASE WHEN v_week = 1 THEN 1 ELSE 0 END;
    ELSE
      v_year := extract(year FROM v_start)::integer;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.rail_calendar_periods
      WHERE rail_year = v_year AND rail_week = v_week
    ) THEN
      RAISE EXCEPTION 'Calendar row % duplicates an existing rail year and week', v_count;
    END IF;

    INSERT INTO public.rail_calendar_periods (rail_year, rail_week, start_date, end_date)
    VALUES (v_year, v_week, v_start, v_end);
    v_last_year := v_year;
    v_last_week := v_week;
    v_last_start := v_start;
    v_last_end := v_end;
    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN jsonb_build_object('inserted_periods', v_inserted, 'rows_checked', v_count);
END;
$$;

REVOKE ALL ON FUNCTION public.vh_import_rail_calendar(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vh_import_rail_calendar(jsonb) TO authenticated;
