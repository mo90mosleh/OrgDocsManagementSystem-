import{useState}from'react';import{Search,X}from'lucide-react';
import type{ChartItem}from'./chart-layout';import{normalizeSearch}from'./architecture-navigation';
export function ChartSearch({items,onChoose}:{items:ChartItem[];onChoose:(id:string)=>void}){
 const[query,setQuery]=useState(''),[open,setOpen]=useState(false);
 const matches=query.trim()?items.filter(n=>normalizeSearch(n.label+' '+(n.subtitle??'')).includes(normalizeSearch(query))).slice(0,12):[];
 return <div className="chart-search chart-header-search" onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}><Search size={16}/><input aria-label="یافتن واحد یا سمت در چارت" aria-expanded={open&&Boolean(query.trim())} aria-controls="chart-search-results" placeholder="یافتن واحد یا سمت…" value={query} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);}}/>{query&&<button className="icon-button" aria-label="پاک کردن جست‌وجوی چارت" onClick={()=>{setQuery('');setOpen(false);}}><X size={14}/></button>}{open&&query.trim()&&<div id="chart-search-results" className="chart-search-results" role="region" aria-label="نتایج جست‌وجوی چارت">{matches.length?matches.map(n=><button key={n.id} onClick={()=>{onChoose(n.id);setQuery('');setOpen(false);}}><strong>{n.label}</strong>{n.subtitle&&<small>{n.subtitle}</small>}</button>):<p>موردی پیدا نشد.</p>}</div>}</div>;
}
