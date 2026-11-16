import{test}from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{chartTrail,chartLink,readChartLink,appendChartVisit,chartHistoryTarget,restoreChartVisits}from'../portal/chart-navigation.ts';

const items=[
 {id:'root',parentId:null,label:'مدیرعامل',kind:'position'},
 {id:'dept',parentId:'root',label:'مدیر فروش',kind:'position'},
 {id:'role:tehran|کارشناس فروش',parentId:'dept',label:'کارشناس فروش',kind:'position'},
 {id:'orphan',parentId:'missing',label:'واحد مستقل',kind:'unit'}
];

test('reporting trail includes all ancestors in organizational order',()=>{
 assert.deepEqual(chartTrail(items,'role:tehran|کارشناس فروش').map(n=>n.label),['مدیرعامل','مدیر فروش','کارشناس فروش']);
 assert.deepEqual(chartTrail(items,'orphan').map(n=>n.id),['orphan']);
 assert.deepEqual(chartTrail(items,'nonexistent'),[]);
 assert.deepEqual(chartTrail([{id:'a',parentId:'b'},{id:'b',parentId:'a'}],'a').map(n=>n.id),['b','a']);
});
test('public and private deep links roundtrip grouped Persian role IDs without credentials',()=>{
 const ref={kind:'position',id:'role:tehran|کارشناس فروش'};
 const publicLink=chartLink('https://example.com/OrgDocsManagementSystem-/#/dashboard','public',ref);
 assert.match(publicLink,/#\/organization\/chart\?/);
 assert.deepEqual(readChartLink(publicLink,'public'),ref);
 const privateLink=chartLink('https://internal.example.com/something?access_token=sensitive','private',ref);
 assert.equal(new URL(privateLink).pathname,'/organization/chart');
 assert.ok(!privateLink.includes('sensitive'));
 assert.deepEqual(readChartLink(privateLink,'private'),ref);
 assert.equal(readChartLink('https://example.com/OrgDocsManagementSystem-/#/dashboard','public'),null);
 assert.equal(readChartLink('https://example.com/#/organization/chart?kind=person&node=x','public'),null);
 assert.equal(readChartLink('https://example.com/#/organization/chart?kind=unit&node=x&node=y','public'),null);
 assert.equal(readChartLink('invalid-url','public'),null);
});
test('visited-card history has previous/next navigation and truncates forward after new visit',()=>{
 const a={kind:'position',id:'a'},b={kind:'position',id:'b'},c={kind:'unit',id:'c'};
 let state=restoreChartVisits(undefined,null);
 state=appendChartVisit(state,a);state=appendChartVisit(state,b);
 assert.equal(state.index,1);
 assert.deepEqual(chartHistoryTarget(state,-1),a);
 assert.equal(chartHistoryTarget(state,1),null);
 state={...state,index:0};
 assert.deepEqual(chartHistoryTarget(state,1),b);
 state=appendChartVisit(state,c);
 assert.deepEqual(state.items,[a,c]);
 assert.deepEqual(appendChartVisit(state,c),state);
 assert.deepEqual(restoreChartVisits({items:[a,{kind:'invalid',id:'x'},b],index:99},null).items,[a,b]);
 assert.deepEqual(restoreChartVisits(null,a),{items:[a],index:0});
});
test('public route detection ignores the selection query and current implementation links cards',async()=>{
 const ui=await readFile(new URL('../portal/ui.tsx',import.meta.url),'utf8');
 const chart=await readFile(new URL('../portal/Chart.tsx',import.meta.url),'utf8');
 const viewport=await readFile(new URL('../portal/ChartViewport.tsx',import.meta.url),'utf8');
 assert.match(ui,/location\.hash\.slice\(1\)\.split\('\?'\)\[0\]/);
 assert.match(chart,/readChartLink/);
 assert.match(chart,/chart-navigation-strip/);
 assert.match(chart,/copyCardLink/);
 assert.match(chart,/chartHistoryTarget/);
 assert.match(viewport,/on-reporting-path/);
 assert.match(viewport,/pathIds\.has/);
});
