import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
if(process.stdin.isTTY)spawnSync('stty',['-echo'],{stdio:'inherit'});
console.log('Ready for Site workflow JSON on stdin (input is hidden).');
const reader=createInterface({input:process.stdin});
const input=await new Promise(resolve=>reader.once('line',line=>{reader.close();resolve(JSON.parse(line));}));
const credential=input.credential;
const env={...process.env,GIT_TERMINAL_PROMPT:'0'};
if(credential.token){env.GIT_CONFIG_COUNT='1';env.GIT_CONFIG_KEY_0='http.extraHeader';env.GIT_CONFIG_VALUE_0='Authorization: Bearer '+credential.token;}
function run(command,args){const r=spawnSync(command,args,{env,encoding:'utf8'});if(r.status!==0)throw new Error((r.stderr||command+' failed').replaceAll(credential.token||'__none__','[redacted]'));return r.stdout.trim();}
const manifest=JSON.parse(await readFile('.openai/hosting.json','utf8'));
run('git',['remote','set-url','origin',credential.remote_url]);
if(!input.archivePath){run('git',['fetch','origin',credential.branch]);run('git',['merge','--ff-only','FETCH_HEAD']);console.log(JSON.stringify({project_id:manifest.project_id,checkout_path:process.cwd(),commit_sha:run('git',['rev-parse','HEAD'])}));}
else{for(const [cmd,...args] of input.commands??[])run(cmd,args);run('git',['add','.']);if(run('git',['status','--porcelain']))run('git',['commit','-m','Add Sana-style demo feedback and GitHub Pages presentation build']);run('git',['push','origin','HEAD:'+credential.branch]);run('tar',['-czf',input.archivePath,'.openai/hosting.json','dist/server/index.js']);console.log(JSON.stringify({project_id:manifest.project_id,commit_sha:run('git',['rev-parse','HEAD']),archive:input.archivePath}));}
