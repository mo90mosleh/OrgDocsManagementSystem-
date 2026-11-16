import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{sampleAutumn1405}from'../portal/okr/sample.ts';
import{findProductHelp}from'../supabase/functions/namayar-groq-test/product-guide.ts';
import{activeObjectives,averageProgress,keyResultProgress,objectiveProgress,portfolioIsValid,registerCheckIn,withKeyResult,withObjective}from'../portal/okr/model.ts';

const data=JSON.parse(await readFile(new URL('../data/rassan-presentation.json',import.meta.url),'utf8'));
test('Autumn 1405 demo stays separate from live records and references existing organization entities',()=>{
 const demo=sampleAutumn1405();
 assert.equal(demo.cycles.find(c=>c.id==='1405-fall')?.title,'پاییز ۱۴۰۵');
 assert.ok(demo.objectives.length>=4);
 assert.ok(demo.keyResults.length>=8);
 assert.ok(portfolioIsValid(demo));
 for(const objective of demo.objectives){
  if(objective.ownerUnitId)assert.ok(data.units.some(u=>u.id===objective.ownerUnitId),'unknown unit '+objective.ownerUnitId);
  if(objective.parentId)assert.ok(demo.objectives.some(o=>o.id===objective.parentId),'unknown parent '+objective.parentId);
  for(const processId of objective.processIds)assert.ok(data.nodes.some(p=>p.id===processId&&p.kind==='PROCESS'),'unknown process '+processId);
 }
 for(const kr of demo.keyResults){
  assert.ok(demo.objectives.some(o=>o.id===kr.objectiveId));
  if(kr.kpiId)assert.ok(data.kpis.some(k=>k.id===kr.kpiId),'unknown KPI '+kr.kpiId);
 }
 assert.equal(data.nodes.some(n=>n.id==='obj-company'),false,'demo OKRs must not become real business process nodes');
 const again=sampleAutumn1405();again.objectives[0].title='changed';
 assert.notEqual(demo.objectives[0].title,again.objectives[0].title);
});
test('KR progress supports decreasing targets, weights and zero progress',()=>{
 assert.equal(keyResultProgress({baseline:10,target:5,current:7.5}),50);
 assert.equal(keyResultProgress({baseline:5,target:10,current:7.5}),50);
 assert.equal(keyResultProgress({baseline:5,target:10,current:15}),100);
 assert.equal(keyResultProgress({baseline:10,target:5,current:15}),0);
 assert.equal(keyResultProgress({baseline:5,target:5,current:5}),100);
 const demo=sampleAutumn1405();
 assert.ok(averageProgress(demo,'1405-fall')>=0);
 assert.equal(averageProgress(demo,'1405-winter'),0);
 for(const goal of activeObjectives(demo,'1405-fall'))assert.ok(objectiveProgress(demo,goal.id)>=0&&objectiveProgress(demo,goal.id)<=100);
});
test('check-in records prior/current values without mutating input and updates objective confidence',()=>{
 const demo=sampleAutumn1405(),kr=demo.keyResults[0],before=kr.current;
 const next=registerCheckIn(demo,{keyResultId:kr.id,value:2.8,confidence:'ON_TRACK',note:'آزمون ثبت پیشرفت'},'2026-11-16T08:00:00.000Z');
 assert.equal(demo.keyResults[0].current,before);
 assert.equal(next.keyResults[0].current,2.8);
 assert.equal(next.checkins.at(-1).previous,before);
 assert.equal(next.checkins.at(-1).value,2.8);
 assert.equal(next.objectives.find(o=>o.id===kr.objectiveId).confidence,'ON_TRACK');
 assert.throws(()=>registerCheckIn(demo,{keyResultId:'missing',value:1,confidence:'ON_TRACK',note:''},'2026-11-16T08:00:00Z'));
 assert.throws(()=>registerCheckIn(demo,{keyResultId:kr.id,value:NaN,confidence:'ON_TRACK',note:''},'2026-11-16T08:00:00Z'));
});
test('new objectives and KRs can be drafted without editing the organization KPI catalog',()=>{
 const portfolio=sampleAutumn1405(),newId='obj-custom';
 const next=withObjective(portfolio,{...portfolio.objectives[0],id:newId,code:'O-CUSTOM',title:'توسعه زیرساخت تحلیل اطلاعات',parentId:'obj-company',level:'DEPARTMENT'});
 const updated=withKeyResult(next,{...portfolio.keyResults[0],id:'kr-custom',objectiveId:newId,title:'کاهش مدت ثبت گزارش از ۵ به ۲ روز',current:5,baseline:5,target:2,kpiId:null});
 assert.equal(portfolio.objectives.length+1,updated.objectives.length);
 assert.equal(portfolio.keyResults.length+1,updated.keyResults.length);
 assert.equal(portfolio.objectives.some(o=>o.id===newId),false);
 assert.equal(objectiveProgress(updated,newId),0);
});
test('OKR module lives in the shared Nama workspace rather than a second vertical sidebar',async()=>{
 const app=await readFile(new URL('../portal/App.tsx',import.meta.url),'utf8');
 const shell=await readFile(new URL('../portal/Shell.tsx',import.meta.url),'utf8');
 const workspace=await readFile(new URL('../portal/okr/OkrWorkspace.tsx',import.meta.url),'utf8');
 assert.match(app,/path==='\/okr'/);
 assert.match(shell,/\['\/okr','مدیریت OKR'/);
 assert.match(workspace,/className="okr-tabs"/);
 assert.match(workspace,/className="okr-detail"/);
 assert.doesNotMatch(workspace,/className="sidebar"/);
});

test('Namayar product help routes OKR questions to the integrated workspace',()=>{
 const topic=findProductHelp('در نما مدیریت OKR چه امکاناتی دارد؟');
 assert.equal(topic?.id,'okr-management');
 assert.equal(topic?.route,'/okr');
 assert.ok(topic.paragraphs.some(p=>p.includes('پاییز ۱۴۰۵')));
});

test('cycle directory replaces the demo-data banner and offers creation from the directory',async()=>{
 const workspace=await readFile(new URL('../portal/okr/OkrWorkspace.tsx',import.meta.url),'utf8');
 const shell=await readFile(new URL('../portal/Shell.tsx',import.meta.url),'utf8');
 assert.match(workspace,/aria-label="مدیریت دوره‌های OKR"/);
 assert.match(workspace,/portfolio\.cycles\.map\(c=>/);
 assert.match(workspace,/showForm\('cycle'\)/);
 assert.match(workspace,/cycleManagerOpen/);
 assert.match(workspace,/cycleObjectives\.length/);
 assert.doesNotMatch(workspace,/okr-demo-banner/);
 assert.match(shell,/hideBreadcrumb=path==='\/architecture'\|\|path==='\/okr'\|\|path==='\/kpis'\|\|path\.startsWith\('\/kpis\/'\)/);
 assert.match(shell,/\{!hideBreadcrumb&&<div className="breadcrumb"/);
});
