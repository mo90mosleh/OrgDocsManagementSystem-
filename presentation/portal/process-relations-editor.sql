-- Secure manager-only editing for relations between process nodes.
-- Applies to any tenant for which the current verified user is an organization admin.
BEGIN;
ALTER TABLE public.process_relations ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.process_relations TO authenticated;
DROP POLICY IF EXISTS pages_relations_admin_manage ON public.process_relations;
CREATE POLICY pages_relations_admin_manage ON public.process_relations
 FOR ALL TO authenticated
 USING (portal_auth.is_admin(organization_id))
 WITH CHECK (portal_auth.is_admin(organization_id));
COMMIT;
