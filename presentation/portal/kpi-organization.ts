import type{Data,KPI}from'./types';
import{groupPositions}from'./position-groups';
export function kpiOrganization(data:Data,kpiId:string){
 const links=(data.kpiOrgLinks??[]).filter(l=>l.kpi_id===kpiId);
 const positions=data.positions.filter(p=>links.some(l=>l.position_id===p.id));
 const unitIds=new Set([...links.flatMap(l=>l.org_unit_id?[l.org_unit_id]:[]),...positions.map(p=>p.org_unit_id)]);
 const units=data.units.filter(u=>unitIds.has(u.id));
 const hasUnit=links.some(l=>l.org_unit_id),hasPosition=positions.length>0;
 const scope=hasUnit&&hasPosition?'SHARED':hasPosition?'POSITION':hasUnit?'DEPARTMENT':'UNASSIGNED';
 return{scope,label:scope==='POSITION'?'سمت سازمانی':scope==='DEPARTMENT'?'دپارتمان':scope==='SHARED'?'سمت و دپارتمان':'بدون ارتباط',units,positions,roles:groupPositions(positions)};
}
export function matchesKpiOrganization(data:Data,kpi:KPI,unitId='',positionId=''){
 const links=(data.kpiOrgLinks??[]).filter(l=>l.kpi_id===kpi.id);
 if(positionId){
  const group=groupPositions(data.positions).find(p=>p.id===positionId);
  const ids=new Set(group?group.members.map(p=>p.id):[positionId]);
  return links.some(l=>!!l.position_id&&ids.has(l.position_id));
 }
 if(unitId)return links.some(l=>l.org_unit_id===unitId||data.positions.some(p=>p.id===l.position_id&&p.org_unit_id===unitId));
 return true;
}
