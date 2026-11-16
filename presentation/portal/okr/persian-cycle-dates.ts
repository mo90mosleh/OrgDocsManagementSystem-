/** Persian-calendar cycle dates. Storage uses YYYY-MM-DD (Gregorian ISO); the UI is Jalali. */
const formatter=new Intl.DateTimeFormat('en-US-u-ca-persian',{
 year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'
});
type JalaliDate={year:number;month:number;day:number};
export type CycleDateSuggestion={start:string;end:string;startDate:string;endDate:string};
const pad=(n:number)=>String(n).padStart(2,'0');
export function normalizePersianDigits(value:string):string{
 return value.replace(/[۰-۹]/g,ch=>String(ch.charCodeAt(0)-1776)).replace(/[٠-٩]/g,ch=>String(ch.charCodeAt(0)-1632));
}
function jalaliParts(iso:string):JalaliDate|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return null;
 const timestamp=Date.parse(iso+'T12:00:00Z');
 if(!Number.isFinite(timestamp))return null;
 const parts=formatter.formatToParts(new Date(timestamp));
 const get=(name:string)=>Number(parts.find(p=>p.type===name)?.value);
 const year=get('year'),month=get('month'),day=get('day');
 if(![year,month,day].every(Number.isInteger))return null;
 return{year,month,day};
}
const order=(a:JalaliDate,b:JalaliDate)=>a.year-b.year||a.month-b.month||a.day-b.day;
const isoAt=(stamp:number)=>new Date(stamp).toISOString().slice(0,10);
export function jalaliToIso(year:number,month:number,day:number):string|null{
 if(!Number.isInteger(year)||year<1200||year>1700||!Number.isInteger(month)||month<1||month>12||!Number.isInteger(day)||day<1||day>31)return null;
 // Binary search Gregorian UTC days using ICU's Persian calendar, including leap years.
 let lo=Math.round(Date.UTC(year+620,0,1)/86400000);
 let hi=Math.round(Date.UTC(year+623,0,1)/86400000);
 const desired={year,month,day};
 while(lo<=hi){
  const mid=Math.floor((lo+hi)/2),iso=isoAt(mid*86400000),actual=jalaliParts(iso);
  if(!actual)return null;
  const compare=order(actual,desired);
  if(compare===0)return iso;
  if(compare<0)lo=mid+1;else hi=mid-1;
 }
 return null;
}
export function isoToJalaliInput(iso:string):string{
 const parts=jalaliParts(iso);
 if(!parts)return'';
 return (parts.year+'/'+pad(parts.month)+'/'+pad(parts.day)).replace(/\d/g,ch=>String.fromCharCode(ch.charCodeAt(0)+1728));
}
export function jalaliInputToIso(value:string):string|null{
 const normalized=normalizePersianDigits(value).trim().replace(/\s+/g,'');
 const match=/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(normalized);
 if(!match)return null;
 return jalaliToIso(Number(match[1]),Number(match[2]),Number(match[3]));
}
function dayBefore(iso:string):string{
 return isoAt(Date.parse(iso+'T00:00:00Z')-86400000);
}
const normalizedSeason=(input:string):number|null=>{
 const title=input.replace(/ي/g,'ی').replace(/ك/g,'ک');
 if(/بهار/.test(title))return 1;
 if(/تابستان/.test(title))return 4;
 if(/پاییز|پائيز|پاييز/.test(title))return 7;
 if(/زمستان/.test(title))return 10;
 return null;
};
export function suggestCycleDates(title:string):CycleDateSuggestion|null{
 const value=normalizePersianDigits(title).replace(/\u200c/g,' ').trim();
 const yearMatch=/(?<!\d)(1[34-6]\d{2})(?!\d)/.exec(value);
 if(!yearMatch)return null;
 const year=Number(yearMatch[1]),season=normalizedSeason(value);
 const annual=/(?:سالانه|سال|سال مالی|annual)/i.test(value)||/^\s*1[34-6]\d{2}\s*$/.test(value);
 if(season===null&&!annual)return null;
 const start=jalaliToIso(year,season??1,1);
 const next=season===null?jalaliToIso(year+1,1,1):
   season===10?jalaliToIso(year+1,1,1):jalaliToIso(year,season+3,1);
 if(!start||!next)return null;
 const end=dayBefore(next);
 return{start:isoToJalaliInput(start),end:isoToJalaliInput(end),startDate:start,endDate:end};
}
export function validateCycleRange(startText:string,endText:string):{startDate:string;endDate:string}{
 const startDate=jalaliInputToIso(startText),endDate=jalaliInputToIso(endText);
 if(!startDate)throw Error('تاریخ شروع معتبر نیست. آن را به شکل ۱۴۰۶/۰۱/۰۱ وارد کنید.');
 if(!endDate)throw Error('تاریخ پایان معتبر نیست یا روز ماه وجود ندارد.');
 if(endDate<startDate)throw Error('تاریخ پایان باید هم‌زمان یا بعد از تاریخ شروع باشد.');
 return{startDate,endDate};
}
