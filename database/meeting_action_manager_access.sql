-- Allow active department managers to create and update actions in their own department.
-- Meeting hosts, administrators and executives retain organisation-wide authority.
CREATE POLICY vh_department_manager_action_insert
ON public.meeting_actions
FOR INSERT
TO authenticated
WITH CHECK (
  status = 'open'
  AND completed_at IS NULL
  AND completed_by IS NULL
  AND version = 1
  AND length(btrim(description)) > 0
  AND required_by IS NOT NULL
  AND NULLIF(btrim(COALESCE(owner_text, '')), '') IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.active = true
  )
  AND (
    EXISTS (
      SELECT 1
      FROM public.user_roles r
      JOIN public.departments d ON d.organisation_id = r.organisation_id
      WHERE r.user_id = (SELECT auth.uid())
        AND r.role IN ('meeting_host', 'administrator', 'executive')
        AND d.id = meeting_actions.department_id
    )
    OR EXISTS (
      SELECT 1 FROM public.department_memberships m
      WHERE m.user_id = (SELECT auth.uid())
        AND m.department_id = meeting_actions.department_id
        AND m.active = true
        AND m.membership_role = 'manager'
    )
  )
);

CREATE POLICY vh_department_manager_action_update
ON public.meeting_actions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles r
    JOIN public.departments d ON d.organisation_id = r.organisation_id
    WHERE r.user_id = (SELECT auth.uid())
      AND r.role IN ('meeting_host', 'administrator', 'executive')
      AND d.id = meeting_actions.department_id
  )
  OR EXISTS (
    SELECT 1 FROM public.department_memberships m
    WHERE m.user_id = (SELECT auth.uid())
      AND m.department_id = meeting_actions.department_id
      AND m.active = true
      AND m.membership_role = 'manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles r
    JOIN public.departments d ON d.organisation_id = r.organisation_id
    WHERE r.user_id = (SELECT auth.uid())
      AND r.role IN ('meeting_host', 'administrator', 'executive')
      AND d.id = meeting_actions.department_id
  )
  OR EXISTS (
    SELECT 1 FROM public.department_memberships m
    WHERE m.user_id = (SELECT auth.uid())
      AND m.department_id = meeting_actions.department_id
      AND m.active = true
      AND m.membership_role = 'manager'
  )
);
