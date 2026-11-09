import {readFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const cfg=JSON.parse(await readFile('pages-config.json','utf8'));const org='a0000000-0000-4000-8000-000000000001';
const get=async(table,query)=>{const r=await fetch(cfg.url+'/rest/v1/'+table+'?'+query,{headers:{apikey:cfg.publishableKey},signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,table);return r.json();};
const [o,u,p,k]=await Promise.all([get('organizations','id=eq.'+org),get('org_units','organization_id=eq.'+org),get('process_nodes','organization_id=eq.'+org+'&kind=eq.PROCESS'),get('kpis','organization_id=eq.'+org)]);
assert.equal(o.length,1);assert.equal(u.length,7);assert.equal(p.length,6);assert.equal(k.length,4);
const protectedRead=await fetch(cfg.url+'/rest/v1/users?select=id',{headers:{apikey:cfg.publishableKey}});assert.ok([401,403].includes(protectedRead.status));
const write=await fetch(cfg.url+'/rest/v1/organizations?id=eq.'+org,{method:'PATCH',headers:{apikey:cfg.publishableKey,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({name:o[0].name})});assert.equal(write.status,200);assert.deepEqual(await write.json(),[]);
console.log('Live Supabase API: 7 units, 6 processes, 4 KPIs; private account reads blocked; unauthorized update changes 0 rows.');
