import type {Data} from './types';
import type {ChartItem} from './chart-layout';
import {groupPositions} from './position-groups';

export type ChartAnalysisMode = 'normal'|'department'|'processes'|'kpis';
const PALETTE=['#e6f4f1','#e9effb','#f3ebfa','#fdf0e2','#eff2dc','#e6f1f7'];

/** Counts are derived from actual records, never inferred from people or role titles. */
export function enrichChartItems(items:ChartItem[],data:Data,mode:ChartAnalysisMode):ChartItem[]{
 const byId=new Map(items.map(item=>[item.id,item]));
 const children=new Map<string,ChartItem[]>();
 for(const item of items)if(item.parentId&&byId.has(item.parentId)){
  const siblings=children.get(item.parentId)??[];siblings.push(item);children.set(item.parentId,siblings);
 }
 const units=new Map(data.units.map(unit=>[unit.id,unit]));
 const rootColors=new Map<string,number>();
 function colorGroup(unitId:string):number{
  const chain:string[]=[];const seen=new Set<string>();let id:string|null=unitId;
  while(id&&!seen.has(id)){seen.add(id);chain.push(id);id=units.get(id)?.parent_id??null;}
  // Direct children of a single organization root are distinct departments.
  const bucket=chain.length>=2?chain[chain.length-2]:(chain[0]??unitId);
  if(!rootColors.has(bucket))rootColors.set(bucket,rootColors.size);
  return rootColors.get(bucket)!;
 }
 function descendantCount(id:string):number{
  const seen=new Set<string>([id]);const stack=[...(children.get(id)??[])];let count=0;
  while(stack.length){const node=stack.pop()!;if(seen.has(node.id))continue;seen.add(node.id);count++;stack.push(...(children.get(node.id)??[]));}
  return count;
 }
 const metrics=new Map<string,{processes:number}>();
 for(const process of data.nodes)if(process.kind==='PROCESS'&&process.owner_org_unit_id){
  const metric=metrics.get(process.owner_org_unit_id)??{processes:0};
  metric.processes++;
  metrics.set(process.owner_org_unit_id,metric);
 }
 const eligibleKpis=new Set(data.kpis.map(k=>k.id));
 const unitKpis=new Map<string,Set<string>>();
 const roleKpis=new Map<string,Set<string>>();
 const positions=new Map(data.positions.map(p=>[p.id,p]));
 const groups=groupPositions(data.positions);
 const roleIdByPosition=new Map(groups.flatMap(group=>group.members.map(p=>[p.id,group.id] as const)));
 const add=(map:Map<string,Set<string>>,id:string,kpiId:string)=>{
  const values=map.get(id)??new Set<string>();values.add(kpiId);map.set(id,values);
 };
 for(const link of data.kpiOrgLinks??[]){
  if(!eligibleKpis.has(link.kpi_id))continue;
  if(link.org_unit_id)add(unitKpis,link.org_unit_id,link.kpi_id);
  if(link.position_id){
   const position=positions.get(link.position_id);
   if(position)add(unitKpis,position.org_unit_id,link.kpi_id);
   const groupId=roleIdByPosition.get(link.position_id);
   if(groupId)add(roleKpis,groupId,link.kpi_id);
  }
 }
 return items.map(item=>{
  const unitId=item.unitId??(item.kind==='unit'?item.id:null);
  const metric=unitId?metrics.get(unitId):undefined;
  const value=mode==='processes'?metric?.processes??0:mode==='kpis'?(item.kind==='position'?roleKpis.get(item.id)?.size:unitId?unitKpis.get(unitId)?.size:0)??0:undefined;
  const tone=mode==='department'&&unitId?PALETTE[colorGroup(unitId)%PALETTE.length]:
   mode==='processes'&&value?value>=5?'#d1e8fa':'#eaf4fd':
   mode==='kpis'&&value?value>=4?'#e4d7f9':'#f2ebfc':undefined;
  return {...item,descendantCount:descendantCount(item.id),previewChildren:(children.get(item.id)??[]).slice(0,4).map(child=>child.label),analysisValue:value,analysisLabel:mode==='processes'?'فرآیند مرتبط':mode==='kpis'?'شاخص مرتبط':undefined,tone};
 });
}
