import type{AllowedData,PageContext,Reply}from'./types';import{normalizeQuestion,namedEntities}from'./retrieval';
export const OUT_OF_SCOPE='متاسفم، نمیتونم به این سوال پاسخ بدم';
export const refusalReply=():Reply=>({paragraphs:[OUT_OF_SCOPE],links:[],sources:[]});
export function withinScope(_data:AllowedData,_context:PageContext,question:string){
 const q=normalizeQuestion(question);
 // Policy boundary concerns confidentiality/instruction override, not topic vocabulary.
 return !/دستور.*نادیده|نادیده.*دستور|ignore.*instruction|system prompt|سیستم پرامپت|service.?role|access.?token|کلید محرمانه|رمز.*کاربر|ایمیل.*(همه|کارکنان)/i.test(q);
}
export const unavailableReply=():Reply=>({paragraphs:['فعلاً به مدل زبانی وصل نیستم، برای همین نمی‌تونم به این سؤال پاسخ قابل اتکا بدم. برای پیدا کردن فرآیندها، شاخص‌ها و مستندات نما می‌تونم کمکت کنم.'],links:[],sources:[]});
