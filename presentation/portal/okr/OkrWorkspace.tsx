import{useEffect,useMemo,useRef,useState,type FormEvent}from'react';
import{Target,Network,LayoutList,Table2,ChartNoAxesCombined,ClipboardList,Building2,Plus,CalendarDays,ChevronLeft,ChevronDown,ChartColumnIncreasing,Activity,CheckCircle2,AlertTriangle,Clock3,ArrowUpLeft,X,RefreshCw,History,GitBranch,Search,Save}from'lucide-react';
import type{Data}from'../types';
import{config}from'../api';
import{Link}from'../ui';
import{sampleAutumn1405}from'./sample';
import{activeObjectives,averageProgress,confidenceLabels,keyResultProgress,number,objectiveProgress,portfolioIsValid,registerCheckIn,withKeyResult,withObjective,type OkrPortfolio,type OkrObjective,type OkrConfidence,type OkrKeyResult}from'./model';
import'./okr.css';

type Tab='strategy'|'goals'|'monitor';
type DetailTab='results'|'links'|'history';
type FormKind='cycle'|'objective'|'kr'|'checkin'|null;
type Draft={objectiveId?:string;keyResultId?:string};
const EMPTY:OkrPortfolio={cycles:[],objectives:[],keyResults:[],checkins:[]};
const actionTime=()=>new Date().toISOString();
const titleByTab:Record<Tab,string>={strategy:'نقشه استراتژی',goals:'اهداف و نتایج کلیدی',monitor:'پایش و عملکرد'};
const copy=(value:OkrPortfolio)=>JSON.parse(JSON.stringify(value)) as OkrPortfolio;
function loadPortfolio(orgId:string,orgName:string){
 try{
  const saved=localStorage.getItem('nama-okr-workspace-v1:'+orgId);
  if(saved){const value:unknown=JSON.parse(saved);if(portfolioIsValid(value))return value;}
 }catch{/* Browser storage unavailable. */}
 return config.mode==='public'&&/راسان|rassan/i.test(orgName)?sampleAutumn1405():copy(EMPTY);
}
function Status({value}:{value:OkrConfidence}){return <span className={'okr-status '+(value==='ON_TRACK'?'is-good':value==='AT_RISK'?'is-risk':'is-bad')}>{confidenceLabels[value]}</span>;}
function Progress({value}:{value:number}){return <div className="okr-progress" role="progressbar" aria-label="درصد پیشرفت" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{width:value+'%'}}/></div>;}
function EntryCard({goal,portfolio,onSelect,owner}:{goal:OkrObjective;portfolio:OkrPortfolio;onSelect:()=>void;owner:string}){
 const pct=objectiveProgress(portfolio,goal.id),krCount=portfolio.keyResults.filter(x=>x.objectiveId===goal.id).length;
 return <button className={'okr-goal-card '+(goal.level==='COMPANY'?'is-company':'')} onClick={onSelect} aria-label={'جزئیات هدف '+goal.title}>
  <span className="okr-card-meta"><span>{goal.level==='COMPANY'?'هدف سازمانی':'هدف دپارتمان'}</span><bdi>{goal.code}</bdi></span>
  <strong>{goal.title}</strong><span className="okr-card-meta"><span>{owner}</span><Status value={goal.confidence}/></span>
  <span className="okr-card-meta"><span>{number.format(krCount)} نتیجه کلیدی</span><b>{number.format(pct)}٪</b></span>
  <Progress value={pct}/>
 </button>;
}
export function OkrWorkspace({data}:{data:Data}){
 const [portfolio,setPortfolio]=useState<OkrPortfolio>(()=>loadPortfolio(data.organization.id,data.organization.name));
 const [activeCycle,setActiveCycle]=useState(()=>portfolio.cycles.find(c=>c.status==='ACTIVE')?.id??portfolio.cycles[0]?.id??'');
 const [tab,setTab]=useState<Tab>('strategy'),[pillar,setPillar]=useState('all'),[listView,setListView]=useState<'tree'|'table'>('tree');
 const [search,setSearch]=useState(''),[scope,setScope]=useState('ALL');
 const [selectedId,setSelectedId]=useState<string|null>(null),[detailTab,setDetailTab]=useState<DetailTab>('results');
 const [form,setForm]=useState<FormKind>(null),[draft,setDraft]=useState<Draft>({}),[cycleManagerOpen,setCycleManagerOpen]=useState(false);
 const [feedback,setFeedback]=useState(''),[error,setError]=useState('');
 const ref=useRef<HTMLDivElement>(null);
 const demo=config.mode==='public',canEdit=demo||data.user.role==='ADMIN'||data.user.role==='EDITOR';
 useEffect(()=>{try{localStorage.setItem('nama-okr-workspace-v1:'+data.organization.id,JSON.stringify(portfolio));}catch{}},[portfolio,data.organization.id]);
 useEffect(()=>{if(!selectedId&&!form&&!cycleManagerOpen)return;const listener=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(form)setForm(null);else if(cycleManagerOpen)setCycleManagerOpen(false);else setSelectedId(null);}};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);},[selectedId,form,cycleManagerOpen]);
 const cycle=portfolio.cycles.find(c=>c.id===activeCycle)??portfolio.cycles[0]??null;
 const objectives=useMemo(()=>cycle?activeObjectives(portfolio,cycle.id):[],[portfolio,cycle?.id]);
 const selected=portfolio.objectives.find(x=>x.id===selectedId)??null;
 const selectedResults=portfolio.keyResults.filter(x=>x.objectiveId===selectedId);
 const results=portfolio.keyResults.filter(x=>objectives.some(g=>g.id===x.objectiveId));
 const checkins=portfolio.checkins.filter(x=>results.some(k=>k.id===x.keyResultId)).slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 const owner=(g:OkrObjective)=>g.ownerUnitId?data.units.find(u=>u.id===g.ownerUnitId)?.name??'واحد نامشخص':'کل سازمان';
 const metric=(name:string,value:string,description:string)=> <article className="okr-metric"><span>{name}</span><strong>{value}</strong><small>{description}</small></article>;
 const average=objectives.length?Math.round(objectives.reduce((sum,g)=>sum+objectiveProgress(portfolio,g.id),0)/objectives.length):0;
 const riskCount=objectives.filter(g=>g.confidence!=='ON_TRACK').length;
 const open=(id:string)=>{setSelectedId(id);setDetailTab('results');setFeedback('');};
 const showForm=(kind:FormKind,d:Draft={})=>{if(!canEdit){setError('برای ثبت اطلاعات، دسترسی ویرایش لازم است.');return;}setDraft(d);setForm(kind);setError('');setFeedback('');};
 const write=(next:OkrPortfolio,message:string)=>{setPortfolio(next);setFeedback(message);setError('');};
 const cycleDateFormat=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'short',day:'numeric'});
 const cycleDates=(start:string,end:string)=>start&&end?cycleDateFormat.format(new Date(start+'T12:00:00'))+' تا '+cycleDateFormat.format(new Date(end+'T12:00:00')):'تاریخ شروع و پایان ثبت نشده';
 const selectCycle=(id:string)=>{setActiveCycle(id);setSelectedId(null);setPillar('all');setCycleManagerOpen(false);setFeedback('');};
 const pillars=['all',...new Set(objectives.map(g=>g.pillar))];
 const filtered=objectives.filter(g=>(scope==='ALL'||g.level===scope)&&(!search.trim()||(g.title+' '+g.code+' '+owner(g)).includes(search.trim())));
 function saveForm(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!canEdit)return;
  const values=new FormData(e.currentTarget);
  try{
   if(form==='checkin'){
    const value=Number(values.get('value'));const confidence=String(values.get('confidence')) as OkrConfidence;
    const next=registerCheckIn(portfolio,{keyResultId:draft.keyResultId??'',value,confidence,note:String(values.get('note')??'')},actionTime());
    write(next,'Check-in در فضای آزمایشی ذخیره شد.');setForm(null);return;
   }
   if(form==='cycle'){
    const title=String(values.get('title')??'').trim();
    if(title.length<4||title.length>70)throw Error('نام دوره باید بین ۴ تا ۷۰ کاراکتر باشد.');
    const id='cycle-'+Date.now();
    const next={...portfolio,cycles:[...portfolio.cycles,{id,title,status:'PLANNING' as const,startDate:'',endDate:''}]};
    write(next,'دوره جدید در فضای آزمایشی ایجاد شد.');setActiveCycle(id);setForm(null);return;
   }
   if(form==='objective'){
    if(!cycle)throw Error('ابتدا یک دوره ایجاد کنید.');
    const title=String(values.get('title')??'').trim();
    if(title.length<8||title.length>220)throw Error('عنوان هدف باید بین ۸ تا ۲۲۰ کاراکتر باشد.');
    const parentId=String(values.get('parentId')??'')||null;
    const ownerUnitId=String(values.get('ownerUnitId')??'')||null;
    const level=parentId?'DEPARTMENT' as const:'COMPANY' as const;
    const objective:OkrObjective={id:'obj-'+Date.now(),code:'O-'+String(Date.now()).slice(-5),title,description:String(values.get('description')??'').slice(0,500),cycleId:cycle.id,parentId,level,ownerUnitId,pillar:String(values.get('pillar')??'توسعه سازمانی').trim()||'توسعه سازمانی',confidence:'ON_TRACK',processIds:[]};
    write(withObjective(portfolio,objective),'هدف جدید در فضای آزمایشی اضافه شد.');setForm(null);open(objective.id);return;
   }
   if(form==='kr'){
    const title=String(values.get('title')??'').trim();
    const baseline=Number(values.get('baseline')),target=Number(values.get('target'));
    if(title.length<8||title.length>220)throw Error('عنوان نتیجه کلیدی باید بین ۸ تا ۲۲۰ کاراکتر باشد.');
    if(!Number.isFinite(baseline)||!Number.isFinite(target)||baseline===target)throw Error('مقدار مبنا و هدف باید عددی و متفاوت باشند.');
    const kpiId=String(values.get('kpiId')??'')||null;
    const kr:OkrKeyResult={id:'kr-'+Date.now(),objectiveId:draft.objectiveId??'',title,baseline,target,current:baseline,unit:String(values.get('unit')??'').trim().slice(0,25),kpiId,weight:1};
    write(withKeyResult(portfolio,kr),'نتیجه کلیدی در فضای آزمایشی اضافه شد.');setForm(null);return;
   }
  }catch(err){setError(err instanceof Error?err.message:'ذخیره انجام نشد.');}
 }
 function resetDemo(){if(!demo)return;if(!window.confirm('تغییرات آزمایشی OKR بازنشانی شود؟'))return;const next=sampleAutumn1405();write(next,'اطلاعات نمونه پاییز ۱۴۰۵ بازنشانی شد.');setActiveCycle('1405-fall');setSelectedId(null);}
 const summary=<div className="okr-metrics">
  {metric('اهداف دوره',number.format(objectives.length),'سازمانی و دپارتمانی')}
  {metric('نتایج کلیدی',number.format(results.length),'مقادیر قابل سنجش')}
  {metric('میانگین تحقق',number.format(average)+'٪','میانگین اهداف فعال')}
  {metric('نیازمند توجه',number.format(riskCount),'براساس وضعیت اعلامی')}
 </div>;
 const strategy=<>
  {summary}
  <div className="okr-panel">
   <div className="okr-panel-head"><div><h3>نقشه هم‌راستاسازی اهداف</h3><small>روی هر کارت کلیک کنید تا جزئیات، KPIها و فرآیندهای مرتبط نمایش داده شوند.</small></div><div className="okr-pill-switch">{pillars.map(p=><button key={p} className={pillar===p?'active':''} onClick={()=>setPillar(p)}>{p==='all'?'همه محورها':p}</button>)}</div></div>
   {objectives.length?<div className="okr-map">
    {objectives.filter(x=>!x.parentId&&(pillar==='all'||x.pillar===pillar||objectives.some(child=>child.parentId===x.id&&child.pillar===pillar))).map(rootGoal=><div key={rootGoal.id} className="okr-map-tree">
      <div className="okr-map-parent"><EntryCard goal={rootGoal} portfolio={portfolio} owner={owner(rootGoal)} onSelect={()=>open(rootGoal.id)}/></div>
      {objectives.some(g=>g.parentId===rootGoal.id&&(pillar==='all'||g.pillar===pillar))&&<><div className="okr-map-stem" aria-hidden="true"/><div className="okr-map-children">{objectives.filter(g=>g.parentId===rootGoal.id&&(pillar==='all'||g.pillar===pillar)).map(g=><div className="okr-map-child" key={g.id}><EntryCard goal={g} portfolio={portfolio} owner={owner(g)} onSelect={()=>open(g.id)}/></div>)}</div></>}
    </div>)}
    {objectives.filter(x=>x.parentId&&!objectives.some(p=>p.id===x.parentId)).map(g=><EntryCard key={g.id} goal={g} portfolio={portfolio} owner={owner(g)} onSelect={()=>open(g.id)}/>)}
    {!objectives.some(x=>!x.parentId&&(pillar==='all'||x.pillar===pillar||objectives.some(child=>child.parentId===x.id&&child.pillar===pillar)))&&<p className="okr-empty">هدفی برای این محور ثبت نشده است.</p>}
   </div>:<p className="okr-empty">برای این دوره هنوز هدفی ثبت نشده است.</p>}
  </div>
  <div className="okr-bottom-grid">
   <div className="okr-panel"><div className="okr-panel-head"><h3>ردیابی ارتباط‌ها در نما</h3><small>OKR → KPI → فرآیند</small></div>
    <div className="okr-info-row"><span><ChartNoAxesCombined size={15}/>نتایج کلیدی دارای KPI مرتبط</span><strong>{number.format(results.filter(k=>k.kpiId&&data.kpis.some(x=>x.id===k.kpiId)).length)}</strong></div>
    <div className="okr-info-row"><span><ClipboardList size={15}/>ارتباط‌های ثبت‌شده با فرآیندها</span><strong>{number.format(objectives.reduce((n,x)=>n+x.processIds.filter(id=>data.nodes.some(p=>p.id===id&&p.kind==='PROCESS')).length,0))}</strong></div>
    <div className="okr-info-row"><span><Building2 size={15}/>دپارتمان‌های دارای هدف</span><strong>{number.format(new Set(objectives.map(x=>x.ownerUnitId).filter(Boolean)).size)}</strong></div>
   </div>
   <div className="okr-panel"><div className="okr-panel-head"><h3>مرور دوره</h3><small>{cycle?.title??'دوره انتخاب نشده'}</small></div>
    <div className="okr-info-row"><span><CheckCircle2 size={15}/>هدف‌های در مسیر</span><strong>{number.format(objectives.length-riskCount)}</strong></div>
    <div className="okr-info-row"><span><AlertTriangle size={15}/>نیازمند پیگیری</span><strong>{number.format(riskCount)}</strong></div>
    <div className="okr-info-row"><span><History size={15}/>Check-in ثبت‌شده</span><strong>{number.format(checkins.length)}</strong></div>
   </div>
  </div>
 </>;
 const goals=<>
  <div className="okr-goal-toolbar"><label className="okr-search"><Search size={17}/><input value={search} placeholder="جست‌وجو در نام هدف، کد و دپارتمان…" onChange={e=>setSearch(e.target.value)} aria-label="جست‌وجوی اهداف"/></label>
   <select aria-label="سطح اهداف" value={scope} onChange={e=>setScope(e.target.value)}><option value="ALL">همه سطوح</option><option value="COMPANY">سازمانی</option><option value="DEPARTMENT">دپارتمانی</option></select>
   <div className="okr-view-toggle" role="group" aria-label="نمایش اهداف"><button className={listView==='tree'?'active':''} onClick={()=>setListView('tree')} aria-pressed={listView==='tree'}><LayoutList size={16}/>درختی</button><button className={listView==='table'?'active':''} onClick={()=>setListView('table')} aria-pressed={listView==='table'}><Table2 size={16}/>جدولی</button></div>
  </div>
  <section className="okr-panel">{filtered.length?listView==='tree'?<div className="okr-list">
   {filtered.map(g=><button className="okr-list-row" key={g.id} onClick={()=>open(g.id)}>
    <div className={'okr-list-title '+(g.parentId?'is-child':'')}><small>{g.code} · {g.level==='COMPANY'?'سازمانی':'دپارتمانی'}</small><strong>{g.parentId?'↳ ':''}{g.title}</strong><small>{owner(g)}</small></div>
    <div className="okr-list-progress"><Progress value={objectiveProgress(portfolio,g.id)}/><small>{number.format(objectiveProgress(portfolio,g.id))}٪</small></div><Status value={g.confidence}/>
   </button>)}
  </div>:<div className="okr-table-wrap"><table><thead><tr><th>هدف</th><th>مالک</th><th>نتایج کلیدی</th><th>تحقق</th><th>وضعیت</th></tr></thead><tbody>{filtered.map(g=><tr key={g.id} onClick={()=>open(g.id)} tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')open(g.id);}}><td><strong>{g.title}</strong><small>{g.code}</small></td><td>{owner(g)}</td><td>{number.format(portfolio.keyResults.filter(k=>k.objectiveId===g.id).length)}</td><td>{number.format(objectiveProgress(portfolio,g.id))}٪</td><td><Status value={g.confidence}/></td></tr>)}</tbody></table></div>:<p className="okr-empty">هدفی با این شرایط پیدا نشد.</p>}</section>
 </>;
 const monitoring=<>
  {summary}
  <div className="okr-monitor-grid">
   <section className="okr-panel"><div className="okr-panel-head"><div><h3>تحقق اهداف به تفکیک دپارتمان</h3><small>بر اساس مقدار نتایج کلیدی</small></div></div>
    {objectives.map(g=><button className="okr-monitor-row" key={g.id} onClick={()=>open(g.id)}><strong>{owner(g)}</strong><Progress value={objectiveProgress(portfolio,g.id)}/><b>{number.format(objectiveProgress(portfolio,g.id))}٪</b></button>)}
    {!objectives.length&&<p className="okr-empty">هنوز هدفی ثبت نشده است.</p>}
   </section>
   <section className="okr-panel"><div className="okr-panel-head"><h3>اهداف نیازمند اقدام</h3><small>ریسک و انحراف</small></div>
    {objectives.filter(g=>g.confidence!=='ON_TRACK').map(g=><button className="okr-risk-row" key={g.id} onClick={()=>open(g.id)}><span><strong>{g.title}</strong><small>{owner(g)}</small></span><Status value={g.confidence}/></button>)}
    {!riskCount&&<p className="okr-empty">هدف پرریسکی در این دوره ثبت نشده است.</p>}
   </section>
  </div>
  <section className="okr-panel okr-checkins"><div className="okr-panel-head"><h3>آخرین Check-inها</h3><small>پیشرفت و توضیحات ثبت‌شده</small></div>
   {checkins.slice(0,6).map(c=>{const kr=portfolio.keyResults.find(k=>k.id===c.keyResultId);return <div className="okr-checkin-row" key={c.id}><div><strong>{kr?.title??'نتیجه کلیدی'}</strong><small>{c.note||'بدون توضیح'} · {new Intl.DateTimeFormat('fa-IR-u-ca-persian',{dateStyle:'medium'}).format(new Date(c.createdAt))}</small></div><span><b>{number.format(c.value)} {kr?.unit}</b><Status value={c.confidence}/></span></div>;})}
   {!checkins.length&&<p className="okr-empty">Check-in برای این دوره ثبت نشده است. از جزئیات هر هدف می‌توانید مقدار جدید ثبت کنید.</p>}
  </section>
 </>;
 return <div ref={ref} className="okr-workspace">
  <header className="okr-heading"><div><p className="okr-eyebrow"><Target size={14}/>مدیریت استراتژی و اهداف</p><h1>مدیریت OKR</h1><p>از اهداف سازمانی تا نتایج کلیدی، شاخص‌ها و فرآیندهای مرتبط</p></div>
   <div className="okr-heading-actions"><label className="okr-cycle-control"><CalendarDays size={16}/><select aria-label="دوره OKR" value={cycle?.id??''} onChange={e=>{setActiveCycle(e.target.value);setSelectedId(null);setPillar('all');}}>{!portfolio.cycles.length&&<option value="">دوره‌ای تعریف نشده</option>}{portfolio.cycles.map(c=><option key={c.id} value={c.id}>{c.title} {c.status==='PLANNING'?'· برنامه‌ریزی':''}</option>)}</select><ChevronDown size={13}/></label>
    <button className="okr-button okr-button-muted" onClick={()=>{setSelectedId(null);setCycleManagerOpen(true);setError('');setFeedback('');}}><CalendarDays size={15}/>مدیریت دوره‌ها</button>
    {canEdit&&<button className="okr-button okr-button-primary" onClick={()=>showForm('objective')}><Plus size={17}/>هدف جدید</button>}
   </div>
  </header>
  {feedback&&<p className="okr-feedback" role="status">{feedback}<button onClick={()=>setFeedback('')} aria-label="بستن پیام">×</button></p>}
  {error&&!form&&<p className="okr-error" role="alert">{error}<button onClick={()=>setError('')}>×</button></p>}
  <nav className="okr-tabs" aria-label="بخش‌های مدیریت OKR">{(['strategy','goals','monitor']as Tab[]).map((t,i)=><button key={t} className={tab===t?'active':''} aria-current={tab===t?'page':undefined} onClick={()=>{setTab(t);setSelectedId(null);}}>{i===0?<Network size={17}/>:i===1?<Target size={17}/>:<ChartColumnIncreasing size={17}/>}<span>{titleByTab[t]}</span></button>)}</nav>
  {cycle?<div className="okr-current-cycle"><span><Clock3 size={15}/>دوره انتخاب‌شده: <b>{cycle.title}</b></span><span>{cycle.status==='ACTIVE'?'فعال':cycle.status==='PLANNING'?'برنامه‌ریزی':'بسته‌شده'} · {number.format(objectives.length)} هدف · {number.format(results.length)} نتیجه کلیدی</span></div>:<p className="okr-empty">برای شروع، از «مدیریت دوره‌ها» یک دوره هدف‌گذاری بسازید.</p>}
  {tab==='strategy'?strategy:tab==='goals'?goals:monitoring}
  {selected&&<div className="okr-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)setSelectedId(null);}}><aside role="dialog" aria-modal="true" aria-label="جزئیات هدف OKR" className="okr-detail">
   <header><div><span className="okr-code">{selected.code}</span><h2>{selected.title}</h2><p>{owner(selected)} · {cycle?.title}</p></div><button className="okr-icon-button" aria-label="بستن جزئیات" onClick={()=>setSelectedId(null)}><X size={20}/></button></header>
   <div className="okr-detail-summary"><span>پیشرفت هدف</span><strong>{number.format(objectiveProgress(portfolio,selected.id))}٪</strong><Progress value={objectiveProgress(portfolio,selected.id)}/><div><Status value={selected.confidence}/><small>میانگین وزن‌دار نتایج کلیدی</small></div></div>
   {selected.description&&<p className="okr-description">{selected.description}</p>}
   <div className="okr-detail-tabs" role="tablist" aria-label="اطلاعات هدف">{(['results','links','history']as DetailTab[]).map((key,i)=><button role="tab" aria-selected={detailTab===key} className={detailTab===key?'active':''} key={key} onClick={()=>setDetailTab(key)}>{['نتایج کلیدی','ارتباطات','تاریخچه'][i]}</button>)}</div>
   {detailTab==='results'&&<div className="okr-detail-body">{selectedResults.map(kr=><div className="okr-result" key={kr.id}><div className="okr-result-head"><strong>{kr.title}</strong><span>{number.format(keyResultProgress(kr))}٪</span></div><Progress value={keyResultProgress(kr)}/><div className="okr-value-row"><span>مبنا: <b>{number.format(kr.baseline)}</b></span><span>فعلی: <b>{number.format(kr.current)}</b></span><span>هدف: <b>{number.format(kr.target)} {kr.unit}</b></span></div>{canEdit&&<button className="okr-button okr-button-muted" onClick={()=>showForm('checkin',{keyResultId:kr.id})}><Activity size={15}/>ثبت Check-in</button>}</div>)}
    {!selectedResults.length&&<p className="okr-empty">نتیجه کلیدی برای این هدف تعریف نشده است.</p>}
    {canEdit&&<button className="okr-button okr-add-kr" onClick={()=>showForm('kr',{objectiveId:selected.id})}><Plus size={16}/>تعریف نتیجه کلیدی</button>}
   </div>}
   {detailTab==='links'&&<div className="okr-detail-body"><h3><ChartNoAxesCombined size={17}/>KPIهای مرتبط</h3>{selectedResults.filter(k=>k.kpiId&&data.kpis.some(item=>item.id===k.kpiId)).map(k=>{const linked=data.kpis.find(item=>item.id===k.kpiId)!;return <Link key={k.id} to={'/kpis/'+linked.id} className="okr-related-link" >{linked.name}<ArrowUpLeft size={16}/></Link>;})}{!selectedResults.some(k=>data.kpis.some(item=>item.id===k.kpiId))&&<p className="okr-empty">ارتباط KPI ثبت نشده است.</p>}<h3><ClipboardList size={17}/>فرآیندهای مرتبط</h3>{selected.processIds.map(id=>data.nodes.find(n=>n.id===id&&n.kind==='PROCESS')).filter((n):n is NonNullable<typeof n>=>Boolean(n)).map(p=><Link to={'/processes/'+p.id} key={p.id} className="okr-related-link">{p.name}<ArrowUpLeft size={16}/></Link>)}{!selected.processIds.length&&<p className="okr-empty">ارتباطی با فرآیند ثبت نشده است.</p>}<p className="okr-note">این پیوندها، ارتباط مستندشده را نمایش می‌دهند و نشان‌دهنده اثر علّی اثبات‌شده نیستند.</p></div>}
   {detailTab==='history'&&<div className="okr-detail-body">{portfolio.checkins.filter(c=>c.objectiveId===selected.id).slice().reverse().map(c=><div className="okr-history-row" key={c.id}><strong>{portfolio.keyResults.find(k=>k.id===c.keyResultId)?.title}</strong><small>{new Intl.DateTimeFormat('fa-IR-u-ca-persian',{dateStyle:'medium'}).format(new Date(c.createdAt))}</small><p>{c.note||'ثبت مقدار نتیجه کلیدی'}</p><span>{number.format(c.previous)} ← {number.format(c.value)}</span></div>)}{!portfolio.checkins.some(c=>c.objectiveId===selected.id)&&<p className="okr-empty">هنوز تغییری برای این هدف ثبت نشده است.</p>}</div>}
  </aside></div>}
  {cycleManagerOpen&&<div className="okr-form-backdrop okr-cycle-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)setCycleManagerOpen(false);}}><section className="okr-cycle-manager" role="dialog" aria-modal={form?undefined:true} aria-label="مدیریت دوره‌های OKR">
    <header className="okr-cycle-manager-header"><div><h2>مدیریت دوره‌های OKR</h2><p>تمام دوره‌های تعریف‌شده را مرور کنید یا یک دوره جدید بسازید.</p></div><button className="okr-icon-button" aria-label="بستن مدیریت دوره‌ها" onClick={()=>setCycleManagerOpen(false)}><X size={19}/></button></header>
    <div className="okr-cycle-manager-tools"><span>{number.format(portfolio.cycles.length)} دوره تعریف‌شده</span>{canEdit&&<button className="okr-button okr-button-primary" onClick={()=>showForm('cycle')}><Plus size={16}/>دوره جدید</button>}</div>
    {feedback&&<p className="okr-feedback" role="status">{feedback}</p>}
    <div className="okr-cycle-list">{portfolio.cycles.map(c=>{const cycleObjectives=portfolio.objectives.filter(o=>o.cycleId===c.id),ids=new Set(cycleObjectives.map(o=>o.id)),countKrs=portfolio.keyResults.filter(k=>ids.has(k.objectiveId)).length,selectedCycle=c.id===cycle?.id;return <article key={c.id} className={'okr-cycle-item '+(selectedCycle?'selected':'')}>
      <div className="okr-cycle-item-heading"><h3>{c.title}</h3><span className={'okr-cycle-state '+(c.status==='ACTIVE'?'is-active':c.status==='CLOSED'?'is-closed':'is-planning')}>{c.status==='ACTIVE'?'فعال':c.status==='CLOSED'?'بسته‌شده':'برنامه‌ریزی'}</span></div>
      <p className="okr-cycle-dates"><CalendarDays size={15}/>{cycleDates(c.startDate,c.endDate)}</p>
      <div className="okr-cycle-counts"><span>{number.format(cycleObjectives.length)} هدف</span><span>{number.format(countKrs)} نتیجه کلیدی</span></div>
      <button className={'okr-button '+(selectedCycle?'okr-button-muted':'okr-button-primary')} onClick={()=>selectCycle(c.id)}>{selectedCycle?'دوره انتخاب‌شده':'مشاهده دوره'}<ChevronLeft size={15}/></button>
    </article>;})}{!portfolio.cycles.length&&<p className="okr-empty">هنوز دوره‌ای تعریف نشده است. از «دوره جدید» شروع کنید.</p>}</div>
    {demo&&<footer className="okr-cycle-manager-footer"><button className="okr-text-button" onClick={resetDemo}><RefreshCw size={14}/>بازنشانی داده‌های نمونه</button></footer>}
   </section></div>}
  {form&&<div className="okr-form-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)setForm(null);}}><form className="okr-form" onSubmit={saveForm} role="dialog" aria-label="فرم مدیریت OKR" aria-modal="true"><header><h2>{form==='checkin'?'ثبت Check-in':form==='kr'?'تعریف نتیجه کلیدی':form==='objective'?'هدف جدید':'ایجاد دوره جدید'}</h2><button type="button" aria-label="بستن فرم" onClick={()=>setForm(null)}><X size={19}/></button></header>
   {form==='cycle'&&<label>نام دوره<input name="title" required minLength={4} maxLength={70} placeholder="مثلاً بهار ۱۴۰۶"/></label>}
   {form==='objective'&&<><label>عنوان هدف<input name="title" required minLength={8} maxLength={220} placeholder="هدف روشن و نتیجه‌محور"/></label><label>توضیح<textarea name="description" maxLength={500} rows={2}/></label><label>هدف بالادستی<select name="parentId"><option value="">هدف سازمانی (ریشه)</option>{objectives.filter(x=>x.level==='COMPANY').map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label><label>واحد مالک<select name="ownerUnitId"><option value="">کل سازمان</option>{data.units.map(unit=><option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label>محور استراتژیک<input name="pillar" defaultValue="تجربه مشتری" maxLength={80}/></label></>}
   {form==='kr'&&<><label>عنوان نتیجه کلیدی<input name="title" required minLength={8} maxLength={220} placeholder="کاهش / افزایش عددی قابل سنجش"/></label><div className="okr-form-numbers"><label>مقدار مبنا<input name="baseline" required type="number" step="any" defaultValue={10}/></label><label>مقدار هدف<input name="target" required type="number" step="any" defaultValue={5}/></label></div><label>واحد سنجش<input name="unit" maxLength={25} placeholder="روز، درصد، عدد…"/></label><label>ارتباط با KPI موجود<select name="kpiId"><option value="">بدون KPI مرتبط</option>{data.kpis.map(k=><option key={k.id} value={k.id}>{k.name}</option>)}</select></label></>}
   {form==='checkin'&&<>{(()=>{const kr=portfolio.keyResults.find(k=>k.id===draft.keyResultId);return <><p className="okr-form-subtitle">{kr?.title}</p><label>مقدار واقعی جدید ({kr?.unit})<input type="number" step="any" required name="value" defaultValue={kr?.current}/></label><p className="okr-note">مبنا: {number.format(kr?.baseline??0)} · هدف: {number.format(kr?.target??0)}</p><label>وضعیت اطمینان<select name="confidence" defaultValue={selected?.confidence??'ON_TRACK'}><option value="ON_TRACK">در مسیر</option><option value="AT_RISK">نیازمند توجه</option><option value="OFF_TRACK">خارج از مسیر</option></select></label><label>توضیحات و موانع<textarea name="note" rows={3} maxLength={800}/></label></>;})()}</>}
   {error&&<p className="okr-error" role="alert">{error}</p>}
   <footer><button type="submit" className="okr-button okr-button-primary"><Save size={16}/>ذخیره آزمایشی</button><button type="button" className="okr-button okr-button-muted" onClick={()=>setForm(null)}>انصراف</button></footer>
  </form></div>}
 </div>;
}
