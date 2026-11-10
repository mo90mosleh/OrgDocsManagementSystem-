import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile,stat,readdir}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import{resolve,dirname}from'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../pages');
test('public Pages initial HTML is small and links cached, fingerprinted assets',async()=>{
 const html=await readFile(resolve(root,'index.html'),'utf8');
 assert.ok(Buffer.byteLength(html,'utf8')<16000,'HTML must not inline the application mega-bundle');
 assert.match(html,/<script type="module" src="\.\/assets\/main-[A-Z0-9]+\.js"><\/script>/);
 assert.match(html,/<link rel="stylesheet" href="\.\/assets\/main-[A-Z0-9]+\.css">/);
 const refs=[...html.matchAll(/(?:href|src)="\.\/(assets\/[^"]+\.(?:js|css))"/g)].map(match=>match[1]);
 assert.ok(refs.length>=2);
 for(const relative of refs)assert.ok((await stat(resolve(root,relative))).size>0,relative);
});
test('expensive chart and architecture are emitted as route-specific chunks',async()=>{
 const filenames=await readdir(resolve(root,'assets/chunks'));
 assert.ok(filenames.some(name=>/^Chart-.*\.js$/.test(name)),'chart module should be deferred');
 assert.ok(filenames.some(name=>/^Architecture-.*\.js$/.test(name)),'architecture module should be deferred');
});
