import{Layers3,GitBranch,ClipboardList}from'lucide-react';
import type{Data}from'./types';
import{Link}from'./ui';
import{Architecture}from'./Architecture';
import{ProcessCatalog}from'./ProcessCatalog';
import{ProcessMap}from'./ProcessMap';
import{ProcessProfile}from'./ProcessDetail';
import'./process-workspace.css';
export type ProcessWorkspaceSection='architecture'|'map'|'catalog';
const tabs:[ProcessWorkspaceSection,string,string,typeof Layers3][]=[
 ['architecture','معماری فرآیندها','/architecture',Layers3],
 ['map','نقشه فرآیندها','/process-map',GitBranch],
 ['catalog','شناسنامه فرآیندها','/processes',ClipboardList]
];
export function ProcessWorkspace({data,section,refresh,detailId}:{data:Data;section:ProcessWorkspaceSection;refresh:()=>Promise<void>;detailId?:string}){
 return <div className="process-workspace">
  <header className="process-workspace-header" data-tour="page-heading"><div><h1>مدیریت فرآیندها</h1><p>معماری سازمان، ارتباطات بین فرآیندها و شناسنامه‌های اجرایی در یک فضای کاری</p></div></header>
  <nav className="process-workspace-tabs" aria-label="بخش‌های مدیریت فرآیندها">
   {tabs.map(([id,label,to,Icon])=><Link key={id} to={to} className={section===id?'active':''} ariaLabel={label}><Icon size={17}/><span>{label}</span></Link>)}
  </nav>
  <section className="process-workspace-body" aria-label={tabs.find(x=>x[0]===section)?.[1]}>
   {section==='architecture'?<Architecture data={data} embedded/>:section==='map'?<ProcessMap data={data} refresh={refresh}/>:detailId?<ProcessProfile key={detailId} data={data} id={detailId} refresh={refresh}/>:<ProcessCatalog data={data} embedded/>}
  </section>
 </div>;
}
