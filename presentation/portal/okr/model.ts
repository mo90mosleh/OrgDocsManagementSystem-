export type OkrConfidence='ON_TRACK'|'AT_RISK'|'OFF_TRACK';
export type OkrLevel='COMPANY'|'DEPARTMENT';
export type OkrCycle={id:string;title:string;status:'ACTIVE'|'PLANNING'|'CLOSED';startDate:string;endDate:string};
export type OkrObjective={
 id:string;code:string;title:string;description:string;cycleId:string;parentId:string|null;
 level:OkrLevel;ownerUnitId:string|null;pillar:string;confidence:OkrConfidence;processIds:string[];
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
export function averageProgress(portfolio:OkrPortfolio,cycleId:string):number{
 const rootObjectives=portfolio.objectives.filter(x=>x.cycleId===cycleId&&x.level==='COMPANY');
 const base=rootObjectives.length?rootObjectives:portfolio.objectives.filter(x=>x.cycleId===cycleId);
 if(!base.length)return 0;
 return Math.round(base.reduce((total,x)=>total+objectiveProgress(portfolio,x.id),0)/base.length);
}
export function activeObjectives(portfolio:OkrPortfolio,cycleId:string):OkrObjective[]{
 return portfolio.objectives.filter(x=>x.cycleId===cycleId);
}
export function registerCheckIn(portfolio:OkrPortfolio,input:{keyResultId:string;value:number;confidence:OkrConfidence;note:string},createdAt:string):OkrPortfolio{
 if(!Number.isFinite(input.value)||!Number.isFinite(new Date(createdAt).getTime()))throw Error('مقدار یا تاریخ Check-in معتبر نیست.');
 const kr=portfolio.keyResults.find(x=>x.id===input.keyResultId);
 if(!kr)throw Error('نتیجهٔ کلیدی پیدا نشد.');
 if(!['ON_TRACK','AT_RISK','OFF_TRACK'].includes(input.confidence))throw Error('وضعیت اطمینان معتبر نیست.');
 const note=input.note.trim().slice(0,800);
 return{
  ...portfolio,
  keyResults:portfolio.keyResults.map(x=>x.id===kr.id?{...x,current:input.value}:x),
  objectives:portfolio.objectives.map(x=>x.id===kr.objectiveId?{...x,confidence:input.confidence}:x),
  checkins:[...portfolio.checkins,{id:'ci-'+createdAt+'-'+portfolio.checkins.length,keyResultId:kr.id,objectiveId:kr.objectiveId,previous:kr.current,value:input.value,confidence:input.confidence,note,createdAt}]
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