import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{findProductHelp,classifyQuestionIntent,normalizedHelpQuestion,productHelpTopics}from'../supabase/functions/namayar-groq-test/product-guide.ts';
import{allowedKnowledge,resolveContext}from'../portal/namayar/context.ts';
import{answerQuestion}from'../portal/namayar/engine.ts';

const raw=JSON.parse(await readFile(new URL('../data/rassan-presentation.json',import.meta.url),'utf8'));
const data=allowedKnowledge(raw);
const card=data.positions.find(p=>p.title.includes('کارشناس مالی'))??data.positions[0];
const ctx=resolveContext(data,'/organization/chart',{kind:'position',id:card.id});

test('general chart-color question is answered while a finance role is selected',()=>{
 const q='رنگ چارت بر اساس تعداد فرآیندها یعنی چی؟';
 assert.equal(findProductHelp(q)?.id,'chart-colors');
 assert.equal(classifyQuestionIntent(q),'product');
 const answer=answerQuestion(data,ctx,q);
 const t=answer.paragraphs.join(' ');
 assert.match(t,/۱ تا ۴/);
 assert.match(t,/۵ فرآیند/);
 assert.match(t,/دپارتمان/);
 assert.match(t,/تعداد شاخص‌ها/);
 assert.doesNotMatch(t,/اطلاعاتی.*در دسترس نیست/);
 assert.equal(answer.links[0].href,'/organization/chart');
});
test('platform capability and process profile answers come from verified current features, not selected card',()=>{
 const answers=[
  ['چه امکاناتی نما داره؟','platform-overview','/dashboard'],
  ['چطور میشه چارت سازمانی رو جستجو و زوم کرد؟','chart-navigation','/organization/chart'],
  ['نحوه اتصال KPI به سمت و دپارتمان چطوره؟','kpi-ownership','/kpis'],
  ['امکانات شناسنامه فرآیند شامل چه بخش‌هایی هست؟','process-profiles','/processes']
 ];
 for(const [q,id,route]of answers){
  assert.equal(findProductHelp(q)?.id,id,q);
  const answer=answerQuestion(data,ctx,q);
  assert.equal(answer.links[0].href,route,q);
  assert.ok(answer.paragraphs.join(' ').length>65,q);
 }
 assert.ok(productHelpTopics.length>=10);
});
test('Persian ZWNJ and Yeh/Kaf variants normalize without corrupting question focus',()=>{
 assert.equal(normalizedHelpQuestion('رنگ‌بندی چارت؟'),'رنگ بندی چارت');
 assert.equal(findProductHelp('رنگ‌بندیِ چارت بر اساس فرآیندها چیه؟')?.id,'chart-colors');
 assert.equal(classifyQuestionIntent('رنگ بندی کارت ها چیه؟'),'product');
});
test('deictic selected-KPI questions stay contextual and are not replaced with generic guidance',()=>{
 for(const q of ['این شاخص چطور محاسبه می‌شود؟','شاخص‌های این سمت چیه؟','فرمول این شاخص چیه؟']){
  assert.equal(findProductHelp(q),null,q);
  assert.equal(classifyQuestionIntent(q),'entity',q);
 }
 assert.equal(classifyQuestionIntent('هوای تهران چطوره؟'),'general');
 assert.equal(classifyQuestionIntent('شاخص توده بدنی چیه؟'),'general');
});
test('position KPIs use explicit position mappings and do not silently inherit all unit KPIs',()=>{
 const direct=(data.kpiOrgLinks??[]).find(link=>Boolean(link.position_id));
 assert.ok(direct,'fixture should include at least one directly mapped KPI');
 const group=data.positions.find(p=>p.memberIds.includes(direct.position_id));
 assert.ok(group,'mapped position belongs to a visible grouped role');
 const c=resolveContext(data,'/organization/chart',{kind:'position',id:group.id});
 const r=answerQuestion(data,c,'شاخص‌های این سمت رو نشون بده');
 assert.ok(r.links.some(l=>l.href==='/kpis/'+direct.kpi_id));
 assert.ok(r.links.every(l=>data.kpiOrgLinks.some(k=>k.kpi_id===l.href.split('/').at(-1)&&group.memberIds.includes(k.position_id))));
});
test('Edge gateway separates independent questions from page entity and bundles product guide',async()=>{
 const source=await readFile(new URL('../supabase/functions/namayar-groq-test/index.ts',import.meta.url),'utf8');
 assert.match(source,/classifyQuestionIntent/);
 assert.match(source,/intent==='entity'\?entity:null/);
 assert.match(source,/findProductHelp\(question\)/);
 assert.match(source,/productHelpTopics\.map/);
 assert.match(source,/mode:'product-guide'/);
});
