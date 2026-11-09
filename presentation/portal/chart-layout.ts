import dagre from '@dagrejs/dagre';
export type ChartItem={id:string;parentId:string|null;label:string;subtitle?:string;kind:'unit'|'position';closed:boolean;childCount:number;selected:boolean;seatCount?:number;mixed?:boolean};
export type ChartDirection='horizontal'|'vertical';
export function layoutChart(items:ChartItem[],admin=false,direction:ChartDirection='horizontal'){
 const graph=new dagre.graphlib.Graph().setGraph({rankdir:direction==='vertical'?'TB':'RL',nodesep:28,ranksep:100,marginx:50,marginy:50}).setDefaultEdgeLabel(()=>({}));
 const width=240,height=admin?124:104,ids=new Set(items.map(n=>n.id));
 for(const n of items)graph.setNode(n.id,{width,height});
 for(const n of items)if(n.parentId&&ids.has(n.parentId))graph.setEdge(n.parentId,n.id);
 dagre.layout(graph);
 return items.map(n=>{const p=graph.node(n.id);return{...n,x:p.x-width/2,y:p.y-height/2,width,height};});
}
// Follow IDs only. No synthetic parents and no changes to stored reporting relationships.
export function visibleChartItems(items:ChartItem[],closed:Set<string>,focusId:string|null){
 const byId=new Map(items.map(n=>[n.id,n]));
 return items.filter(n=>{if(n.id===focusId)return true;let parent=n.parentId;const visited=new Set([n.id]);while(parent){if(visited.has(parent)||closed.has(parent))return false;visited.add(parent);if(parent===focusId)return true;parent=byId.get(parent)?.parentId??null;}return !focusId;});
}
