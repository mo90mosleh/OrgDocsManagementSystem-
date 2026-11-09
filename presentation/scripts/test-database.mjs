import{spawnSync}from'node:child_process';import{readFile}from'node:fs/promises';import{createHash}from'node:crypto';
const container='orgdocs-feedback-test-db';
function sql(input){const r=spawnSync('docker',['--host=unix:///var/run/docker.sock','exec','-i',container,'psql','-v','ON_ERROR_STOP=1','-U','postgres','-d','portal_feedback_test'],{input,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);return r.stdout;}
const db=sql('select current_database();');if(!db.includes('portal_feedback_test'))throw Error('Refusing non-test database');
const cap='isolated-local-test-capability';const hash=createHash('sha256').update(cap).digest('hex');
const base=await readFile('schema.sql','utf8'),security=(await readFile('security.sql','utf8')).replace(/[a-f0-9]{64}/g,hash),update=(await readFile('portal/schema-update.sql','utf8')).replace(/[a-f0-9]{64}/g,hash),seed=await readFile('demo-data.sql','utf8');
sql('CREATE ROLE anon; CREATE ROLE authenticated;\n'+base+'\n'+security+'\n'+seed+'\n'+update);
sql(`SET ROLE anon;SET request.headers='{}';DO $$ BEGIN
 IF (SELECT count(*) FROM public.org_units)<>7 THEN RAISE EXCEPTION 'public org read failed';END IF;
 IF (SELECT count(*) FROM public.persons)<>0 THEN RAISE EXCEPTION 'private read leaked';END IF;
 BEGIN INSERT INTO public.positions(organization_id,org_unit_id,title)VALUES('a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','blocked');RAISE EXCEPTION 'unauthorized insert accepted';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
END $$;RESET ROLE;`);
sql(`SET ROLE anon;SET request.headers='{"x-demo-write-token":"${cap}"}';
INSERT INTO public.positions(id,organization_id,org_unit_id,title)VALUES('e0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','manager');
INSERT INTO public.positions(id,organization_id,org_unit_id,title,reports_to_position_id)VALUES('e0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','staff','e0000000-0000-4000-8000-000000000001');
INSERT INTO public.persons(id,organization_id,display_name)VALUES('f0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','isolated person');
INSERT INTO public.assignments(organization_id,position_id,person_id)VALUES('a0000000-0000-4000-8000-000000000001','e0000000-0000-4000-8000-000000000002','f0000000-0000-4000-8000-000000000001');
INSERT INTO public.process_profiles(organization_id,process_id,objective)VALUES('a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000011','saved objective');
DO $$ BEGIN
 IF (SELECT count(*) FROM public.assignments)<>1 THEN RAISE EXCEPTION 'assignment not persisted';END IF;
 BEGIN UPDATE public.org_units SET parent_id='b0000000-0000-4000-8000-000000000005' WHERE id='b0000000-0000-4000-8000-000000000001';RAISE EXCEPTION 'unit cycle accepted';EXCEPTION WHEN check_violation THEN NULL;END;
 BEGIN UPDATE public.positions SET reports_to_position_id='e0000000-0000-4000-8000-000000000002' WHERE id='e0000000-0000-4000-8000-000000000001';RAISE EXCEPTION 'reporting cycle accepted';EXCEPTION WHEN check_violation THEN NULL;END;
 BEGIN DELETE FROM public.positions WHERE id='e0000000-0000-4000-8000-000000000002';RAISE EXCEPTION 'dependent deletion accepted';EXCEPTION WHEN foreign_key_violation THEN NULL;END;
 BEGIN INSERT INTO public.process_profiles(organization_id,process_id)VALUES('a0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001');RAISE EXCEPTION 'group profile accepted';EXCEPTION WHEN check_violation THEN NULL;END;
 BEGIN INSERT INTO public.assignments(organization_id,position_id,person_id)VALUES('a0000000-0000-4000-8000-000000000001','e0000000-0000-4000-8000-000000000002','f0000000-0000-4000-8000-000000000001');RAISE EXCEPTION 'duplicate assignment accepted';EXCEPTION WHEN unique_violation THEN NULL;END;
END $$;SET request.headers='{}';DO $$ BEGIN IF (SELECT count(*) FROM public.persons)<>0 THEN RAISE EXCEPTION 'persons readable without capability';END IF;IF (SELECT count(*) FROM public.process_profiles)<>1 THEN RAISE EXCEPTION 'profile not visible';END IF;END $$;`);
console.log('Isolated PostgreSQL 17 passed: persistence, anonymous denial, private reads, unit/reporting cycles, dependency-safe delete, duplicate assignments and process-kind guard.');
