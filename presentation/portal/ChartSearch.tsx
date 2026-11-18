import{useState}from'react';import{Search,X}from'lucide-react';
import type{ChartReference}from'./chart-navigation';import{normalizeSearch}from'./architecture-navigation';
export type ChartSearchResult={id:string;label:string;subtitle?:string;kind:'unit'|'position'|'person';ref?:ChartReference;personId?:string};
export function ChartSearch({items,onChoose}:{items:ChartSearchResult[];onChoose:(result:ChartSearchResult)=>void}){
 const[query,setQuery]=useState(''),[open,setOpen]=useState(false);
 const term=normalizeSearch(query);
 const matches=term?items.filter(n=>normalizeSearch(n.label).includes(term)).sort((a,b)=>Number(normalizeSearch(b.label)===term)-Number(normalizeSearch(a.label)===term)).slice(0,12):[];
 return <div className="chart-search chart-header-search" onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}><Search size={16}/><input aria-label="یافتن واحد، سمت یا شخص در چارت" aria-expanded={open&&Boolean(query.trim())} aria-controls="chart-search-results" placeholder="یافتن واحد، سمت یا شخص…" value={query} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);}}/>{query&&<button className="icon-button" aria-label="پاک کردن جست‌وجوی چارت" onClick={()=>{setQuery('');setOpen(false);}}><X size={14}/></button>}{open&&query.trim()&&<div id="chart-search-results" className="chart-search-results" role="region" aria-label="نتایج جست‌وجوی چارت">{matches.length?matches.map(n=><button key={n.kind+':'+n.id} onClick={()=>{onChoose(n);setQuery('');setOpen(false);}}><strong>{n.label}</strong><small aria-hidden="true">{n.kind==='unit'?'واحد':n.kind==='position'?'سمت':'شخص'}</small>{n.subtitle&&<small>{n.subtitle}</small>}</button>):<p>موردی پیدا نشد.</p>}</div>}</div>;
}
