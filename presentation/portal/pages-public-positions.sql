-- Publish job titles/reporting structure already approved for the public chart; no employee roster.
BEGIN;
GRANT SELECT ON public.positions TO anon,authenticated;
DROP POLICY IF EXISTS pages_position_structure_read ON public.positions;
CREATE POLICY pages_position_structure_read ON public.positions FOR SELECT TO anon,authenticated USING(organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid);
COMMIT;
