-- Stage 26C17: REVIEW CANDIDATE ONLY; DO NOT APPLY WITHOUT AUTHENTICATED ACCEPTANCE.
-- IMPORTANT: This policy set allows direct authenticated finance-role table mutations.
-- It therefore DOES NOT enforce RPC-only approval/audit invariants and is NOT
-- sufficient to enable publication. See docs/stage26c17-handoff.md.
BEGIN;
CREATE OR REPLACE FUNCTION public.vh_is_finance_operator()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
  WHERE r.user_id=(SELECT auth.uid()) AND p.active=true
    AND r.role IN ('finance','administrator')
 );
$$;
REVOKE ALL ON FUNCTION public.vh_is_finance_operator() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.vh_is_finance_operator() TO authenticated;
-- SELECT is essential for UPDATE under RLS.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['finance_imports','finance_metric_values','finance_publications','finance_publication_values','finance_approval_events'] LOOP
  EXECUTE format('CREATE POLICY vh_finance_operator_select ON public.%I FOR SELECT TO authenticated USING (public.vh_is_finance_operator())',t);
  EXECUTE format('CREATE POLICY vh_finance_operator_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.vh_is_finance_operator())',t);
 END LOOP;
END $$;
CREATE POLICY vh_finance_imports_update ON public.finance_imports FOR UPDATE TO authenticated
 USING (public.vh_is_finance_operator()) WITH CHECK (public.vh_is_finance_operator());
CREATE POLICY vh_finance_metric_values_update ON public.finance_metric_values FOR UPDATE TO authenticated
 USING (public.vh_is_finance_operator()) WITH CHECK (public.vh_is_finance_operator());
CREATE POLICY vh_finance_publications_update ON public.finance_publications FOR UPDATE TO authenticated
 USING (public.vh_is_finance_operator()) WITH CHECK (public.vh_is_finance_operator());
-- Deliberately no DELETE policy. No anon access. Explicit grants still required
-- and must be audited before deploying the RPCs.
COMMIT;
