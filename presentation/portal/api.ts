import type{Data,Config}from './types';
export const ORG='a0000000-0000-4000-8000-000000000001';
export const config=window.__PORTAL_CONFIG__;
export async function loadData():Promise<Data>{
 if(config.snapshotPath){const r=await fetch(config.snapshotPath,{cache:'no-store',signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('دریافت فایل اطلاعات انجام نشد. دوباره تلاش کنید.');return normalize(await r.json());}
 if(config.mode==='private'){const r=await fetch('/api/data',{cache:'no-store',signal:AbortSignal.timeout(25000)});const v=await r.json();if(!r.ok)throw Error(v.error||'دریافت اطلاعات انجام نشد.');return normalize(v);}
 const cfg=config as Required<Config>;
 const get=async(table:string,query:string)=>{const r=await fetch(cfg.url+'/rest/v1/'+table+'?'+query,{headers:{apikey:cfg.publishableKey},signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('دریافت اطلاعات انجام نشد؛ اتصال را بررسی کنید.');return r.json();};
 const [orgs,units,nodes,kpis,links,documents,profiles]=await Promise.all([
 get('organizations','select=id,name,display_name,primary_color,logo_data_url&id=eq.'+ORG),get('org_units','select=id,name,parent_id,code,sort_order&organization_id=eq.'+ORG+'&order=sort_order'),get('process_nodes','select=id,parent_id,kind,classification,code,name,summary,owner_org_unit_id&organization_id=eq.'+ORG+'&order=code'),get('kpis','select=id,code,name,description,formula_text,unit,frequency,readiness_status,target_value,data_source&organization_id=eq.'+ORG+'&order=code'),get('process_kpis','select=process_id,kpi_id&organization_id=eq.'+ORG),get('documents','select=id,title&organization_id=eq.'+ORG),get('process_profiles','select=id,process_id,objective,start_event,end_event,inputs,outputs,roles,expected_outcome,notes&organization_id=eq.'+ORG)]);
 if(!orgs.length)throw Error('اطلاعات سازمان در دسترس نیست.');return normalize({organization:orgs[0],units,nodes,kpis,links,documents,profiles,positions:[],persons:[],assignments:[],user:{name:'مشاهده‌گر',email:'',role:'VIEWER'}});
}
function normalize(data:Data):Data{for(const key of ['units','nodes','kpis','links','documents','profiles','positions','persons','assignments']as const)data[key]??=[];return data;}
export async function mutate(path:string,method:string,value?:unknown){if(config.mode!=='private')throw Error('برای ثبت تغییرات وارد پنل مدیریت شوید.');const r=await fetch('/api/'+path,{method,headers:{'Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});let result;try{result=await r.json();}catch{throw Error('پاسخ سامانه قابل دریافت نیست. دوباره تلاش کنید.');}if(!r.ok)throw Error(result.error||'ذخیره انجام نشد.');return result;}
