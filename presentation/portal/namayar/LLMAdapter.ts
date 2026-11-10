import{withinScope,refusalReply}from'./scope';
import type{AllowedData,PageContext,Reply,AssistantLink}from'./types';
import{validateReplyLinks,validInternalRoute}from'./router';

// Namayar Groq pilot: the temporary access code is entered by a tester, never embedded in Pages.
// The provider API key remains in Supabase Edge Function Secrets.
const KEY='namayar-groq-pilot-session-v1';
const ENDPOINT='https://oozwypufxjkpamkdygjm.supabase.co/functions/v1/namayar-groq-test';
const QUOTA_ENDPOINT='https://oozwypufxjkpamkdygjm.supabase.co/functions/v1/namayar-groq-test';
export async function fetchSharedQuota():Promise<number|null>{const code=getGroqPilotCode();if(!code)return null;try{const res=await fetch(QUOTA_ENDPOINT,{method:'GET',headers:{'x-namayar-test-token':code},cache:'no-store'});if(!res.ok)return null;const data=await res.json();return typeof data.remaining_percent==='number'?Math.max(0,Math.min(100,data.remaining_percent)):null;}catch{return null;}}
export type HistoryMessage={role:'user'|'assistant';content:string};
export function getGroqPilotCode():string{
  try{return sessionStorage.getItem(KEY)||'';}catch{return '';}
}
export function setGroqPilotCode(code:string):void{
  const value=code.trim();
  try{if(value)sessionStorage.setItem(KEY,value);else sessionStorage.removeItem(KEY);}catch{ /* restricted browser storage */ }
}
export interface LLMAdapter{
  readonly enabled:boolean;
  answer(question:string,context:PageContext,data:AllowedData,signal:AbortSignal,history?:HistoryMessage[]):Promise<Reply>;
}
export class DisabledLLMAdapter implements LLMAdapter{
  readonly enabled=false;
  async answer():Promise<Reply>{throw Error('اتصال مدل زبانی پیکربندی نشده است.');}
}
export class GroqPilotAdapter implements LLMAdapter{
  get enabled(){return getGroqPilotCode().length>=24;}
  async answer(question:string,context:PageContext,data:AllowedData,signal:AbortSignal,history:HistoryMessage[]=[]):Promise<Reply>{
    const code=getGroqPilotCode();
    if(code.length<24)throw Error('برای استفاده از Groq، کد تست را در پنل نمایار فعال کن.');
    if(!withinScope(data,context,question))return refusalReply();
    let result:Response;
    try{
      result=await fetch(ENDPOINT,{
        method:'POST',mode:'cors',credentials:'omit',
        headers:{'Content-Type':'application/json','x-namayar-test-token':code},
        body:JSON.stringify({
          question:question.slice(0,1200),
          context:{path:context.path,pageType:context.pageType,title:context.title,entity:context.entity},
          history:history.slice(-6).map(m=>({role:m.role,content:m.content.slice(0,600)}))
        }),signal
      });
    }catch{
      if(signal.aborted)throw Error('درخواست لغو شد.');
      throw Error('اتصال به Groq برقرار نشد. اتصال اینترنت یا دسترسی به Supabase را بررسی کن.');
    }
    const raw=await result.json().catch(()=>null) as Record<string,unknown>|null;
    if(!result.ok){
      if(result.status===401){setGroqPilotCode('');throw Error('کد تست معتبر نیست؛ دوباره فعالش کن.');}
      if(result.status===429)throw Error('سهمیه رایگان Groq فعلاً به محدودیت رسیده؛ کمی بعد امتحان کن.');
      const detail=typeof raw?.message==='string'?raw.message:'خطای سرویس مدل زبانی';
      throw Error(detail);
    }
    if(!raw||!Array.isArray(raw.paragraphs)||!raw.paragraphs.every(p=>typeof p==='string'))throw Error('فرمت پاسخ Groq معتبر نبود.');
    const checked=(value:unknown)=>validateReplyLinks(data,Array.isArray(value)?value.filter((l):l is AssistantLink=>Boolean(l&&typeof l==='object'&&typeof l.href==='string'&&typeof l.label==='string')).slice(0,10):[]);
    return{paragraphs:raw.paragraphs.slice(0,8).map(s=>String(s).slice(0,4000)),links:checked(raw.links),sources:[]};
  }
}

// Retained backward-compatible, same-origin adapter; not used by the public Groq pilot.
export class BackendLLMAdapter implements LLMAdapter{
  readonly enabled=true;
  constructor(private endpoint:string,private fetcher:typeof fetch=fetch){
    if(!/^\/api\/namayar(?:\/[a-z0-9-]+)?$/.test(endpoint))throw Error('Only a same-origin Namayar gateway is supported');
  }
  async answer(question:string,context:PageContext,data:AllowedData,signal:AbortSignal):Promise<Reply>{
    if(!withinScope(data,context,question))return refusalReply();
    const res=await this.fetcher(this.endpoint,{
      method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question:question.slice(0,1200),context:{path:context.path,pageType:context.pageType,entity:context.entity}}),signal
    });
    if(!res.ok)throw Error('ارتباط با دستیار سرور انجام نشد.');
    const raw=await res.json() as Record<string,unknown>;
    if(!Array.isArray(raw.paragraphs)||!raw.paragraphs.every(p=>typeof p==='string'))throw Error('پاسخ سرور معتبر نیست.');
    const checked=(value:unknown)=>validateReplyLinks(data,Array.isArray(value)?value.filter((l):l is AssistantLink=>Boolean(l&&typeof l==='object'&&typeof l.href==='string'&&typeof l.label==='string')).slice(0,20):[]);
    const navigate=/برو|ببر|باز\s*کن|بریم|go to|open /i.test(question)&&typeof raw.navigate==='string'&&validInternalRoute(data,raw.navigate)?raw.navigate:undefined;
    return {paragraphs:raw.paragraphs.slice(0,12).map(x=>String(x).slice(0,6000)),links:checked(raw.links),sources:checked(raw.sources),navigate};
  }
}

export const llmAdapter:LLMAdapter=new GroqPilotAdapter();
