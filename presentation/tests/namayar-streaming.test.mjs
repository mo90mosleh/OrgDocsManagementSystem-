import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{GroqPilotAdapter}from'../portal/namayar/LLMAdapter.ts';
import{allowedKnowledge,resolveContext}from'../portal/namayar/context.ts';

const raw=JSON.parse(await readFile(new URL('../data/rassan-presentation.json',import.meta.url),'utf8'));
const data=allowedKnowledge(raw),context=resolveContext(data,'/organization/chart');

test('Groq streaming mode progressively yields Unicode deltas and validates final links',async()=>{
 const previous=globalThis.fetch,encoder=new TextEncoder(),parts=[];
 try{
  globalThis.fetch=async(_url,opts)=>{
   const request=JSON.parse(String(opts.body));
   assert.equal(request.stream,true);
   const bytes=encoder.encode(JSON.stringify({type:'delta',text:'پاسخ قسمت اول'})+'\n');
   const tail=encoder.encode(JSON.stringify({type:'delta',text:' و ادامهٔ پاسخ'})+'\n'+JSON.stringify({type:'done',links:[{href:'/organization/chart',label:'چارت سازمانی'}]})+'\n');
   const stream=new ReadableStream({start(controller){
    controller.enqueue(bytes.slice(0,7));
    queueMicrotask(()=>{controller.enqueue(bytes.slice(7));controller.enqueue(tail);controller.close();});
   }});
   return new Response(stream,{headers:{'content-type':'application/x-ndjson; charset=utf-8'}});
  };
  const answer=await new GroqPilotAdapter().answer('رنگ‌بندی چارت چیه؟',context,data,new AbortController().signal,[],v=>parts.push(v));
  assert.deepEqual(parts,['پاسخ قسمت اول',' و ادامهٔ پاسخ']);
  assert.equal(answer.paragraphs.join(''),'پاسخ قسمت اول و ادامهٔ پاسخ');
  assert.ok(answer.links.every(l=>l.href==='/organization/chart'));
 }finally{globalThis.fetch=previous;}
});
test('Cached JSON assistant answers remain usable with a streaming callback',async()=>{
 const previous=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(JSON.stringify({paragraphs:['متن آماده'],links:[]}),{headers:{'content-type':'application/json'}});
  const received=[];
  const reply=await new GroqPilotAdapter().answer('امکانات نما چیه؟',context,data,new AbortController().signal,[],v=>received.push(v));
  assert.deepEqual(received,[]);
  assert.deepEqual(reply.paragraphs,['متن آماده']);
 }finally{globalThis.fetch=previous;}
});
test('Chat keeps response in-place without auto-scroll to the bottom on every token',async()=>{
 const ui=await readFile(new URL('../portal/namayar/Namayar.tsx',import.meta.url),'utf8');
 const css=await readFile(new URL('../portal/namayar/style.css',import.meta.url),'utf8');
 const gateway=await readFile(new URL('../supabase/functions/namayar-groq-test/index.ts',import.meta.url),'utf8');
 assert.match(ui,/conversationScroller/);
 assert.match(ui,/namayar-stream-caret/);
 assert.doesNotMatch(ui,/end\.current\?\.scrollIntoView/);
 assert.match(css,/overflow-anchor:none/);
 assert.match(gateway,/ReadableStream<Uint8Array>/);
 assert.match(gateway,/type:"delta"/);
 assert.match(gateway,/type:"done"/);
});
