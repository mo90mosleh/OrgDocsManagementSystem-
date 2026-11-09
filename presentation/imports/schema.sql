-- Schema only: private presentation scopes and audited optional imports. No business seed.
BEGIN;
CREATE SCHEMA IF NOT EXISTS rassan_import;
REVOKE ALL ON SCHEMA rassan_import FROM PUBLIC,anon,authenticated;
ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_singleton_key;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS deployment_key text NOT NULL DEFAULT 'public-presentation';
CREATE UNIQUE INDEX IF NOT EXISTS organizations_deployment_key_unique ON public.organizations(deployment_key);
CREATE TABLE IF NOT EXISTS rassan_import.batches(
 id uuid PRIMARY KEY,organization_id uuid NOT NULL,source_sha256 text NOT NULL,revision text NOT NULL,source_as_of text,source_url text,
 organization_created boolean NOT NULL,organization_before jsonb,before_counts jsonb,after_counts jsonb,result jsonb,status text NOT NULL DEFAULT 'PREPARED',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS import_active_source_unique ON rassan_import.batches(organization_id,source_sha256) WHERE status<>'ROLLED_BACK';
CREATE TABLE IF NOT EXISTS rassan_import.registry(
 organization_id uuid NOT NULL,table_name text NOT NULL,source_key text NOT NULL,target_id uuid NOT NULL,managed_values jsonb NOT NULL,last_batch_id uuid NOT NULL REFERENCES rassan_import.batches(id),PRIMARY KEY(organization_id,table_name,source_key)
);
CREATE TABLE IF NOT EXISTS rassan_import.changes(
 sequence bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,batch_id uuid NOT NULL REFERENCES rassan_import.batches(id),organization_id uuid NOT NULL,table_name text NOT NULL,source_key text NOT NULL,target_id uuid NOT NULL,before_row jsonb,after_row jsonb NOT NULL,before_registry jsonb,UNIQUE(batch_id,table_name,source_key)
);
CREATE TABLE IF NOT EXISTS rassan_import.runs(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),batch_id uuid NOT NULL REFERENCES rassan_import.batches(id),result jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON ALL TABLES IN SCHEMA rassan_import FROM PUBLIC,anon,authenticated;
ALTER TABLE rassan_import.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rassan_import.registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE rassan_import.changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rassan_import.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_nodes ADD COLUMN IF NOT EXISTS source_data jsonb;
ALTER TABLE public.process_nodes ADD COLUMN IF NOT EXISTS proposed_data jsonb;
ALTER TABLE public.bpms_references ADD COLUMN IF NOT EXISTS control_question text;
DO $$ DECLARE t text;BEGIN
 FOREACH t IN ARRAY ARRAY['process_nodes','process_profiles','bpms_references','kpis','process_relations','documents','kpi_data_requirements'] LOOP
  EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS content_status text',t);
  EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS content_revision text',t);
 END LOOP;
END $$;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES rassan_import.batches(id);
ALTER TABLE public.documents ALTER COLUMN uploaded_by DROP NOT NULL;
DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.documents'::regclass AND conname='documents_have_actor_or_import')THEN
 ALTER TABLE public.documents ADD CONSTRAINT documents_have_actor_or_import CHECK(uploaded_by IS NOT NULL OR import_batch_id IS NOT NULL);
END IF;END $$;
CREATE UNIQUE INDEX IF NOT EXISTS documents_process_url_unique ON public.documents(organization_id,process_id,external_url) WHERE external_url IS NOT NULL;
GRANT SELECT ON public.organizations TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.organizations;
CREATE POLICY rassan_private_access ON public.organizations FOR ALL TO anon USING (id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.org_units TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.org_units;
CREATE POLICY rassan_private_access ON public.org_units FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.positions TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.positions;
CREATE POLICY rassan_private_access ON public.positions FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.persons TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.persons;
CREATE POLICY rassan_private_access ON public.persons FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.assignments TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.assignments;
CREATE POLICY rassan_private_access ON public.assignments FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.process_nodes TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.process_nodes;
CREATE POLICY rassan_private_access ON public.process_nodes FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.process_profiles TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.process_profiles;
CREATE POLICY rassan_private_access ON public.process_profiles FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.bpms_references TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.bpms_references;
CREATE POLICY rassan_private_access ON public.bpms_references FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.kpis TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.kpis;
CREATE POLICY rassan_private_access ON public.kpis FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.process_kpis TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.process_kpis;
CREATE POLICY rassan_private_access ON public.process_kpis FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.kpi_data_requirements TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.kpi_data_requirements;
CREATE POLICY rassan_private_access ON public.kpi_data_requirements FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.documents TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.documents;
CREATE POLICY rassan_private_access ON public.documents FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));
GRANT SELECT ON public.process_relations TO anon;
DROP POLICY IF EXISTS rassan_private_access ON public.process_relations;
CREATE POLICY rassan_private_access ON public.process_relations FOR ALL TO anon USING (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f')) WITH CHECK (organization_id='8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid AND encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-demo-write-token',''),'UTF8')),'hex') IN ('1252f616dfb3510420e063dc36cd25169e75b1e3f83f09bdd6db3601f506aed8','b66295dc1024d5e52e90cfe7f3849af8760a962a87b2544ee6b9006fb53ac79f'));

CREATE OR REPLACE FUNCTION rassan_import.counts(p_org uuid)RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public,rassan_import AS $$
DECLARE t text;n bigint;result jsonb='{}';BEGIN
 FOREACH t IN ARRAY ARRAY['org_units','positions','persons','assignments','process_profiles','bpms_references','kpis','process_kpis','kpi_data_requirements','documents','process_relations','process_models','kpi_measurements'] LOOP
  EXECUTE format('SELECT count(*) FROM public.%I WHERE organization_id=$1',t)INTO n USING p_org;result=result||jsonb_build_object(t,n);
 END LOOP;
 SELECT result||jsonb_build_object('processes',count(*)FILTER(WHERE kind='PROCESS'),'groups',count(*)FILTER(WHERE kind='GROUP')) INTO result FROM public.process_nodes WHERE organization_id=p_org;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION rassan_import.apply_record(p_org uuid,p_batch uuid,p_table text,p_key text,p_values jsonb)RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public,rassan_import AS $$
DECLARE reg rassan_import.registry%rowtype;current_row jsonb;current_managed jsonb;after_row jsonb;columns_sql text;values_sql text;updates_sql text;before_reg jsonb;action text;
BEGIN
 IF p_table<>ALL(ARRAY['org_units','process_nodes','process_profiles','bpms_references','kpis','process_kpis','kpi_data_requirements','documents','process_relations'])OR(p_values->>'organization_id')::uuid<>p_org THEN RAISE EXCEPTION 'invalid import scope';END IF;
 SELECT * INTO reg FROM rassan_import.registry WHERE organization_id=p_org AND table_name=p_table AND source_key=p_key FOR UPDATE;
 EXECUTE format('SELECT to_jsonb(t)FROM public.%I t WHERE id=$1 AND organization_id=$2',p_table) INTO current_row USING (p_values->>'id')::uuid,p_org;
 IF reg.target_id IS NOT NULL THEN
  IF reg.target_id<>(p_values->>'id')::uuid OR current_row IS NULL THEN RETURN jsonb_build_object('action','conflict','table',p_table,'key',p_key,'reason','record_missing_or_rekeyed');END IF;
  SELECT jsonb_object_agg(k,current_row->k)INTO current_managed FROM jsonb_object_keys(reg.managed_values)k;
  IF current_managed IS DISTINCT FROM reg.managed_values THEN RETURN jsonb_build_object('action','conflict','table',p_table,'key',p_key,'reason','reviewer_edit_preserved');END IF;
  IF p_values=reg.managed_values THEN RETURN jsonb_build_object('action','unchanged','table',p_table,'key',p_key);END IF;
 ELSIF current_row IS NOT NULL THEN
  RETURN jsonb_build_object('action','conflict','table',p_table,'key',p_key,'reason','unmanaged_existing_record');
 END IF;
 before_reg=CASE WHEN reg.target_id IS NULL THEN NULL ELSE to_jsonb(reg)END;
 IF current_row IS NULL THEN
  SELECT string_agg(format('%I',k),','ORDER BY k),string_agg(format('x.%I',k),','ORDER BY k)INTO columns_sql,values_sql FROM jsonb_object_keys(p_values)k;
  EXECUTE format('INSERT INTO public.%1$I AS target(%2$s)SELECT %3$s FROM jsonb_populate_record(NULL::public.%1$I,$1)x RETURNING to_jsonb(target)',p_table,columns_sql,values_sql)INTO after_row USING p_values;action='inserted';
 ELSE
  SELECT string_agg(format('%1$I=(jsonb_populate_record(NULL::public.%2$I,$1)).%1$I',k,p_table),','ORDER BY k)INTO updates_sql FROM jsonb_object_keys(p_values)k WHERE k<>'id';
  EXECUTE format('UPDATE public.%I AS target SET %s WHERE target.id=$2 AND target.organization_id=$3 RETURNING to_jsonb(target)',p_table,updates_sql)INTO after_row USING p_values,(p_values->>'id')::uuid,p_org;action='updated';
 END IF;
 INSERT INTO rassan_import.changes(batch_id,organization_id,table_name,source_key,target_id,before_row,after_row,before_registry)VALUES(p_batch,p_org,p_table,p_key,(p_values->>'id')::uuid,current_row,after_row,before_reg)ON CONFLICT(batch_id,table_name,source_key)DO UPDATE SET after_row=excluded.after_row;
 INSERT INTO rassan_import.registry(organization_id,table_name,source_key,target_id,managed_values,last_batch_id)VALUES(p_org,p_table,p_key,(p_values->>'id')::uuid,p_values,p_batch)ON CONFLICT(organization_id,table_name,source_key)DO UPDATE SET managed_values=excluded.managed_values,last_batch_id=excluded.last_batch_id;
 RETURN jsonb_build_object('action',action,'table',p_table,'key',p_key);
END $$;
CREATE OR REPLACE FUNCTION rassan_import.apply_package(p_package jsonb)RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public,rassan_import AS $$
DECLARE org uuid=(p_package->>'organization_id')::uuid;batch uuid=(p_package->>'batch_id')::uuid;before_org jsonb;before_counts jsonb;after_counts jsonb;item jsonb;r jsonb;inserted int=0;updated int=0;unchanged int=0;conflicts jsonb='[]';report jsonb;
BEGIN
 IF org<>'8847c22d-0282-5b07-80b1-d34bc41a4efa'::uuid OR p_package->>'package_status'<>'DRAFT' THEN RAISE EXCEPTION 'not the authorized private presentation package';END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('rassan-import:'||org::text,0));
 SELECT to_jsonb(o)INTO before_org FROM public.organizations o WHERE id=org;
 IF before_org IS NOT NULL AND before_org->>'deployment_key'<>'rassan-private-presentation'THEN RAISE EXCEPTION 'existing organization is outside presentation scope';END IF;
 before_counts=rassan_import.counts(org);
 INSERT INTO public.organizations(id,name,display_name,primary_color,deployment_key)VALUES(org,'شیرآلات راسان','نما',coalesce((SELECT primary_color FROM public.organizations WHERE id='a0000000-0000-4000-8000-000000000001'),'#bd2739'),'rassan-private-presentation')ON CONFLICT(id)DO NOTHING;
 INSERT INTO rassan_import.batches(id,organization_id,source_sha256,revision,source_as_of,source_url,organization_created,organization_before,before_counts)VALUES(batch,org,p_package->>'source_sha256',p_package->>'revision',p_package->>'source_as_of',p_package->>'source_url',before_org IS NULL,before_org,before_counts)ON CONFLICT(id)DO NOTHING;
 IF EXISTS(SELECT 1 FROM rassan_import.batches WHERE id=batch AND status='ROLLED_BACK')THEN RAISE EXCEPTION 'batch was rolled back; a new explicit batch ID is required';END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_package->'items')LOOP
  r=rassan_import.apply_record(org,batch,item->>'table',item->>'source_key',item->'values');
  CASE r->>'action'WHEN'inserted'THEN inserted=inserted+1;WHEN'updated'THEN updated=updated+1;WHEN'unchanged'THEN unchanged=unchanged+1;ELSE conflicts=conflicts||jsonb_build_array(r);END CASE;
 END LOOP;
 after_counts=rassan_import.counts(org);
 report=jsonb_build_object('organization_id',org,'batch_id',batch,'source_sha256',p_package->>'source_sha256','revision',p_package->>'revision','inserted',inserted,'updated',updated,'unchanged',unchanged,'conflicts',conflicts,'before',before_counts,'after',after_counts);
 UPDATE rassan_import.batches SET after_counts=rassan_import.counts(org),result=report,status=CASE WHEN jsonb_array_length(conflicts)=0 THEN'APPLIED'ELSE'APPLIED_WITH_CONFLICTS'END WHERE id=batch;
 INSERT INTO rassan_import.runs(batch_id,result)VALUES(batch,report);
 RETURN report;
