import type{Data}from'./types';
// Use stored ownership and process/KPI links; a position is scoped through its unit.
export function chartLinks(data:Data,unitId:string){
 const processes=data.nodes.filter(n=>n.kind==='PROCESS'&&n.owner_org_unit_id===unitId);
 const ids=new Set(processes.map(p=>p.id));
 const kpiIds=new Set(data.links.filter(l=>ids.has(l.process_id)).map(l=>l.kpi_id));
 return{processes,kpis:data.kpis.filter(k=>kpiIds.has(k.id))};
}
