-- Stage 26C18: REVIEW ONLY. NOT DEPLOYED. Requires independent DBA security review.
-- This migration deliberately replaces the unsafe Stage 26C17 direct-write RLS proposal.
-- Apply only after reviewing the SECURITY DEFINER RPC bodies and all role grants.
BEGIN;
-- No browser/API role may directly insert, update or delete finance ledger rows.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON
  public.finance_imports, public.finance_metric_values,
  public.finance_publications, public.finance_publication_values,
  public.finance_approval_events FROM anon, authenticated, PUBLIC;
-- Explicitly remove candidate permissive policies, if they were ever installed.
DROP POLICY IF EXISTS vh_finance_operator_insert ON public.finance_imports;
DROP POLICY IF EXISTS vh_finance_operator_insert ON public.finance_metric_values;
DROP POLICY IF EXISTS vh_finance_operator_insert ON public.finance_publications;
DROP POLICY IF EXISTS vh_finance_operator_insert ON public.finance_publication_values;
DROP POLICY IF EXISTS vh_finance_operator_insert ON public.finance_approval_events;
DROP POLICY IF EXISTS vh_finance_imports_update ON public.finance_imports;
DROP POLICY IF EXISTS vh_finance_metric_values_update ON public.finance_metric_values;
DROP POLICY IF EXISTS vh_finance_publications_update ON public.finance_publications;
-- Restrict reads to active finance/admin users; do not grant broad SELECT.
CREATE OR REPLACE FUNCTION public.vh_is_finance_operator()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS (
   SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id=r.user_id
   WHERE r.user_id=auth.uid() AND p.active=true
   AND r.role IN ('finance','administrator')
 );
$$;
REVOKE ALL ON FUNCTION public.vh_is_finance_operator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vh_is_finance_operator() TO authenticated;
-- IMPORTANT: RLS on user_roles/profiles must permit this invoker lookup.
-- Do not create direct-write RLS policies.
COMMIT;

-- RPC hardening requirements BEFORE deploying the two RPCs:
-- 1. Use narrowly reviewed SECURITY DEFINER functions with SET search_path = ''.
-- 2. Qualify all relation/function references; check auth.uid() and active roles in body.
-- 3. REVOKE EXECUTE FROM PUBLIC, anon and grant only authenticated.
-- 4. Ensure no function owner or caller can alter finance approval rows directly.
-- 5. Include explicit rejection/reconciliation RPC; never let clients mark rows reconciled.
-- 6. Test direct REST INSERT/UPDATE/DELETE all return 403/42501 for every role.
-- 7. Test cross-organisation isolation and all publication invariants.
-- 8. Verify API can still read published data under least-privilege SELECT policies.
-- This file intentionally DOES NOT switch the existing invoker RPCs to definer:
-- doing so without an independent review would create a privilege-escalation risk.
