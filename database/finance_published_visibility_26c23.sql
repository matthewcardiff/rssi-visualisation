-- Stage 26C23: proposed published-only read policies.
-- Apply only after testing role and membership SELECT policies and finance RPC deployment.
-- No write privileges are granted to authenticated users.
BEGIN;
DROP POLICY IF EXISTS vh_finance_read_26c21 ON public.finance_publications;
CREATE POLICY vh_finance_published_read_26c23 ON public.finance_publications
 FOR SELECT TO authenticated USING (
 EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=(SELECT auth.uid()) AND p.active=true)
 AND (
   EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=(SELECT auth.uid())
      AND r.role IN ('finance','administrator'))
   OR (status='published' AND (
      EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=(SELECT auth.uid())
        AND r.role IN ('executive','meeting_host'))
      OR EXISTS (SELECT 1 FROM public.department_memberships dm
        WHERE dm.user_id=(SELECT auth.uid()) AND dm.department_id=finance_publications.department_id
          AND dm.active=true)
   ))
 )
 );
DROP POLICY IF EXISTS vh_finance_read_26c21 ON public.finance_publication_values;
CREATE POLICY vh_finance_published_values_read_26c23 ON public.finance_publication_values
 FOR SELECT TO authenticated USING (
 EXISTS (SELECT 1 FROM public.finance_publications p WHERE p.id=finance_publication_values.publication_id)
 );
GRANT SELECT ON public.finance_publications, public.finance_publication_values TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.finance_publications, public.finance_publication_values FROM anon, authenticated;
-- For published data the API selects only published publications; the value policy
-- derives visibility from the parent publication RLS. Never expose source imports.
COMMIT;
