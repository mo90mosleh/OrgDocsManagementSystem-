import{useMemo,useState,type FormEvent}from'react';
import{GitBranch,Search,Plus,Network,LayoutList,Link2,Building2,ArrowUpLeft,ArrowRight,PenLine,Trash2,X,Info}from'lucide-react';
import type{Data,ProcessRelation,ProcessRelationType}from'./types';
import{Link,errorMessage,number}from'./ui';
import{config,mutate}from'./api';
import{usePageSelection}from'./namayar/PageContextProvider';
import{duplicateRelation,initialProcessFocus,loadProcessRelationOverlay,mergeProcessRelations,processNeighbors,processRelationTypes,removeDraftRelation,saveProcessRelationOverlay,upsertDraftRelation,validRelation,type RelationOverlay}from'./process-relationships';
import'./process-map.css';

type NetworkView='focus'|'all'|'list';
const short=(value:string,max=28)=>value.length>max?value.slice(0,max-1)+'…':value;
type NodePosition={id:string;x:number;y:number;label:string;code:string;owner:string};
type EdgePosition={id:string;source:string;target:string;type:ProcessRelationType;note:string};
function layoutNetwork(data:Data,relations:ProcessRelation[],focusId:string,mode:NetworkView){
 const allProcesses=data.nodes.filter(n=>n.kind==='PROCESS'),index=new Map(allProcesses.map(p=>[p.id,p]));
 const related=processNeighbors(relations,focusId);
 const ids=mode==='focus'?[focusId,...new Set(related.map(x=>x.otherId))]:[...new Set(relations.flatMap(r=>[r.source_process_id,r.target_process_id]))];
 const chosen=ids.filter(id=>index.has(id));
 const pos:NodePosition[]=chosen.map((id,i)=>{
  const p=index.get(id)!;
  const center=mode==='focus'&&id===focusId;
  const neighborIndex=i-1;
  const siblings=chosen.length-1;
  const angle=-Math.PI/2+2*Math.PI*(neighborIndex/Math.max(siblings,1));
  const x=mode==='focus'?(center?500:500+360*Math.cos(angle)):(155+(i%4)*275);
  const y=mode==='focus'?(center?285:285+200*Math.sin(angle)):(85+Math.floor(i/4)*105);
  return{id,x,y,label:p.name,code:p.code??'',owner:data.units.find(u=>u.id===p.owner_org_unit_id)?.name??'بدون مالک'};
 });
 const visible=new Set(chosen);
 const edges:EdgePosition[]=relations.filter(r=>visible.has(r.source_process_id)&&visible.has(r.target_process_id)&&mode==='all'||mode==='focus'&&(r.source_process_id===focusId||r.target_process_id===focusId)).map((r,i)=>({id:r.id??String(i),source:r.source_process_id,target:r.target_process_id,type:r.relation_type,note:r.note??''}));
 return{nodes:pos,edges,height:mode==='all'?Math.max(370,Math.ceil(chosen.length/4)*105+60):565};
}
const pathColor:Record<ProcessRelationType,string>={RELATED:'#94a3b8',PREREQUISITE:'#bc7861',INPUT_FROM:'#488eaa',OUTPUT_TO:'#499679'};
function ProcessNetworkSvg({data,relations,focus,view,onFocus}:{data:Data;relations:ProcessRelation[];focus:string;view:NetworkView;onFocus:(value:string)=>void}){
 const layout=useMemo(()=>layoutNetwork(data,relations,focus,view),[data,relations,focus,view]);
 const points=new Map(layout.nodes.map(p=>[p.id,p]));
 const nodeWidth=218,nodeHeight=62;
 return <div className="process-map-canvas-scroll"><svg className="process-map-network" viewBox={'0 0 1140 '+layout.height} aria-label={view==='all'?'شبکه کلی ارتباط فرآیندها':'نقشه ارتباط فرآیند انتخاب‌شده'} role="img">
  <defs>{Object.entries(pathColor).filter(([key])=>key!=='RELATED').map(([key,color])=><marker key={key} id={'pm-arrow-'+key} markerWidth="8" markerHeight="8" refX="8" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L8 3.5 L0 7 Z" fill={color}/></marker>)}</defs>
  {layout.edges.map(e=>{const a=points.get(e.source),b=points.get(e.target);if(!a||!b)return null;const dx=b.x-a.x,dy=b.y-a.y,len=Math.sqrt(dx*dx+dy*dy)||1,nx=dx/len,ny=dy/len;
   return <line key={e.id+'-'+e.source+'-'+e.target} className="process-map-edge" x1={a.x+nx*92} y1={a.y+ny*30} x2={b.x-nx*92} y2={b.y-ny*30} stroke={pathColor[e.type]??pathColor.RELATED} strokeWidth="2" strokeDasharray={e.type==='RELATED'?'6 5':undefined} markerEnd={e.type==='RELATED'?undefined:'url(#pm-arrow-'+e.type+')'}><title>{processRelationTypes[e.type]}؛ {e.note||'بدون توضیح'}</title></line>;
  })}
  {layout.nodes.map(p=><g key={p.id} className={'process-map-svg-node '+(p.id===focus?'is-focus':'')} role="button" tabIndex={0} aria-label={'انتخاب فرآیند '+p.label} onClick={()=>onFocus(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onFocus(p.id);}}} style={{cursor:'pointer'}}>
   <rect x={p.x-nodeWidth/2} y={p.y-nodeHeight/2} width={nodeWidth} height={nodeHeight} rx="12"/>
   <text x={p.x} y={p.y-10} className="process-map-node-title" textAnchor="middle" direction="rtl">{short(p.label,30)}</text>
   <text x={p.x} y={p.y+12} className="process-map-node-meta" textAnchor="middle" direction="rtl">{short(p.owner,32)}</text>
   <title>{p.label}{p.code?' · '+p.code:''} · {p.owner}</title>
  </g>)}
 </svg>{layout.nodes.length===0&&<p className="process-map-empty-canvas">هنوز ارتباطی ثبت نشده است. برای شروع یک فرآیند و ارتباط آن را تعریف کنید.</p>}</div>;
}
export function ProcessMap({data,refresh}:{data:Data;refresh:()=>Promise<void>}){
 const demo=config.mode==='public'&&data.user.role!=='ADMIN';
 const editable=demo||data.user.role==='ADMIN';
 const [overlay,setOverlay]=useState<RelationOverlay>(()=>demo?loadProcessRelationOverlay(data):{additions:[],updates:[],deletedIds:[]});
 const relations=useMemo(()=>demo?mergeProcessRelations(data.relations??[],overlay):data.relations??[],[data.relations,overlay,demo]);
 const processes=data.nodes.filter(n=>n.kind==='PROCESS');
 const [focus,setFocus]=useState(()=>initialProcessFocus(data.nodes,data.relations??[]));
 const [view,setView]=useState<NetworkView>('focus'),[search,setSearch]=useState(''),[edit,setEdit]=useState<ProcessRelation|null|undefined>(undefined),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const current=processes.find(p=>p.id===focus)||processes[0];
 usePageSelection('/process-map',current?{kind:'process',id:current.id}:null);
 const neighbors=useMemo(()=>current?processNeighbors(relations,current.id):[],[relations,current?.id]);
 const filtered=processes.filter(p=>(p.name+' '+(p.code??'')).includes(search.trim()));
 const byId=new Map(processes.map(p=>[p.id,p]));
 const reveal=(id:string)=>{setFocus(id);setView('focus');setMessage('');};
 const writeOverlay=(next:RelationOverlay)=>{saveProcessRelationOverlay(data,next);setOverlay(next);};
 const save=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(!editable)return;
  const f=new FormData(e.currentTarget);
  const item:ProcessRelation={id:edit?.id,source_process_id:String(f.get('source_process_id')??''),target_process_id:String(f.get('target_process_id')??''),relation_type:String(f.get('relation_type')??'RELATED') as ProcessRelationType,note:String(f.get('note')??'').trim()};
  if(!validRelation(item,data.nodes)){setError('مبدأ و مقصد باید دو فرآیند معتبر و متفاوت باشند.');return;}
  if(item.note&&item.note.length>400){setError('توضیح رابطه باید حداکثر ۴۰۰ کاراکتر باشد.');return;}
  if(duplicateRelation(relations,item,edit?.id)){setError('این رابطه قبلاً ثبت شده است.');return;}
  setBusy(true);setError('');setMessage('');
  try{
   if(demo){
    const next=upsertDraftRelation(overlay,data.relations??[],{...item,id:item.id??'local-'+crypto.randomUUID(),content_status:'DRAFT'});
    writeOverlay(next);
   }else{
    await mutate(edit?.id?'relations/'+edit.id:'relations',edit?.id?'PATCH':'POST',item);
    await refresh();
   }
   setFocus(item.source_process_id);setEdit(undefined);setMessage(demo?'ارتباط به‌صورت آزمایشی در همین مرورگر ذخیره شد.':'ارتباط در اطلاعات سازمان ذخیره شد.');
  }catch(err){setError(errorMessage(err));}finally{setBusy(false);}
 };
 const remove=async(rel:ProcessRelation)=>{
  if(!editable||!rel.id)return;
  if(!window.confirm('این ارتباط از نقشه فرآیندها حذف شود؟'))return;
  setBusy(true);setError('');setMessage('');
  try{
   if(demo)writeOverlay(removeDraftRelation(overlay,data.relations??[],rel.id));
   else{await mutate('relations/'+rel.id,'DELETE');await refresh();}
   setMessage(demo?'حذف ارتباط فقط در همین مرورگر ثبت شد.':'ارتباط حذف شد.');
  }catch(err){setError(errorMessage(err));}finally{setBusy(false);}
 };
 return <div className="process-map">
  <div className="process-map-tools">
   <div className="process-map-tools-left"><label className="process-map-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجوی نام یا کد فرآیند…" aria-label="جست‌وجوی فرآیند روی نقشه"/></label>
    <select aria-label="فرآیند منتخب نقشه" value={current?.id??''} onChange={e=>reveal(e.target.value)}>{filtered.map(p=><option key={p.id} value={p.id}>{p.name}{p.code?' · '+p.code:''}</option>)}</select>
   </div>
   <div className="process-map-view" role="group" aria-label="نمای نقشه فرآیندها">
    <button className={view==='focus'?'active':''} aria-pressed={view==='focus'} onClick={()=>setView('focus')}><Network size={16}/>فرآیند منتخب</button>
    <button className={view==='all'?'active':''} aria-pressed={view==='all'} onClick={()=>setView('all')}><GitBranch size={16}/>شبکه کلی</button>
    <button className={view==='list'?'active':''} aria-pressed={view==='list'} onClick={()=>setView('list')}><LayoutList size={16}/>فهرست</button>
   </div>
   {editable&&<button className="primary process-map-add" onClick={()=>{setEdit(null);setError('');}}><Plus size={16}/>تعریف ارتباط</button>}
  </div>
  <div className="process-map-meta"><span><Network size={15}/>{number.format(processes.length)} فرآیند</span><span><Link2 size={15}/>{number.format(relations.length)} ارتباط ثبت‌شده</span><span><Info size={15}/>{number.format(processes.filter(p=>processNeighbors(relations,p.id).length===0).length)} فرآیند بدون ارتباط</span></div>
  {demo&&<p className="process-map-demo-note">ویرایش ارتباط‌ها در این نسخه نمایشی، فقط در مرورگر شما ذخیره می‌شود و داده سازمان را تغییر نمی‌دهد.</p>}
  {message&&<p role="status" className="alert success">{message}</p>}{error&&edit===undefined&&<p role="alert" className="alert error">{error}</p>}
  {view==='list'?<section className="panel process-map-all-list"><div className="panel-title"><h2>فهرست ارتباط بین فرآیندها</h2><span className="badge neutral">{number.format(relations.length)} رابطه</span></div>
   {relations.length?<div className="process-map-table"><table><thead><tr><th>فرآیند مبدأ</th><th>نوع ارتباط</th><th>فرآیند مقصد</th><th>توضیح / وضعیت</th>{editable&&<th>اقدامات</th>}</tr></thead><tbody>{relations.map((r,i)=><tr key={r.id??i}><td><button className="process-map-link" onClick={()=>reveal(r.source_process_id)}>{byId.get(r.source_process_id)?.name??'نامشخص'}</button></td><td><span className={'process-map-type type-'+r.relation_type}>{processRelationTypes[r.relation_type]??r.relation_type}</span></td><td><button className="process-map-link" onClick={()=>reveal(r.target_process_id)}>{byId.get(r.target_process_id)?.name??'نامشخص'}</button></td><td>{r.note??'—'}{r.content_status==='DRAFT'&&<small>پیش‌نویس</small>}</td>{editable&&<td><div className="process-map-actions"><button aria-label="ویرایش ارتباط" onClick={()=>{setEdit(r);setError('');}}><PenLine size={16}/></button><button aria-label="حذف ارتباط" onClick={()=>void remove(r)} disabled={busy}><Trash2 size={16}/></button></div></td>}</tr>)}</tbody></table></div>:<p className="empty-inline">هنوز ارتباطی ثبت نشده است.</p>}
  </section>:<div className="process-map-body">
   <section className="panel process-map-canvas-panel"><div className="panel-title"><h2>{view==='all'?'شبکه کلی فرآیندهای مرتبط':'شبکه ارتباطی فرآیند منتخب'}</h2><span className="badge neutral">{number.format(view==='all'?relations.length:neighbors.length)} ارتباط</span></div>
    <ProcessNetworkSvg data={data} relations={relations} focus={current?.id??''} view={view} onFocus={reveal}/>
    <div className="process-map-legend">{Object.entries(processRelationTypes).map(([key,label])=><span key={key}><i style={{background:pathColor[key as ProcessRelationType]}}/>{label}</span>)}</div>
    {view==='all'&&<p className="process-map-caption">این نما فقط فرآیندهای دارای ارتباط ثبت‌شده را نمایش می‌دهد؛ برای مشاهده فرآیندهای مستقل از جست‌وجو استفاده کنید.</p>}
   </section>
   <aside className="panel process-map-side"><div className="panel-title"><h2>جزئیات ارتباط‌ها</h2></div>{current?<><h3>{current.name}</h3><p className="process-map-owner"><Building2 size={15}/>{data.units.find(u=>u.id===current.owner_org_unit_id)?.name??'واحد مالک نامشخص'}</p><p className="process-map-description">{data.profiles.find(p=>p.process_id===current.id)?.objective??current.summary??'توضیح ثبت نشده'}</p><Link to={'/processes/'+current.id} className="secondary process-map-profile"><ArrowUpLeft size={15}/>مشاهده شناسنامه</Link>
     <div className="process-map-side-heading"><strong>فرآیندهای مرتبط</strong><span>{number.format(neighbors.length)} رابطه</span></div>
     {neighbors.length?neighbors.map((r,i)=><article key={r.id??i} className="process-map-neighbor"><div><button className="process-map-link" onClick={()=>reveal(r.otherId)}>{byId.get(r.otherId)?.name??'فرآیند نامشخص'}<ArrowRight size={14}/></button><small>{processRelationTypes[r.relation_type]} · {r.direction==='incoming'?'ورودی به این فرآیند':'خروجی از این فرآیند'}{r.note?' · '+r.note:''}</small></div>{editable&&<div className="process-map-actions"><button aria-label={'ویرایش ارتباط با '+(byId.get(r.otherId)?.name??'')} onClick={()=>{setEdit(r);setError('');}}><PenLine size={15}/></button><button aria-label={'حذف ارتباط با '+(byId.get(r.otherId)?.name??'')} disabled={busy} onClick={()=>void remove(r)}><Trash2 size={15}/></button></div>}</article>):<p className="empty-inline">این فرآیند هنوز ارتباط ثبت‌شده‌ای ندارد.</p>}
    </>:<p className="empty-inline">ابتدا فرآیند را انتخاب کنید.</p>}</aside>
  </div>}
  {edit!==undefined&&<div className="process-map-modal-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)setEdit(undefined);}}><form className="process-map-form" role="dialog" aria-modal="true" aria-label="تعریف ارتباط فرآیندها" onSubmit={e=>void save(e)}>
   <header><h2>{edit?'ویرایش ارتباط فرآیندها':'تعریف ارتباط جدید'}</h2><button type="button" className="icon-button" aria-label="بستن فرم ارتباط" onClick={()=>setEdit(undefined)}><X size={20}/></button></header>
   <label>فرآیند مبدأ<select name="source_process_id" required defaultValue={edit?.source_process_id??current?.id??''}>{processes.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
   <label>نوع ارتباط<select name="relation_type" required defaultValue={edit?.relation_type??'RELATED'}>{Object.entries(processRelationTypes).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
   <label>فرآیند مقصد<select name="target_process_id" required defaultValue={edit?.target_process_id??processes.find(p=>p.id!==current?.id)?.id}>{processes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
   <label>توضیح ارتباط<textarea name="note" rows={3} maxLength={400} defaultValue={edit?.note??''} placeholder="این دو فرآیند چه ورودی، خروجی یا وابستگی مشترکی دارند؟"/></label>
   <p className="process-map-hint">ارتباط «مرتبط با» دوطرفه است؛ ارتباط‌های دیگر با مبدأ و مقصد مشخص ذخیره می‌شوند.</p>
   {error&&<p className="alert error" role="alert">{error}</p>}
   <footer><button className="primary" type="submit" disabled={busy}>{busy?'در حال ذخیره…':'ذخیره ارتباط'}</button><button className="secondary" type="button" onClick={()=>setEdit(undefined)} disabled={busy}>انصراف</button></footer>
  </form></div>}
 </div>;
}
