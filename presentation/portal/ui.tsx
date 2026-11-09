import type{MouseEvent,ReactNode}from'react';import{config}from'./api';
export const number=new Intl.NumberFormat('fa-IR');
export function currentPath(){return config.mode==='public'?(location.hash.startsWith('#/')?location.hash.slice(1):'/dashboard'):(location.pathname==='/'?'/dashboard':location.pathname);}
export function go(path:string){if(config.mode==='public')location.hash=path;else{history.pushState({},'',path);window.dispatchEvent(new PopStateEvent('popstate'));}window.dispatchEvent(new Event('orgdocs:route'));window.scrollTo({top:0,behavior:'instant'});}
export function Link({to,children,className,ariaLabel}:{to:string;children:ReactNode;className?:string;ariaLabel?:string}){return <a href={config.mode==='public'?'#'+to:to} className={className} aria-label={ariaLabel} title={ariaLabel} onClick={(e:MouseEvent)=>{if(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();go(to);}}>{children}</a>;}
export function Heading({title,description,action}:{title:string;description?:string;action?:ReactNode}){return <div className="heading" data-tour="page-heading"><div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>;}
export function Empty({title,text}:{title:string;text:string}){return <section className="panel empty"><h2>{title}</h2><p>{text}</p></section>;}
export const errorMessage=(e:unknown)=>e instanceof Error?e.message:'ارتباط برقرار نشد؛ دوباره تلاش کنید.';
