import type{Position}from'./types';
export type PositionGroup={id:string;title:string;org_unit_id:string;members:Position[];parent_id:string|null;reporting_variants:number};
const roleKey=(p:Position)=>p.org_unit_id+'|'+p.title.normalize('NFKC').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
// Presentation grouping only: retain every seat and leave stored reporting relationships unchanged.
export function groupPositions(positions:Position[]):PositionGroup[]{const byPosition=new Map(positions.map(p=>[p.id,p])),groups=new Map<string,PositionGroup>();
 for(const p of positions){const key=roleKey(p);if(!groups.has(key))groups.set(key,{id:'role:'+key,title:p.title.trim(),org_unit_id:p.org_unit_id,members:[],parent_id:null,reporting_variants:0});groups.get(key)!.members.push(p);}
 for(const[key,g]of groups){const parents=new Map<string|null,number>();for(const p of g.members){const sourceParent=byPosition.get(p.reports_to_position_id??''),parentKey=sourceParent?roleKey(sourceParent):null;if(parentKey!==key&&(parentKey===null||groups.has(parentKey)))parents.set(parentKey,(parents.get(parentKey)??0)+1);}g.reporting_variants=parents.size;const ranked=[...parents].filter((p):p is[string,number]=>p[0]!==null).sort((a,b)=>b[1]-a[1]);g.parent_id=ranked.length?'role:'+ranked[0][0]:null;}
 const byId=new Map([...groups.values()].map(g=>[g.id,g]));for(const g of groups.values()){const visited=new Set([g.id]);let parent=g.parent_id;while(parent){if(visited.has(parent)){g.parent_id=null;break;}visited.add(parent);parent=byId.get(parent)?.parent_id??null;}}
 return[...groups.values()];
}
