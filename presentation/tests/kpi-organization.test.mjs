import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
import{kpiOrganization,matchesKpiOrganization}from'../portal/kpi-organization.ts';
import{groupPositions}from'../portal/position-groups.ts';
import{chartLinks}from'../portal/chart-links.ts';
const d=JSON.parse(await readFile('data/rassan-presentation.json','utf8'));
test('all sample indicators have valid direct relationships and one evaluation level',()=>{
 let positions=0,units=0;
 for(const k of d.kpis){const info=kpiOrganization(d,k.id);assert.ok(['POSITION','DEPARTMENT'].includes(info.scope),k.code);assert.ok(info.units.length,k.code);if(info.scope==='POSITION')positions++;else units++;}
 assert.equal(positions,17);assert.equal(units,27);
 for(const l of d.kpiOrgLinks){assert.ok(d.kpis.some(k=>k.id===l.kpi_id));assert.ok(Boolean(l.position_id)!==Boolean(l.org_unit_id));if(l.position_id)assert.ok(d.positions.some(p=>p.id===l.position_id));else assert.ok(d.units.some(u=>u.id===l.org_unit_id));}
});
test('same-unit roles have different indicators; all seats of the same role match without duplicate KPIs',()=>{
 const unit=d.units.find(u=>u.name==='فروش تهران');
 const groups=groupPositions(d.positions).filter(p=>p.org_unit_id===unit.id),expert=groups.find(p=>p.title==='کارشناس فروش'),manager=groups.find(p=>p.title==='مدیر فروش تهران');
 const expertKPIs=d.kpis.filter(k=>matchesKpiOrganization(d,k,unit.id,expert.id)),managerKPIs=d.kpis.filter(k=>matchesKpiOrganization(d,k,unit.id,manager.id));
 assert.deepEqual(expertKPIs.map(k=>k.code),['KPI-RAS-U027']);assert.deepEqual(managerKPIs.map(k=>k.code),['KPI-RAS-U028']);
 for(const seat of expert.members)assert.ok(matchesKpiOrganization(d,expertKPIs[0],unit.id,seat.id));
 assert.equal(chartLinks(d,unit.id,expert.id).kpis.length,1);
 assert.ok(matchesKpiOrganization(d,expertKPIs[0],unit.id));
});
test('process ownership never invents a direct KPI assignment; missing links stay unassigned',()=>{
 const without={...d,kpiOrgLinks:[]};assert.equal(kpiOrganization(without,d.kpis[0].id).scope,'UNASSIGNED');assert.equal(chartLinks(without,d.units[0].id).kpis.length,0);
});
