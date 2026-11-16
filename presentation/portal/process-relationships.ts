import type{Data,Process,ProcessRelation,ProcessRelationType}from'./types';
export const processRelationTypes:Record<ProcessRelationType,string>={
 RELATED:'مرتبط با',PREREQUISITE:'پیش‌نیاز',INPUT_FROM:'دریافت ورودی از',OUTPUT_TO:'ارسال خروجی به'
};
export const directionalRelations=new Set<ProcessRelationType>(['PREREQUISITE','INPUT_FROM','OUTPUT_TO']);
export function validRelation(pair:Pick<ProcessRelation,'source_process_id'|'target_process_id'|'relation_type'>,nodes:Process[]):boolean{
 const ids=new Set(nodes.filter(n=>n.kind==='PROCESS').map(n=>n.id));
 return pair.source_process_id!==pair.target_process_id&&ids.has(pair.source_process_id)&&ids.has(pair.target_process_id)&&pair.relation_type in processRelationTypes;
}
export function duplicateRelation(relations:ProcessRelation[],candidate:ProcessRelation,excludeId?:string):boolean{
 return relations.some(r=>r.id!==excludeId&&r.relation_type===candidate.relation_type&&(
  r.source_process_id===candidate.source_process_id&&r.target_process_id===candidate.target_process_id||
  candidate.relation_type==='RELATED'&&r.source_process_id===candidate.target_process_id&&r.target_process_id===candidate.source_process_id
 ));
}
export function processNeighbors(relations:ProcessRelation[],processId:string){
 return relations.filter(r=>r.source_process_id===processId||r.target_process_id===processId)
 .map(r=>({...r,otherId:r.source_process_id===processId?r.target_process_id:r.source_process_id,direction:r.source_process_id===processId?'outgoing' as const:'incoming' as const}));
}
export function relatedProcessCount(relations:ProcessRelation[],id:string):number{return new Set(processNeighbors(relations,id).map(x=>x.otherId)).size;}
export function initialProcessFocus(nodes:Process[],relations:ProcessRelation[]):string{
 const processes=nodes.filter(n=>n.kind==='PROCESS');
 return [...processes].sort((a,b)=>relatedProcessCount(relations,b.id)-relatedProcessCount(relations,a.id)||a.name.localeCompare(b.name,'fa'))[0]?.id??'';
}
export type RelationOverlay={additions:ProcessRelation[];updates:ProcessRelation[];deletedIds:string[]};
export const emptyOverlay=():RelationOverlay=>({additions:[],updates:[],deletedIds:[]});
export const relationOverlayKey=(organizationId:string)=>'nama-process-relations-demo-v1:'+organizationId;
export function parseRelationOverlay(value:unknown,nodes:Process[]):RelationOverlay{
 if(!value||typeof value!=='object')return emptyOverlay();
 const record=value as Partial<RelationOverlay>;
 const checked=(input:unknown)=>Array.isArray(input)?input.filter((r):r is ProcessRelation=>Boolean(r&&typeof r==='object'&&validRelation(r as ProcessRelation,nodes)&&typeof (r as ProcessRelation).id==='string')):[];
 return{additions:checked(record.additions),updates:checked(record.updates),deletedIds:Array.isArray(record.deletedIds)?record.deletedIds.filter((x):x is string=>typeof x==='string'):[]};
}
export function mergeProcessRelations(base:ProcessRelation[],overlay:RelationOverlay):ProcessRelation[]{
 const updated=new Map(overlay.updates.map(r=>[r.id,r]));
 const deleted=new Set(overlay.deletedIds);
 return[...base.filter(r=>!r.id||!deleted.has(r.id)).map(r=>updated.get(r.id)??r),...overlay.additions.filter(r=>!r.id||!deleted.has(r.id))];
}
export function loadProcessRelationOverlay(data:Pick<Data,'organization'|'nodes'>):RelationOverlay{
 try{return parseRelationOverlay(JSON.parse(localStorage.getItem(relationOverlayKey(data.organization.id))??'{}'),data.nodes);}catch{return emptyOverlay();}
}
export function visibleProcessRelations(data:Data):ProcessRelation[]{
 if(window.__PORTAL_CONFIG__?.mode!=='public'||data.user.role==='ADMIN')return data.relations??[];
 return mergeProcessRelations(data.relations??[],loadProcessRelationOverlay(data));
}
export function saveProcessRelationOverlay(data:Data,overlay:RelationOverlay):void{
 localStorage.setItem(relationOverlayKey(data.organization.id),JSON.stringify(overlay));
}
export function upsertDraftRelation(overlay:RelationOverlay,base:ProcessRelation[],relation:ProcessRelation):RelationOverlay{
 if(base.some(x=>x.id===relation.id)){
  return{...overlay,updates:[...overlay.updates.filter(x=>x.id!==relation.id),relation]};
 }
 return{...overlay,additions:[...overlay.additions.filter(x=>x.id!==relation.id),relation]};
}
export function removeDraftRelation(overlay:RelationOverlay,base:ProcessRelation[],id:string):RelationOverlay{
 return{additions:overlay.additions.filter(x=>x.id!==id),updates:overlay.updates.filter(x=>x.id!==id),deletedIds:base.some(x=>x.id===id)?[...new Set([...overlay.deletedIds,id])]:overlay.deletedIds};
}
