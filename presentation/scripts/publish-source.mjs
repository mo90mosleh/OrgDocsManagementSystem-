// Fallback for this executor, where the packaged Sites source helper is absent.
// Credential is accepted only over stdin and retained in process memory.
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
const project=JSON.parse(await readFile('.openai/hosting.json','utf8')).project_id;
if(process.stdin.isTTY)spawnSync('stty',['-echo'],{stdio:'inherit'});
console.log('Ready for Sites source credential JSON on stdin (input is hidden).');
const reader=createInterface({input:process.stdin});
const credential=await new Promise(resolve=>reader.once('line',line=>{reader.close();resolve(JSON.parse(line));}));
function run(args,extraEnv={}){const result=spawnSync(args[0],args.slice(1),{env:{...process.env,...extraEnv},encoding:'utf8'});if(result.status!==0)throw new Error(args[0]+' failed: '+result.stderr.replaceAll(credential.token||'__no_token__','[redacted]'));return result.stdout.trim();}
const env={GIT_TERMINAL_PROMPT:'0'};
if(credential.token){env.GIT_CONFIG_COUNT='1';env.GIT_CONFIG_KEY_0='http.extraHeader';env.GIT_CONFIG_VALUE_0='Authorization: Bearer '+credential.token;}
run(['git','init','-b',credential.branch||'main']);
run(['git','config','user.name','Codex']);run(['git','config','user.email','codex@openai.com']);
run(['git','add','.']);run(['git','commit','-m','Build isolated Persian management demo with Supabase']);
run(['git','remote','add','origin',credential.remote_url]);
run(['git','push','-u','origin',credential.branch||'main'],env);
const sha=run(['git','rev-parse','HEAD']);
run(['npm','run','build']);run(['npm','test']);
const archive='/workspace/sites/orgdocs-demo-deploy.tar.gz';
run(['tar','-czf',archive,'-C','dist','.']);
console.log(JSON.stringify({project_id:project,commit_sha:sha,archive}));
