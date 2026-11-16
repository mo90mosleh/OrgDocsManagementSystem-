import{memo,useEffect,useMemo,useRef}from'react';
import{ReactFlow,ReactFlowProvider,Background,Controls,MiniMap,Handle,Position,MarkerType,useReactFlow,type Node,type NodeProps}from'@xyflow/react';
import{Building2,GitBranch}from'lucide-react';
import type{Data,ProcessRelation}from'./types';
import{departmentTone,processMapLayout}from'./process-map-layout';
import{normalizeSearch}from'./architecture-navigation';
import{processRelationTypes}from'./process-relationships';
import'@xyflow/react/dist/style.css';
type Card=Node<{name:string;code:string;owner:string;unit:string|null;count:number;active:boolean;muted:boolean;select:(id:string)=>void;id:string},'process'>;
const ProcessNode=memo(function ProcessNode({data}:NodeProps<Card>){const tone=departmentTone(data.unit);return <div role="button" tabIndex={0} aria-label={'انتخاب فرآیند '+data.name} aria-pressed={data.active} onClick={e=>{e.stopPropagation();data.select(data.id);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();data.select(data.id);}}} className={'pm-flow-card '+(data.active?'is-active ':'')+(data.muted?'is-muted':'')} style={{'--department-color':tone.color,'--department-tint':tone.tint,'--department-shadow':tone.shadow} as React.CSSProperties}>
 <Handle type="target" position={Position.Right}/><div className="pm-card-code"><bdi>{data.code}</bdi><span><GitBranch size={12}/>{data.count.toLocaleString('fa-IR')}</span></div><strong>{data.name}</strong><small><Building2 size={13}/>{data.owner}</small><Handle type="source" position={Position.Left}/>
 </div>;});
const nodeTypes={process:ProcessNode};
const edgeColors={RELATED:'#94a3b8',PREREQUISITE:'#b77939',INPUT_FROM:'#27869e',OUTPUT_TO:'#42836b'};
export function ProcessNetwork(props:{data:Data;relations:ProcessRelation[];focus:string;search:string;department:string;onFocus:(id:string)=>void}){return <ReactFlowProvider><Canvas {...props}/></ReactFlowProvider>;}
function Canvas({data,relations,focus,search,department,onFocus}:Parameters<typeof ProcessNetwork>[0]){
 const flow=useReactFlow<Card>(),container=useRef<HTMLDivElement>(null),layout=useMemo(()=>processMapLayout(data,relations),[data.nodes,relations]);
 const linked=useMemo(()=>new Set([focus,...relations.flatMap(r=>r.source_process_id===focus?[r.target_process_id]:r.target_process_id===focus?[r.source_process_id]:[])]),[relations,focus]);
 const nodes=useMemo<Card[]>(()=>layout.processes.map(p=>({id:p.id,type:'process',position:layout.positions.get(p.id)!,width:248,height:112,ariaLabel:'انتخاب فرآیند '+p.name,data:{id:p.id,select:onFocus,name:p.name,code:p.code??'',owner:data.units.find(u=>u.id===p.owner_org_unit_id)?.name??'بدون دپارتمان',unit:p.owner_org_unit_id,count:relations.filter(r=>r.source_process_id===p.id||r.target_process_id===p.id).length,active:p.id===focus,muted:(!linked.has(p.id)&&Boolean(focus))||Boolean(department&&p.owner_org_unit_id!==department)||Boolean(search&&!normalizeSearch(p.name+' '+p.code).includes(normalizeSearch(search)))}})),[layout,data.units,relations,focus,linked,search,department,onFocus]);
 const edges=useMemo(()=>layout.links.map((r,i)=>{const active=r.source_process_id===focus||r.target_process_id===focus,reverse=r.relation_type==='INPUT_FROM';return{id:r.id??'relation-'+i,source:reverse?r.target_process_id:r.source_process_id,target:reverse?r.source_process_id:r.target_process_id,type:'smoothstep',label:processRelationTypes[r.relation_type],markerEnd:r.relation_type==='RELATED'?undefined:{type:MarkerType.ArrowClosed,color:edgeColors[r.relation_type]},style:{stroke:edgeColors[r.relation_type],strokeWidth:active?2.5:1.5,opacity:active?1:.4,strokeDasharray:r.relation_type==='RELATED'?'6 5':undefined},labelStyle:{fontSize:10,fill:'#475569'},labelBgStyle:{fill:'#fff',fillOpacity:.96},labelBgPadding:[8,5] as [number,number],labelBgBorderRadius:5,interactionWidth:18};}),[layout,focus]);
 useEffect(()=>{
  if(!focus||!flow.viewportInitialized)return;
  const frame=requestAnimationFrame(()=>{
   const rect=container.current?.getBoundingClientRect(),points=[...linked].map(id=>layout.positions.get(id)).filter((p):p is {x:number;y:number}=>Boolean(p));
   if(!rect||!points.length)return;
   const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x+248)),top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y+112));
   const zoom=Math.min(.9,rect.width/(right-left+160),rect.height/(bottom-top+120));
   void flow.setViewport({x:rect.width/2-(left+right)/2*zoom,y:rect.height/2-(top+bottom)/2*zoom,zoom},{duration:220});
  });return()=>cancelAnimationFrame(frame);
 },[focus,layout,flow,linked,flow.viewportInitialized]);
 return <div ref={container} className="process-map-network" aria-label="نقشه تعاملی ارتباط فرآیندها"><ReactFlow<Card> nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_,node)=>onFocus(node.id)} onNodeDoubleClick={(_,node)=>onFocus(node.id)} nodesFocusable={false} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} edgesFocusable={false} defaultViewport={{x:0,y:0,zoom:.7}} minZoom={.08} maxZoom={1.6} zoomOnScroll zoomOnPinch panOnScroll={false} preventScrolling proOptions={{hideAttribution:false}} ariaLabelConfig={{'controls.zoomIn.ariaLabel':'بزرگ‌نمایی','controls.zoomOut.ariaLabel':'کوچک‌نمایی','controls.fitView.ariaLabel':'نمایش کل نقشه'}}><Background gap={22} size={1} color="#dbe3ed"/><Controls showInteractive={false}/><MiniMap nodeColor={n=>departmentTone(n.data.unit as string).color} pannable zoomable/></ReactFlow></div>;
}
