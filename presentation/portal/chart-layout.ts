import type{Person}from'./types';
import dagre from '@dagrejs/dagre';
export type ChartItem={id:string;parentId:string|null;label:string;subtitle?:string;kind:'unit'|'position';closed:boolean;childCount:number;selected:boolean;seatCount?:number;mixed?:boolean;unitId?:string;descendantCount?:number;previewChildren?:string[];analysisValue?:number;analysisLabel?:string;tone?:string;people?:Person[]};
export type ChartDirection='horizontal'|'vertical';
export function layoutChart(items:ChartItem[],admin=false,direction:ChartDirection='horizontal'){
 const graph=new dagre.graphlib.Graph().setGraph({rankdir:direction==='vertical'?'TB':'RL',nodesep:items.some(n=>n.people?.length)?60:28,ranksep:100,marginx:50,marginy:76}).setDefaultEdgeLabel(()=>({}));
 const width=240,height=admin?124:104,ids=new Set(items.map(n=>n.id));
 for(const n of items)graph.setNode(n.id,{width,height:height+(n.people?.length?24:0)});
 for(const n of items)if(n.parentId&&ids.has(n.parentId))graph.setEdge(n.parentId,n.id);
 dagre.layout(graph);
 const placed=items.map(n=>{const p=graph.node(n.id);return{...n,x:p.x-width/2,y:p.y-graph.node(n.id).height/2,width,height:graph.node(n.id).height};});

 if(!placed.length||placed.some(node=>node.kind!=='position'))return placed;

 // Position titles determine the display row. Reporting links still use parentId.
 const rowFor=(title:string)=>{
  const normalized=title.replace(/ي/g,'ی').replace(/ك/g,'ک').trim();
  if(/^(معاون|مدیر\s*عامل)(?:\s|$)/.test(normalized))return 0;
  if(/^مدیر(?:\s|$)/.test(normalized))return 1;
  if(/^(سرپرست|مسئول)(?:\s|$)/.test(normalized))return 2;
  return 3;
 };
 const rowHeight=Math.max(...placed.map(node=>node.height))+100;
 const firstRow=Math.min(...placed.map(node=>rowFor(node.label)));
 for(const row of [0,1,2,3]){
  const members=placed.filter(node=>rowFor(node.label)===row);
  members.sort((a,b)=>a.x-b.x||a.y-b.y);
  let nextX=-Infinity;
  for(const node of members){
   node.x=Math.max(node.x,nextX);
   node.y=76+(row-firstRow)*rowHeight;
   nextX=node.x+node.width+60;
  }
 }
 return placed;
}
// Follow IDs only. No synthetic parents and no changes to stored reporting relationships.
export function visibleChartItems(items:ChartItem[],closed:Set<string>,focusId:string|null){
 const byId=new Map(items.map(n=>[n.id,n]));
 return items.filter(n=>{if(n.id===focusId)return true;let parent=n.parentId;const visited=new Set([n.id]);while(parent){if(visited.has(parent)||closed.has(parent))return false;visited.add(parent);if(parent===focusId)return true;parent=byId.get(parent)?.parentId??null;}return !focusId;});
}
