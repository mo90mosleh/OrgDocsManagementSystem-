import{readFile,writeFile}from'node:fs/promises';
// Distribute the original license notices for all installed production packages.
const lock=JSON.parse(await readFile('package-lock.json','utf8')),notices=[];
for(const [path,info]of Object.entries(lock.packages??{})){
 if(!path.startsWith('node_modules/')||info.dev)continue;
 const pkg=JSON.parse(await readFile(path+'/package.json','utf8'));
 for(const file of ['LICENSE','LICENSE.md','LICENSE.txt','LICENSE-MIT','license','license.md','LICENCE','LICENSE-MIT.txt']){
  try{const notice=await readFile(path+'/'+file,'utf8');notices.push(`${pkg.name} ${pkg.version} (${pkg.license??'see notice'})\n${notice}`);break;}catch{}
 }
}
await writeFile('pages/THIRD_PARTY_LICENSES.txt',notices.join('\n\n'+'='.repeat(72)+'\n\n'));
