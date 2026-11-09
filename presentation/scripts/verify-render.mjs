import{createInterface}from'node:readline';import assert from'node:assert/strict';
const rl=createInterface({input:process.stdin,terminal:false});const secrets=await new Promise(resolve=>rl.once('line',s=>{rl.close();resolve(JSON.parse(s));}));
const base='https://rassan-orgdocs-preview.onrender.com',result={};
const get=async(path,options={})=>fetch(base+path,{...options,redirect:'manual',signal:AbortSignal.timeout(60000)});
for(const[path,status]of [['/health',200],['/login',200],['/api/data',401],['/',303]]){const r=await get(path);assert.equal(r.status,status);result[path]=r.status;}
assert.equal((await get('/api/data',{headers:{'oai-authenticated-user-email':'mo90mosleh@gmail.com'}})).status,401);
for(const role of ['VIEWER','ADMIN']){const r=await get('/login',{method:'POST',headers:{origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({key:secrets['PRESENTATION_'+role+'_KEY']})});assert.equal(r.status,303);const header=r.headers.get('set-cookie');assert.match(header,/HttpOnly; Secure; SameSite=Lax/);const cookie=header.split(';')[0];const response=await get('/api/data',{headers:{cookie}});const data=await response.json();result[role]={login:r.status,dataStatus:response.status};if(response.ok){const counts={processes:data.nodes.filter(n=>n.kind==='PROCESS').length,profiles:data.profiles.length,kpis:data.kpis.length,documents:data.documents.length,models:data.documents.filter(d=>d.doc_type==='BPMN2_PDF').length};assert.deepEqual(counts,{processes:44,profiles:44,kpis:44,documents:90,models:44});result[role].counts=counts;}else result[role].error=data.error;
const denied=await get('/api/org-units',{method:'POST',headers:{cookie,origin:base,'Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,role==='VIEWER'?403:400);result[role].mutationGuard=denied.status;
const out=await get('/logout',{method:'POST',headers:{cookie,origin:base}});assert.equal(out.status,303);}
console.log(JSON.stringify(result,null,2));
