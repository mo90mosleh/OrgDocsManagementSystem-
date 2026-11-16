import{test}from'node:test';
import assert from'node:assert/strict';
import{sampleAutumn1405}from'../portal/okr/sample.ts';
import{expectedCycleProgress,objectivePace,registerCheckIn}from'../portal/okr/model.ts';

const date=(text)=>new Date(text+'T12:00:00Z');
function portfolioAt(percent){
 const data=sampleAutumn1405();
 const cycle=data.cycles.find(c=>c.id==='1405-fall');
 cycle.startDate='2026-09-01';
 cycle.endDate='2026-11-30'; // 90 calendar-day span
 data.keyResults=[{id:'kr-timed',objectiveId:'obj-company',title:'افزایش عددی تحقق',baseline:0,current:percent,target:100,unit:'٪',kpiId:null,weight:1}];
 // A legacy stored badge may disagree with the computed pace: it must be ignored.
 data.objectives.find(o=>o.id==='obj-company').confidence='ON_TRACK';
 return data;
}
test('expected pace equals the time share of the selected quarter',()=>{
 const {cycles}=portfolioAt(0),cycle=cycles.find(c=>c.id==='1405-fall');
 assert.equal(expectedCycleProgress(cycle,date('2026-08-31')),0);
 assert.equal(expectedCycleProgress(cycle,date('2026-09-01')),0);
 assert.equal(expectedCycleProgress(cycle,date('2026-10-01')),33);
 assert.equal(expectedCycleProgress(cycle,date('2026-10-16')),50);
 assert.equal(expectedCycleProgress(cycle,date('2026-11-30')),100);
 assert.equal(expectedCycleProgress(cycle,date('2026-12-01')),100);
 assert.equal(expectedCycleProgress({...cycle,startDate:'',endDate:''},date('2026-10-01')),null);
 assert.equal(expectedCycleProgress({...cycle,startDate:'2026-12-01',endDate:'2026-11-30'},date('2026-10-01')),null);
});
test('status automatically compares actual progress with elapsed time, including 40% rule and a 15pp serious-delay band',()=>{
 const asOf=date('2026-10-01'); // ~one month of a quarter = 33% required
 assert.deepEqual(objectivePace(portfolioAt(33),'obj-company',asOf),{status:'ON_TRACK',actual:33,expected:33,gap:0});
 assert.deepEqual(objectivePace(portfolioAt(32),'obj-company',asOf),{status:'AT_RISK',actual:32,expected:33,gap:-1});
 assert.equal(objectivePace(portfolioAt(18),'obj-company',asOf).status,'AT_RISK');
 assert.equal(objectivePace(portfolioAt(17),'obj-company',asOf).status,'OFF_TRACK');
 assert.equal(objectivePace(portfolioAt(90),'obj-company',asOf).status,'ON_TRACK');
 // Progress bar coloring is a separate rule, not a source of time status.
 assert.equal(objectivePace(portfolioAt(39),'obj-company',asOf).status,'ON_TRACK');
 assert.equal(objectivePace(portfolioAt(33),'obj-company',date('2026-08-31')).status,'NOT_STARTED');
 assert.equal(objectivePace(portfolioAt(100),'obj-company',date('2026-11-30')).status,'ON_TRACK');
 assert.equal(objectivePace(portfolioAt(99),'obj-company',date('2026-11-30')).status,'AT_RISK');
});
test('missing KRs or dates yield a neutral status rather than incorrectly showing on track',()=>{
 const data=portfolioAt(30);
 assert.equal(objectivePace(data,'obj-sales',date('2026-10-01')).status,'NO_DATA');
 assert.equal(objectivePace(data,'missing',date('2026-10-01')).status,'NO_DATA');
 data.cycles[0].startDate='';
 assert.equal(objectivePace(data,'obj-company',date('2026-10-01')).status,'NO_DATA');
});
test('check-ins recalculate the status without taking it from an editable confidence dropdown',()=>{
 const original=portfolioAt(10);
 const next=registerCheckIn(original,{keyResultId:'kr-timed',value:40,note:'پیشرفت واقعی ثبت شد'},date('2026-10-01').toISOString());
 assert.equal(original.keyResults[0].current,10);
 assert.equal(next.keyResults[0].current,40);
 assert.equal(next.checkins.at(-1).confidence,'ON_TRACK');
 assert.equal(next.objectives.find(x=>x.id==='obj-company').confidence,'ON_TRACK');
 assert.equal(objectivePace(next,'obj-company',date('2026-10-01')).status,'ON_TRACK');
 assert.equal(objectivePace(next,'obj-company',date('2026-11-01')).status,'OFF_TRACK'); // time advances even without another check-in
 const late=registerCheckIn(original,{keyResultId:'kr-timed',value:17,note:''},date('2026-10-01').toISOString());
 assert.equal(late.checkins.at(-1).confidence,'OFF_TRACK');
});
test('workspace renders time-based status in every OKR view and removes manual confidence selection',async()=>{
 const{readFile}=await import('node:fs/promises');
 const src=await readFile(new URL('../portal/okr/OkrWorkspace.tsx',import.meta.url),'utf8');
 assert.match(src,/objectivePace\(portfolio,g\.id,today\)/);
 assert.match(src,/expectedCycleProgress\(cycle,today\)/);
 assert.match(src,/value=\{pace\(g\)\.status\}/);
 assert.match(src,/value=\{pace\(selected\)\.status\}/);
 assert.match(src,/مورد انتظار تا امروز/);
 assert.doesNotMatch(src,/name="confidence"/);
 assert.match(src,/visibilitychange/);
});
