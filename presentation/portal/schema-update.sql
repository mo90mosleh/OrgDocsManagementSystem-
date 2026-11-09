-- Capability-backed management. Applied only to the dedicated presentation project.
BEGIN;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.org_units TO anon;
CREATE POLICY portal_admin_manage ON public.org_units FOR ALL TO anon USING (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8') WITH CHECK (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8');
GRANT SELECT,INSERT,UPDATE,DELETE ON public.positions TO anon;
CREATE POLICY portal_admin_manage ON public.positions FOR ALL TO anon USING (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8') WITH CHECK (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8');
GRANT SELECT,INSERT,UPDATE,DELETE ON public.persons TO anon;
CREATE POLICY portal_admin_manage ON public.persons FOR ALL TO anon USING (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8') WITH CHECK (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8');
GRANT SELECT,INSERT,UPDATE,DELETE ON public.assignments TO anon;
CREATE POLICY portal_admin_manage ON public.assignments FOR ALL TO anon USING (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8') WITH CHECK (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8');
GRANT SELECT,INSERT,UPDATE,DELETE ON public.process_profiles TO anon;
CREATE POLICY portal_admin_manage ON public.process_profiles FOR ALL TO anon USING (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8') WITH CHECK (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8');
CREATE POLICY portal_profile_read ON public.process_profiles FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.process_nodes p WHERE p.id=process_id AND p.organization_id=process_profiles.organization_id AND p.kind='PROCESS' AND p.visibility='ORGANIZATION'));
DROP POLICY demo_read ON public.process_nodes;
CREATE POLICY portal_process_read ON public.process_nodes FOR SELECT TO anon USING (organization_id='a0000000-0000-4000-8000-000000000001'::uuid AND (visibility='ORGANIZATION' OR encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex')='1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8'));

ALTER TABLE public.org_units ADD CONSTRAINT org_units_valid_name CHECK(length(trim(name)) BETWEEN 1 AND 150);
ALTER TABLE public.positions ADD CONSTRAINT positions_valid_title CHECK(length(trim(title)) BETWEEN 1 AND 150);
ALTER TABLE public.persons ADD CONSTRAINT persons_valid_name CHECK(length(trim(display_name)) BETWEEN 1 AND 150);
CREATE INDEX positions_unit_scope ON public.positions(organization_id,org_unit_id);
CREATE INDEX assignments_person_scope ON public.assignments(organization_id,person_id);
CREATE INDEX assignments_position_scope ON public.assignments(organization_id,position_id);
CREATE INDEX org_units_parent_scope ON public.org_units(organization_id,parent_id);
CREATE FUNCTION public.portal_unit_cycle_guard() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('units:'||NEW.organization_id::text,0));
 IF NEW.parent_id IS NOT NULL AND EXISTS (WITH RECURSIVE ancestors AS (SELECT id,parent_id FROM public.org_units WHERE organization_id=NEW.organization_id AND id=NEW.parent_id UNION SELECT u.id,u.parent_id FROM public.org_units u JOIN ancestors a ON u.id=a.parent_id WHERE u.organization_id=NEW.organization_id) SELECT 1 FROM ancestors WHERE id=NEW.id) THEN RAISE EXCEPTION 'organization hierarchy cycle' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER portal_unit_cycle BEFORE INSERT OR UPDATE OF parent_id,organization_id ON public.org_units FOR EACH ROW EXECUTE FUNCTION public.portal_unit_cycle_guard();
CREATE FUNCTION public.portal_position_cycle_guard() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('positions:'||NEW.organization_id::text,0));
 IF NEW.reports_to_position_id IS NOT NULL AND EXISTS (WITH RECURSIVE ancestors AS (SELECT id,reports_to_position_id FROM public.positions WHERE organization_id=NEW.organization_id AND id=NEW.reports_to_position_id UNION SELECT p.id,p.reports_to_position_id FROM public.positions p JOIN ancestors a ON p.id=a.reports_to_position_id WHERE p.organization_id=NEW.organization_id) SELECT 1 FROM ancestors WHERE id=NEW.id) THEN RAISE EXCEPTION 'position reporting cycle' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER portal_position_cycle BEFORE INSERT OR UPDATE OF reports_to_position_id,organization_id ON public.positions FOR EACH ROW EXECUTE FUNCTION public.portal_position_cycle_guard();
CREATE FUNCTION public.portal_profile_kind_guard() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.process_nodes WHERE organization_id=NEW.organization_id AND id=NEW.process_id AND kind='PROCESS') THEN RAISE EXCEPTION 'profile requires process kind' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER portal_profile_kind BEFORE INSERT OR UPDATE OF process_id,organization_id ON public.process_profiles FOR EACH ROW EXECUTE FUNCTION public.portal_profile_kind_guard();
REVOKE ALL ON FUNCTION public.portal_unit_cycle_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_position_cycle_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_profile_kind_guard() FROM PUBLIC;
UPDATE public.organizations SET display_name='نما' WHERE id='a0000000-0000-4000-8000-000000000001';
UPDATE public.process_nodes SET summary=trim(replace(summary,'محتوای فرضی برای ارائه.','')) WHERE summary LIKE '%محتوای فرضی برای ارائه.%';
UPDATE public.kpis SET description=trim(replace(description,'تعریف نمونه، بدون مقدار واقعی.','')) WHERE description LIKE '%تعریف نمونه، بدون مقدار واقعی.%';
COMMIT;
