import type {Data} from './types';
import type {ChartItem} from './chart-layout';

export type ChartAnalysisMode = 'normal'|'department'|'processes'|'drafts';
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
 const metrics=new Map<string,{processes:number;drafts:number}>();
 for(const process of data.nodes)if(process.kind==='PROCESS'&&process.owner_org_unit_id){
  const metric=metrics.get(process.owner_org_unit_id)??{processes:0,drafts:0};
  metric.processes++;if(process.content_status==='DRAFT')metric.drafts++;
  metrics.set(process.owner_org_unit_id,metric);
 }
 return items.map(item=>{
  const unitId=item.unitId??(item.kind==='unit'?item.id:null);
  const metric=unitId?metrics.get(unitId):undefined;
  const value=mode==='processes'?metric?.processes??0:mode==='drafts'?metric?.drafts??0:undefined;
  const tone=mode==='department'&&unitId?PALETTE[colorGroup(unitId)%PALETTE.length]:
   mode==='processes'&&value?value>=5?'#d1e8fa':'#eaf4fd':
   mode==='drafts'&&value?value>=4?'#ffe3bd':'#fff1dd':undefined;
  return {...item,descendantCount:descendantCount(item.id),previewChildren:(children.get(item.id)??[]).slice(0,4).map(child=>child.label),analysisValue:value,analysisLabel:mode==='processes'?'فرآیند مرتبط':mode==='drafts'?'شناسنامهٔ پیش‌نویس':undefined,tone};
 });
}
