BEGIN;
CREATE TABLE IF NOT EXISTS public.process_training_videos(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES public.organizations(id),process_id uuid NOT NULL,
 title text NOT NULL CHECK(length(trim(title))BETWEEN 1 AND 150),external_url text NOT NULL CHECK(length(external_url)<=2048 AND external_url~'^https://[^/@[:space:]]+[^[:space:]]*$' AND external_url!~'^https://[^/]*@'),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,process_id)REFERENCES public.process_nodes(organization_id,id)ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS training_video_process ON public.process_training_videos(organization_id,process_id);
ALTER TABLE public.process_training_videos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.process_training_videos FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.process_training_videos TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.process_training_videos TO authenticated;
DROP POLICY IF EXISTS training_video_public_read ON public.process_training_videos;
CREATE POLICY training_video_public_read ON public.process_training_videos FOR SELECT TO anon,authenticated USING(organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid);
DROP POLICY IF EXISTS training_video_admin_write ON public.process_training_videos;
CREATE POLICY training_video_admin_write ON public.process_training_videos FOR ALL TO authenticated USING(organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND portal_auth.is_admin(organization_id))WITH CHECK(organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND portal_auth.is_admin(organization_id));
DROP TRIGGER IF EXISTS training_video_kind ON public.process_training_videos;
CREATE TRIGGER training_video_kind BEFORE INSERT OR UPDATE OF process_id,organization_id ON public.process_training_videos FOR EACH ROW EXECUTE FUNCTION public.portal_profile_kind_guard();
COMMIT;
