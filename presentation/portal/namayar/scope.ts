import type{AllowedData,PageContext,Reply}from'./types';import{normalizeQuestion,namedEntities}from'./retrieval';
export const OUT_OF_SCOPE='متاسفم، نمیتونم به این سوال پاسخ بدم';
export const refusalReply=():Reply=>({paragraphs:[OUT_OF_SCOPE],links:[],sources:[]});
export function withinScope(data:AllowedData,context:PageContext,question:string){const q=normalizeQuestion(question);if(!q)return true;
 // Off-topic and rule-bypass requests are rejected even when they mention a real process/KPI.
 if(/آب و هوا|هوا چطور|هواشناسی|سیاست|سیاسی|انتخابات|پزشکی|دارو|بیماری|جوک|لطیفه|شعر|داستان بنویس|داستان بگو|ترجمه کن|ترجمه متن|کد پایتون|کد جاوا|برنامه نویسی|اسکریپت بنویس|دستور.*نادیده|نادیده.*دستور|قانون.*نادیده|پایتخت|طرز پخت|فرایند پخت|فرآیند پخت|بازیگر|پیش بینی هوا|ignore.*instruction|system prompt|سیستم پرامپت|مسابقه فوتبال|نتیجه فوتبال|اخبار جهان|قیمت دلار|پیش بینی بورس|حل معادله|طرز تهیه|دستور پخت|موسیقی|آهنگ|تعبیر خواب|ساختمان|دکوراسیون|نامه عاشقانه|انشا بنویس|معماری خانه/.test(q))return false;
 if(context.questions.some(s=>normalizeQuestion(s)===q)||/^(سلام|درود|ممنون|متشکرم|تشکر)$/.test(q)||/چه کاری می تونی|چه کمکی می کنی|قابلیت های تو/.test(q))return true;
 if(/نما|نمایار|چارت|معماری|فرایند|فرآیند|شناسنامه|شاخص|kpi|bpmn|دپارتمان|واحد|ساختار سازمان|سمت|گزارش دهی|تور|فیلتر|سند|مستند|دیاگرام|پیش نویس|زیرمجموعه|داده.*آماد|آمادگی|ورود|حساب مدیر|تایید ایمیل|تأیید ایمیل|بازیابی رمز|رمز عبور|لوگو|تنظیمات سازمان|l[0-3]|خطای ذخیره/.test(q))return true;
 if(namedEntities(data,q).length)return true;
 if(context.entity&&(/(?:این|همین) (?:فرایند|فرآیند|شاخص|واحد|سمت|بخش|صفحه|سند|مدل|دپارتمان)/.test(q)||/^(این|همین) (چیه|چیست)$/.test(q)||/مالکش|هدفش|فرمولش|دیاگرامش|منبعش|درگیرش|داده ش/.test(q)||/^(مالک|هدف|فرمول|منبع داده|تناوب|واحد سنجش|ورودی ها|خروجی ها|آغاز|پایان) (چیه|چیست|کیه|کجاست|ش|رو|را|این|همین)/.test(q)||/^(چه|کدام|به چه) (کسانی|شاخص|فرایند|فرآیند|نقش)/.test(q)))return true;
 if(context.pageType!=='unknown'&&/^(مالکش|چه کسانی.*درگیر|منبع داده ش)/.test(q))return true;
 return context.pageType!=='unknown'&&/^(این|همین|اینجا)( صفحه| بخش)? (چیه|چیست|چه کاربردی دارد|چطور کار می کند)$/.test(q);
}
