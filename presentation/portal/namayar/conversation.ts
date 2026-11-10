import type{AllowedData,PageContext,EntityRef,Reply}from'./types';
import{answerQuestion}from'./engine';import{namedEntities,normalizeQuestion}from'./retrieval';
export type ConversationState={signature?:string;entity?:EntityRef|null;document?:'educational'|'bpmn';pendingSubject?:boolean};
export function converse(data:AllowedData,context:PageContext,question:string,state:ConversationState):Reply{
 const signature=context.path+':'+context.entity?.kind+':'+context.entity?.id;
 if(state.signature!==signature){state.entity=context.entity;state.document=undefined;state.pendingSubject=false;state.signature=signature;}
 const q=normalizeQuestion(question),named=namedEntities(data,q);
 if(named.length===1)state.entity=named[0];
 const follow=/این|همین|اون|آموزشی|bpmn|استاندارد|مالکش|فرمول|هدفش|نقش|ورودی|خروجی|بفرست|باز کن|نشون بده|رو بده|هم هست|جزئیات|مفصل/.test(q);
 let resolved=question;
 if(/^(آموزشی|نمودار آموزشی|راهنمای تصویری)$/.test(q))resolved+=' دیاگرام';
 if(named.length===1&&state.pendingSubject&&state.document)resolved+=(state.document==='educational'?' دیاگرام آموزشی':' مدل BPMN');
 if(/^(بفرست|باز کن|نشون بده|بده|لینکش رو بده)$/.test(q)&&state.document)resolved+=(state.document==='educational'?' دیاگرام آموزشی':' مدل BPMN');
 const reply=answerQuestion(data,{...context,entity:named.length===1?named[0]:follow?state.entity??context.entity:context.entity},resolved);
 if(/آموزشی|راهنمای تصویری/.test(q))state.document='educational';else if(/bpmn|استاندارد/.test(q))state.document='bpmn';
 state.pendingSubject=Boolean(reply.clarify&&!state.entity&&/دیاگرام|bpmn|استاندارد|آموزشی/.test(q));
 return reply;
}
