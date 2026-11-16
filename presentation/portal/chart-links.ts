import type{Data}from'./types';
import{matchesKpiOrganization}from'./kpi-organization';
export function chartLinks(data:Data,unitId:string,positionId=''){
 const processes=data.nodes.filter(n=>n.kind==='PROCESS'&&n.owner_org_unit_id===unitId);
 return{processes,kpis:data.kpis.filter(k=>matchesKpiOrganization(data,k,unitId,positionId))};
}
