import type{ChartItem}from'./chart-layout';
export type ChartReference={kind:'unit'|'position';id:string};
export type ChartVisitState={items:ChartReference[];index:number};

export function chartTrail(items:ChartItem[],id:string|null):ChartItem[]{
 if(!id)return[];
 const byId=new Map(items.map(item=>[item.id,item]));
 const result:ChartItem[]=[],seen=new Set<string>();
 let current=id;
 while(current&&!seen.has(current)&&result.length<128){
  seen.add(current);
  const item=byId.get(current);
  if(!item)break;
  result.push(item);current=item.parentId??'';
 }
 return result.reverse();
}
export function chartLink(href:string,mode:'public'|'private',ref:ChartReference):string{
 const url=new URL(href),query=new URLSearchParams({kind:ref.kind,node:ref.id});
 // Never carry unrelated query parameters or authorization details into shared URLs.
 url.search='';url.hash='';
 if(mode==='public')url.hash='/organization/chart?'+query.toString();
 else{url.pathname='/organization/chart';url.search='?'+query.toString();}
 return url.toString();
}
export function readChartLink(href:string,mode:'public'|'private'):ChartReference|null{
 try{
  const url=new URL(href);
  const query=mode==='public'?
   url.hash.startsWith('#/organization/chart?')?url.hash.slice('#/organization/chart?'.length):null:
   url.pathname==='/organization/chart'?url.search.slice(1):null;
  if(!query)return null;
  const params=new URLSearchParams(query),kind=params.get('kind'),id=params.get('node');
  if((kind!=='unit'&&kind!=='position')||!id||id.length>180||params.getAll('node').length!==1||params.getAll('kind').length!==1)return null;
  return{kind,id};
 }catch{return null;}
}
export function sameChartRef(a:ChartReference|undefined|null,b:ChartReference|undefined|null):boolean{
 return Boolean(a&&b&&a.kind===b.kind&&a.id===b.id);
}
export function appendChartVisit(state:ChartVisitState,ref:ChartReference):ChartVisitState{
 const current=state.items[state.index];
 if(sameChartRef(current,ref))return state;
 const next=[...state.items.slice(0,state.index+1),ref].slice(-25);
 return{items:next,index:next.length-1};
}
export function chartHistoryTarget(state:ChartVisitState,delta:-1|1):ChartReference|null{
 return state.items[state.index+delta]??null;
}
export function restoreChartVisits(value:unknown,selected:ChartReference|null):ChartVisitState{
 const obj=value&&typeof value==='object'?value as Partial<ChartVisitState>:null;
 const items=Array.isArray(obj?.items)?obj.items.filter((item):item is ChartReference=>
  Boolean(item&&typeof item==='object'&&(item.kind==='position'||item.kind==='unit')&&typeof item.id==='string'&&item.id.length>0&&item.id.length<=180)).slice(-25):[];
 const index=Number.isInteger(obj?.index)&&typeof obj?.index==='number'&&obj.index>=0&&obj.index<items.length?obj.index:items.length-1;
 if(!items.length&&selected)return{items:[selected],index:0};
 return{items,index};
}
