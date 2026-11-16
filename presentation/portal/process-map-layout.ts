import dagre from'@dagrejs/dagre';
import type{Data,ProcessRelation}from'./types';
export function departmentTone(id:string|null|undefined){
 if(!id)return{color:'#64748b',tint:'#f1f5f9',shadow:'#64748b26'};
 let hash=2166136261;for(const c of id)hash=Math.imul(hash^c.charCodeAt(0),16777619);
 const hue=(hash>>>0)%360;
 return{color:`hsl(${hue} 48% 36%)`,tint:`hsl(${hue} 65% 96%)`,shadow:`hsl(${hue} 50% 50% / .18)`};
}
export function processMapLayout(data:Data,relations:ProcessRelation[]){
 const processes=data.nodes.filter(n=>n.kind==='PROCESS'),ids=new Set(processes.map(p=>p.id));
 const links=relations.filter(r=>ids.has(r.source_process_id)&&ids.has(r.target_process_id)&&r.source_process_id!==r.target_process_id);
 const adjacency=new Map(processes.map(p=>[p.id,new Set<string>()]));
 for(const r of links){adjacency.get(r.source_process_id)!.add(r.target_process_id);adjacency.get(r.target_process_id)!.add(r.source_process_id);}
 const seen=new Set<string>(),components:string[][]=[];
 for(const p of processes){if(seen.has(p.id))continue;const component:string[]=[],queue=[p.id];seen.add(p.id);while(queue.length){const id=queue.shift()!;component.push(id);for(const other of adjacency.get(id)!)if(!seen.has(other)){seen.add(other);queue.push(other);}}components.push(component);}
 components.sort((a,b)=>b.length-a.length);
 const positions=new Map<string,{x:number;y:number}>();let x=0,y=0,rowHeight=0;
 for(const component of components){
  const graph=new dagre.graphlib.Graph({multigraph:true}).setGraph({rankdir:'RL',nodesep:46,ranksep:130,marginx:30,marginy:35}).setDefaultEdgeLabel(()=>({}));
  const members=new Set(component);for(const id of component)graph.setNode(id,{width:248,height:112});
  for(const [i,r]of links.entries())if(members.has(r.source_process_id)&&members.has(r.target_process_id))graph.setEdge(r.source_process_id,r.target_process_id,{},String(i));
  dagre.layout(graph);const {width=308,height=182}=graph.graph();
  if(x>0&&x+width>1550){x=0;y+=rowHeight+80;rowHeight=0;}
  for(const id of component){const p=graph.node(id);positions.set(id,{x:x+p.x-124,y:y+p.y-56});}
  x+=width+65;rowHeight=Math.max(rowHeight,height);
 }
 return{processes,links,positions};
}
