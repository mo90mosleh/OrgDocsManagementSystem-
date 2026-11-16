export type OkrConfidence='ON_TRACK'|'AT_RISK'|'OFF_TRACK';
export type OkrLevel='COMPANY'|'DEPARTMENT';
export type OkrCycle={id:string;title:string;status:'ACTIVE'|'PLANNING'|'CLOSED';startDate:string;endDate:string};
export type OkrObjective={
 id:string;code:string;title:string;description:string;cycleId:string;parentId:string|null;
 level:OkrLevel;ownerUnitId:string|null;pillar:string;confidence:OkrConfidence;
};
export type OkrKeyResult={
 id:string;objectiveId:string;title:string;baseline:number;target:number;current:number;
 unit:string;kpiId:string|null;weight:number;
};
export type OkrCheckIn={
 id:string;keyResultId:string;objectiveId:string;previous:number;value:number;
 confidence:OkrConfidence;note:string;createdAt:string;
};
export type OkrPortfolio={cycles:OkrCycle[];objectives:OkrObjective[];keyResults:OkrKeyResult[];checkins:OkrCheckIn[]};
export const confidenceLabels:Record<OkrConfidence,string>={
 ON_TRACK:'در مسیر',AT_RISK:'نیازمند توجه',OFF_TRACK:'خارج از مسیر'
};
export const number=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
/** Visual progress band; independent of confidence/risk from check-ins. */
export type OkrProgressBand='low'|'medium'|'high';
export function progressBand(percent:number):OkrProgressBand{
 if(!Number.isFinite(percent)||percent<40)return'low';
 return percent<=70?'medium':'high';
}
export function keyResultProgress(kr:OkrKeyResult):number{
 if(![kr.baseline,kr.current,kr.target].every(Number.isFinite))return 0;
 if(kr.target===kr.baseline)return kr.current===kr.target?100:0;
 return Math.max(0,Math.min(100,Math.round(100*(kr.current-kr.baseline)/(kr.target-kr.baseline))));
}
export function objectiveProgress(portfolio:OkrPortfolio,objectiveId:string):number{
 const results=portfolio.keyResults.filter(x=>x.objectiveId===objectiveId&&x.weight>0&&Number.isFinite(x.weight));
 if(!results.length)return 0;
 const total=results.reduce((sum,x)=>sum+x.weight,0);
 return Math.round(results.reduce((sum,x)=>sum+keyResultProgress(x)*x.weight,0)/total);
}
/** The pacing benchmark is linear in elapsed calendar days of the selected OKR cycle. */
export type OkrPaceStatus=OkrConfidence|'NOT_STARTED'|'NO_DATA';
export type OkrPace={status:OkrPaceStatus;actual:number;expected:number|null;gap:number|null};
export const paceStatusLabels:Record<OkrPaceStatus,string>={
 ...confidenceLabels,NOT_STARTED:'شروع‌نشده',NO_DATA:'بدون داده'
};
const utcDay=(date:Date)=>Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000;
function isoDay(value:string):number|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const parsed=Date.parse(value+'T00:00:00Z');
 if(!Number.isFinite(parsed)||new Date(parsed).toISOString().slice(0,10)!==value)return null;
 return parsed/86400000;
}
export function expectedCycleProgress(cycle:OkrCycle,asOf:Date):number|null{
 const first=isoDay(cycle.startDate),last=isoDay(cycle.endDate);
 if(first===null||last===null||last<=first||!Number.isFinite(asOf.getTime()))return null;
 const elapsed=utcDay(asOf)-first;
 return Math.max(0,Math.min(100,Math.round(elapsed/(last-first)*100)));
}
export function objectivePace(portfolio:OkrPortfolio,objectiveId:string,asOf:Date):OkrPace{
 const objective=portfolio.objectives.find(x=>x.id===objectiveId);
 const actual=objectiveProgress(portfolio,objectiveId);
 const cycle=portfolio.cycles.find(x=>x.id===objective?.cycleId);
 const expected=cycle?expectedCycleProgress(cycle,asOf):null;
 const hasResults=portfolio.keyResults.some(x=>x.objectiveId===objectiveId&&x.weight>0&&Number.isFinite(x.weight));
 if(!objective||!hasResults||expected===null)return{status:'NO_DATA',actual,expected,gap:null};
 const first=isoDay(cycle!.startDate);
 if(first!==null&&utcDay(asOf)<first)return{status:'NOT_STARTED',actual,expected,gap:actual-expected};
 const gap=actual-expected;
 // 0pp deficit: on track; 1..15pp behind: at risk; >15pp behind: off track.
 const status:OkrConfidence=gap>=0?'ON_TRACK':gap>=-15?'AT_RISK':'OFF_TRACK';
 return{status,actual,expected,gap};
}
export function averageProgress(portfolio:OkrPortfolio,cycleId:string):number{
 const rootObjectives=portfolio.objectives.filter(x=>x.cycleId===cycleId&&x.level==='COMPANY');
 const base=rootObjectives.length?rootObjectives:portfolio.objectives.filter(x=>x.cycleId===cycleId);
 if(!base.length)return 0;
 return Math.round(base.reduce((total,x)=>total+objectiveProgress(portfolio,x.id),0)/base.length);
}
export function activeObjectives(portfolio:OkrPortfolio,cycleId:string):OkrObjective[]{
 return portfolio.objectives.filter(x=>x.cycleId===cycleId);
}
export function registerCheckIn(portfolio:OkrPortfolio,input:{keyResultId:string;value:number;note:string},createdAt:string):OkrPortfolio{
 if(!Number.isFinite(input.value)||!Number.isFinite(new Date(createdAt).getTime()))throw Error('مقدار یا تاریخ Check-in معتبر نیست.');
 const kr=portfolio.keyResults.find(x=>x.id===input.keyResultId);
 if(!kr)throw Error('نتیجهٔ کلیدی پیدا نشد.');
 const note=input.note.trim().slice(0,800);
 const updatedResults=portfolio.keyResults.map(x=>x.id===kr.id?{...x,current:input.value}:x);
 const next={...portfolio,keyResults:updatedResults};
 const calculated=objectivePace(next,kr.objectiveId,new Date(createdAt));
 const confidence:OkrConfidence=calculated.status==='ON_TRACK'||calculated.status==='AT_RISK'||calculated.status==='OFF_TRACK'?calculated.status:portfolio.objectives.find(x=>x.id===kr.objectiveId)?.confidence??'ON_TRACK';
 return{
  ...next,
  objectives:portfolio.objectives.map(x=>x.id===kr.objectiveId?{...x,confidence}:x),
  checkins:[...portfolio.checkins,{id:'ci-'+createdAt+'-'+portfolio.checkins.length,keyResultId:kr.id,objectiveId:kr.objectiveId,previous:kr.current,value:input.value,confidence,note,createdAt}]
 };
}
export function portfolioIsValid(value:unknown):value is OkrPortfolio{
 if(!value||typeof value!=='object')return false;
 const p=value as Partial<OkrPortfolio>;
 return Array.isArray(p.cycles)&&Array.isArray(p.objectives)&&Array.isArray(p.keyResults)&&Array.isArray(p.checkins)
 &&p.objectives.every(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&typeof x.cycleId==='string')
 &&p.keyResults.every(x=>x&&typeof x.id==='string'&&typeof x.objectiveId==='string'&&Number.isFinite(x.baseline)&&Number.isFinite(x.current)&&Number.isFinite(x.target));
}
export function withObjective(portfolio:OkrPortfolio,objective:OkrObjective):OkrPortfolio{
 if(!objective.title.trim()||!portfolio.cycles.some(c=>c.id===objective.cycleId))throw Error('مشخصات هدف معتبر نیست.');
 if(objective.parentId&&!portfolio.objectives.some(x=>x.id===objective.parentId&&x.cycleId===objective.cycleId))throw Error('هدف بالادستی معتبر نیست.');
 return {...portfolio,objectives:[...portfolio.objectives,objective]};
}
export function withKeyResult(portfolio:OkrPortfolio,kr:OkrKeyResult):OkrPortfolio{
 if(!portfolio.objectives.some(x=>x.id===kr.objectiveId)||!kr.title.trim()||!Number.isFinite(kr.target)||!Number.isFinite(kr.baseline))throw Error('مشخصات نتیجه کلیدی معتبر نیست.');
 return {...portfolio,keyResults:[...portfolio.keyResults,kr]};
}
/** Remove retired direct process links from browser drafts without changing KR history. */
export function withoutProcessLinks(portfolio:OkrPortfolio):OkrPortfolio{
 return {...portfolio,objectives:portfolio.objectives.map(objective=>{
  const {processIds:retired,...current}=objective as OkrObjective&{processIds?:unknown};
  return current;
 })};
}
