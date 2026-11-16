import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {enrichChartItems} from '../portal/chart-insights.ts';

const item=(id,parentId,unitId=id)=>({id,parentId,label:id,unitId,kind:'unit',closed:false,childCount:0,selected:false});
const items=[item('root',null),item('a','root'),item('a1','a'),item('a2','a'),item('b','root')];
const data={
 kpis:[{id:'k1'},{id:'k2'},{id:'k3'},{id:'k4'}],
 positions:[{id:'p1',org_unit_id:'a',title:'کارشناس فروش',reports_to_position_id:null},{id:'p2',org_unit_id:'a',title:'کارشناس فروش',reports_to_position_id:null},{id:'p3',org_unit_id:'b',title:'کارشناس مالی',reports_to_position_id:null}],
 kpiOrgLinks:[{kpi_id:'k1',org_unit_id:'a',position_id:null},{kpi_id:'k2',org_unit_id:null,position_id:'p1'},{kpi_id:'k2',org_unit_id:null,position_id:'p2'},{kpi_id:'k3',org_unit_id:null,position_id:'p2'},{kpi_id:'k4',org_unit_id:null,position_id:'p3'}],
 units:[{id:'root',parent_id:null},{id:'a',parent_id:'root'},{id:'a1',parent_id:'a'},{id:'a2',parent_id:'a'},{id:'b',parent_id:'root'}],
 nodes:[
  {id:'p1',kind:'PROCESS',owner_org_unit_id:'a',content_status:'DRAFT'},
  {id:'p2',kind:'PROCESS',owner_org_unit_id:'a',content_status:'APPROVED'},
  {id:'p3',kind:'PROCESS',owner_org_unit_id:'b',content_status:'DRAFT'},
  {id:'g1',kind:'GROUP',owner_org_unit_id:'a',content_status:'DRAFT'}
 ]
};
test('direct child count and all descendants remain distinct',()=>{
 const annotated=enrichChartItems(items,data,'normal');
 assert.equal(annotated.find(n=>n.id==='root').descendantCount,4);
 assert.equal(annotated.find(n=>n.id==='a').descendantCount,2);
 assert.deepEqual(annotated.find(n=>n.id==='a').previewChildren,['a1','a2']);
 assert.equal(annotated.find(n=>n.id==='b').descendantCount,0);
});
test('analytics are scoped to real unit-owned processes and directly mapped KPIs',()=>{
 const counts=enrichChartItems(items,data,'processes');
 assert.equal(counts.find(n=>n.id==='a').analysisValue,2);
 assert.equal(counts.find(n=>n.id==='a1').analysisValue,0);
 const kpis=enrichChartItems(items,data,'kpis');
 assert.equal(kpis.find(n=>n.id==='a').analysisValue,3);
 assert.equal(kpis.find(n=>n.id==='b').analysisValue,1);
 assert.equal(kpis.find(n=>n.id==='root').analysisValue,0);
 assert.equal(kpis.find(n=>n.id==='a').tone,'#f2ebfc');
 const role={id:'role:a|کارشناس فروش',parentId:null,label:'کارشناس فروش',unitId:'a',kind:'position',closed:false,childCount:0,selected:false};
 const roleMetrics=enrichChartItems([role],data,'kpis');
 assert.equal(roleMetrics[0].analysisValue,2,'position-specific KPIs exclude department-only ones');
});
test('department colors use real organization branches and do not recolor default mode',()=>{
 const regular=enrichChartItems(items,data,'normal');
 assert.equal(regular.find(n=>n.id==='a').tone,undefined);
 const colors=enrichChartItems(items,data,'department');
 assert.equal(colors.find(n=>n.id==='a').tone,colors.find(n=>n.id==='a1').tone);
 assert.notEqual(colors.find(n=>n.id==='a').tone,colors.find(n=>n.id==='b').tone);
});
test('the canvas remains full width and card click directly reveals KPI-first details',async()=>{
 const chart=await readFile(new URL('../portal/Chart.tsx',import.meta.url),'utf8');
 const viewport=await readFile(new URL('../portal/ChartViewport.tsx',import.meta.url),'utf8');
 assert.match(chart,/chart-layout-full/);
 assert.doesNotMatch(chart,/with-detail/);
 assert.match(chart,/detailsOpen/);
 assert.doesNotMatch(viewport,/node-linked-trigger/);assert.match(chart,/function choose\(id:string\).*setDetailsOpen\(true\)/);assert.match(chart,/value=\{relatedTab\}/);
 assert.match(viewport,/chart-zoom-overview/);
 assert.match(viewport,/chart-node-preview/);
});
