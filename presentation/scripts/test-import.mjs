import{spawnSync}from'node:child_process';import{readFile}from'node:fs/promises';import assert from'node:assert/strict';
function sql(s){const r=spawnSync('docker',['--host=unix:///var/run/docker.sock','exec','-i','rassan-import-test','psql','-qAt','-v','ON_ERROR_STOP=1','-U','postgres'],{input:s,encoding:'utf8',maxBuffer:10e6});if(r.status)throw Error(r.stderr);return r.stdout.trim();}
const payload=JSON.parse(await readFile(process.argv[2],'utf8')),org=payload.organization_id,batch=payload.batch_id;
let schema=await readFile('schema.sql','utf8');sql(`DROP SCHEMA public CASCADE;DROP SCHEMA IF EXISTS rassan_import CASCADE;CREATE SCHEMA public;GRANT USAGE ON SCHEMA public TO PUBLIC;DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon')THEN CREATE ROLE anon;CREATE ROLE authenticated;END IF;END $$;`+schema+(await readFile('security.sql','utf8'))+(await readFile('portal/schema-update.sql','utf8'))+(await readFile('imports/schema.sql','utf8')));
assert.equal(sql('SELECT count(*) FROM organizations;'),'0');
const literal='$payload$'+JSON.stringify(payload)+'$payload$::jsonb';
let r=JSON.parse(sql('SELECT rassan_import.dry_run('+literal+');'));assert.equal(r.inserted,490);assert.equal(sql('SELECT count(*) FROM organizations;'),'0');
r=JSON.parse(sql('SELECT rassan_import.apply_package('+literal+');'));assert.equal(r.inserted,490);assert.equal(r.after.processes,44);assert.equal(r.after.documents,90);
r=JSON.parse(sql('SELECT rassan_import.apply_package('+literal+');'));assert.equal(r.unchanged,490);assert.equal(r.inserted,0);
const pid=payload.items.find(x=>x.source_key==='process:RAS-U013').values.id;
const original=sql(`SELECT summary FROM process_nodes WHERE id='${pid}'`);sql(`UPDATE process_nodes SET summary='reviewer edit' WHERE id='${pid}'`);
r=JSON.parse(sql('SELECT rassan_import.apply_package('+literal+');'));assert.equal(r.conflicts.length,1);assert.equal(sql(`SELECT summary FROM process_nodes WHERE id='${pid}'`),'reviewer edit');
r=JSON.parse(sql(`SELECT rassan_import.rollback_batch('${batch}');`));assert.equal(r.rolled_back,false);
sql(`UPDATE process_nodes SET summary=$summary$${original}$summary$ WHERE id='${pid}'`);
for(const table of ['organizations','org_units','process_nodes','process_profiles','kpis','process_kpis','documents','bpms_references','process_relations','kpi_data_requirements'])assert.equal(sql(`SET ROLE anon;SET request.headers='{}';SELECT count(*) FROM ${table};RESET ROLE;`),'0');
assert.equal(sql(`SELECT has_function_privilege('anon','rassan_import.apply_package(jsonb)','EXECUTE');`),'f');
r=JSON.parse(sql(`SELECT rassan_import.rollback_batch('${batch}');`));assert.equal(r.rolled_back,true);assert.equal(r.restored_records,490);assert.equal(sql('SELECT count(*) FROM organizations;'),'0');
console.log('PASS PostgreSQL: fresh empty schema, dry-run rollback, 490 inserts, 490 unchanged on rerun, reviewer conflict preserved, safe rollback, anonymous zero rows/denied import.');
