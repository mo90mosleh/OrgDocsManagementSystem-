-- Email/password authentication for the public Pages presentation. No default users/passwords.
BEGIN;
CREATE SCHEMA IF NOT EXISTS portal_auth;
REVOKE ALL ON SCHEMA portal_auth FROM PUBLIC,anon;
GRANT USAGE ON SCHEMA portal_auth TO authenticated;
CREATE TABLE IF NOT EXISTS portal_auth.owner_emails(email text PRIMARY KEY CHECK(email=lower(email)),organization_id uuid NOT NULL REFERENCES public.organizations(id));
ALTER TABLE portal_auth.owner_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON portal_auth.owner_emails FROM PUBLIC,anon,authenticated;
-- Deployment authorization configuration, not a user or a business seed.
INSERT INTO portal_auth.owner_emails(email,organization_id)VALUES('mo90mosleh@gmail.com','8847c22d-0282-5b07-80b1-d34bc41a4efa')ON CONFLICT(email)DO NOTHING;
CREATE TABLE IF NOT EXISTS public.portal_memberships(organization_id uuid NOT NULL REFERENCES public.organizations(id),user_id uuid NOT NULL REFERENCES auth.users(id)ON DELETE CASCADE,role text NOT NULL CHECK(role IN('ADMIN','VIEWER')),PRIMARY KEY(organization_id,user_id));
CREATE INDEX IF NOT EXISTS portal_membership_user_scope ON public.portal_memberships(user_id,organization_id);
ALTER TABLE public.portal_memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portal_memberships FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.portal_memberships TO authenticated;
DROP POLICY IF EXISTS membership_self_read ON public.portal_memberships;
CREATE POLICY membership_self_read ON public.portal_memberships FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
CREATE OR REPLACE FUNCTION portal_auth.is_admin(p_org uuid)RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.portal_memberships m JOIN auth.users u ON u.id=m.user_id JOIN auth.sessions s ON s.user_id=u.id AND s.id=nullif(auth.jwt()->>'session_id','')::uuid
 WHERE m.organization_id=p_org AND m.user_id=auth.uid() AND m.role='ADMIN' AND u.email_confirmed_at IS NOT NULL AND(s.not_after IS NULL OR s.not_after>now()));
$$;
REVOKE ALL ON FUNCTION portal_auth.is_admin(uuid)FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION portal_auth.is_admin(uuid)TO authenticated;
CREATE OR REPLACE FUNCTION portal_auth.enroll_verified_owner()RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.email_confirmed_at IS NOT NULL AND NEW.email IS NOT NULL THEN
  INSERT INTO public.portal_memberships(organization_id,user_id,role)SELECT o.organization_id,NEW.id,'ADMIN'FROM portal_auth.owner_emails o WHERE o.email=lower(NEW.email)ON CONFLICT DO NOTHING;
 END IF;RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION portal_auth.enroll_verified_owner()FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS portal_enroll_owner ON auth.users;
CREATE TRIGGER portal_enroll_owner AFTER INSERT OR UPDATE OF email,email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION portal_auth.enroll_verified_owner();
INSERT INTO public.portal_memberships(organization_id,user_id,role)SELECT o.organization_id,u.id,'ADMIN'FROM portal_auth.owner_emails o JOIN auth.users u ON lower(u.email)=o.email WHERE u.email_confirmed_at IS NOT NULL ON CONFLICT DO NOTHING;
DO $$ DECLARE t text;col text;predicate text;BEGIN
 FOREACH t IN ARRAY ARRAY['organizations','org_units','process_nodes','process_profiles','bpms_references','kpis','process_kpis','kpi_data_requirements','documents','process_relations']LOOP
  col=CASE WHEN t='organizations'THEN'id'ELSE'organization_id'END;
  EXECUTE format('GRANT SELECT ON public.%I TO anon,authenticated',t);
  EXECUTE format('DROP POLICY IF EXISTS pages_public_read ON public.%I',t);
  EXECUTE format('CREATE POLICY pages_public_read ON public.%I FOR SELECT TO anon,authenticated USING(%I=''8847c22d-0282-5b07-80b1-d34bc41a4efa''::uuid)',t,col);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['org_units','positions','persons','assignments','process_profiles']LOOP
  predicate='organization_id=''8847c22d-0282-5b07-80b1-d34bc41a4efa''::uuid AND portal_auth.is_admin(organization_id)';
  EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO authenticated',t);
  EXECUTE format('DROP POLICY IF EXISTS pages_admin_manage ON public.%I',t);
  EXECUTE format('CREATE POLICY pages_admin_manage ON public.%I FOR ALL TO authenticated USING(%s)WITH CHECK(%s)',t,predicate,predicate);
 END LOOP;
END $$;
GRANT UPDATE(name,display_name,primary_color,logo_data_url)ON public.organizations TO authenticated;
DROP POLICY IF EXISTS pages_admin_brand ON public.organizations;
CREATE POLICY pages_admin_brand ON public.organizations FOR UPDATE TO authenticated USING(id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND portal_auth.is_admin(id))WITH CHECK(id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND portal_auth.is_admin(id));
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='pages_brand_valid' AND conrelid='public.organizations'::regclass)THEN
 ALTER TABLE public.organizations ADD CONSTRAINT pages_brand_valid CHECK(length(trim(name))BETWEEN 1 AND 150 AND length(trim(display_name))BETWEEN 1 AND 150 AND primary_color~'^#[a-fA-F0-9]{6}$' AND(logo_data_url IS NULL OR(length(logo_data_url)<=1400000 AND logo_data_url~'^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$')));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='pages_person_valid' AND conrelid='public.persons'::regclass)THEN
 ALTER TABLE public.persons ADD CONSTRAINT pages_person_valid CHECK((email IS NULL OR(length(email)<=254 AND email~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))AND(phone IS NULL OR length(phone)<=40));
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='pages_profile_lengths' AND conrelid='public.process_profiles'::regclass)THEN
 ALTER TABLE public.process_profiles ADD CONSTRAINT pages_profile_lengths CHECK(coalesce(length(objective),0)<=4000 AND coalesce(length(start_event),0)<=4000 AND coalesce(length(end_event),0)<=4000 AND coalesce(length(inputs),0)<=4000 AND coalesce(length(outputs),0)<=4000 AND coalesce(length(roles),0)<=4000 AND coalesce(length(expected_outcome),0)<=4000 AND coalesce(length(notes),0)<=4000);
 END IF;
END $$;
COMMIT;