END $$;
CREATE OR REPLACE FUNCTION rassan_import.rollback_batch(p_batch uuid)RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public,rassan_import AS $$
DECLARE b rassan_import.batches%rowtype;c rassan_import.changes%rowtype;row_now jsonb;conflicts jsonb='[]';updates_sql text;restored int=0;
BEGIN
 SELECT * INTO STRICT b FROM rassan_import.batches WHERE id=p_batch FOR UPDATE;PERFORM pg_advisory_xact_lock(hashtextextended('rassan-import:'||b.organization_id::text,0));
 IF rassan_import.counts(b.organization_id) IS DISTINCT FROM b.after_counts THEN RETURN jsonb_build_object('rolled_back',false,'conflicts',jsonb_build_array(jsonb_build_object('reason','counts_changed_since_import')));END IF;
 FOR c IN SELECT * FROM rassan_import.changes WHERE batch_id=p_batch ORDER BY sequence DESC LOOP
  EXECUTE format('SELECT to_jsonb(t)FROM public.%I t WHERE id=$1 AND organization_id=$2',c.table_name)INTO row_now USING c.target_id,b.organization_id;
  IF row_now IS DISTINCT FROM c.after_row THEN conflicts=conflicts||jsonb_build_array(jsonb_build_object('table',c.table_name,'key',c.source_key,'reason','changed_since_import'));END IF;
 END LOOP;
 IF jsonb_array_length(conflicts)>0 THEN RETURN jsonb_build_object('rolled_back',false,'conflicts',conflicts);END IF;
 FOR c IN SELECT * FROM rassan_import.changes WHERE batch_id=p_batch ORDER BY sequence DESC LOOP
  IF c.before_row IS NULL THEN EXECUTE format('DELETE FROM public.%I WHERE id=$1 AND organization_id=$2',c.table_name)USING c.target_id,b.organization_id;
  ELSE
   SELECT string_agg(format('%1$I=(jsonb_populate_record(NULL::public.%2$I,$1)).%1$I',k,c.table_name),','ORDER BY k)INTO updates_sql FROM jsonb_object_keys(c.before_row)k WHERE k<>'id';
   EXECUTE format('UPDATE public.%I SET %s WHERE id=$2 AND organization_id=$3',c.table_name,updates_sql)USING c.before_row,c.target_id,b.organization_id;
  END IF;
  DELETE FROM rassan_import.registry WHERE organization_id=b.organization_id AND table_name=c.table_name AND source_key=c.source_key;
  IF c.before_registry IS NOT NULL THEN INSERT INTO rassan_import.registry SELECT(jsonb_populate_record(NULL::rassan_import.registry,c.before_registry)).*;END IF;restored=restored+1;
 END LOOP;
 IF b.organization_created THEN DELETE FROM public.organizations WHERE id=b.organization_id;END IF;
 UPDATE rassan_import.batches SET status='ROLLED_BACK'WHERE id=p_batch;
 RETURN jsonb_build_object('rolled_back',true,'restored_records',restored,'organization_id',b.organization_id,'batch_id',p_batch);
END $$;
CREATE OR REPLACE FUNCTION rassan_import.dry_run(p_package jsonb)RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=pg_catalog,public,rassan_import AS $$
DECLARE report jsonb;BEGIN
 BEGIN report=rassan_import.apply_package(p_package);RAISE EXCEPTION USING ERRCODE='P9001',MESSAGE='dry run rollback';
 EXCEPTION WHEN SQLSTATE 'P9001' THEN NULL;END;
 RETURN report||jsonb_build_object('dry_run',true);
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rassan_import FROM PUBLIC,anon,authenticated;
COMMIT;
