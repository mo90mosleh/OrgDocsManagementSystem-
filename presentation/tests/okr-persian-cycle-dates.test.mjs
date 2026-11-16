import{test}from'node:test';
import assert from'node:assert/strict';
import{isoToJalaliInput,jalaliInputToIso,jalaliToIso,suggestCycleDates,validateCycleRange,normalizePersianDigits}from'../portal/okr/persian-cycle-dates.ts';

test('season names and Persian/Latin numerals auto-generate exact Jalali season boundaries',()=>{
 const spring=suggestCycleDates('بهار ۱۴۰۶');
 assert.deepEqual(spring,{start:'۱۴۰۶/۰۱/۰۱',end:'۱۴۰۶/۰۳/۳۱',startDate:'2027-03-21',endDate:'2027-06-21'});
 assert.deepEqual(suggestCycleDates('بهار 1406'),spring);
 assert.equal(suggestCycleDates('تابستان ۱۴۰۶')?.start,'۱۴۰۶/۰۴/۰۱');
 assert.equal(suggestCycleDates('تابستان ۱۴۰۶')?.end,'۱۴۰۶/۰۶/۳۱');
 assert.equal(suggestCycleDates('پاییز ۱۴۰۵')?.start,'۱۴۰۵/۰۷/۰۱');
 assert.equal(suggestCycleDates('پاییز ۱۴۰۵')?.end,'۱۴۰۵/۰۹/۳۰');
 const winter=suggestCycleDates('زمستان ۱۴۰۵');
 assert.equal(winter?.startDate,'2026-12-22');
 assert.equal(winter?.endDate,'2027-03-20');
 assert.equal(winter?.end,'۱۴۰۵/۱۲/۲۹');
 assert.equal(suggestCycleDates('دوره جدید'),null);
});
test('annual cycles correctly account for leap-year length and last Esfand day',()=>{
 const annual=suggestCycleDates('سال ۱۴۰۶');
 assert.equal(annual?.start,'۱۴۰۶/۰۱/۰۱');
 assert.equal(annual?.end?.startsWith('۱۴۰۶/۱۲/'),true);
 assert.equal(jalaliInputToIso(annual.end),annual.endDate);
 const annual1403=suggestCycleDates('سالانه ۱۴۰۳');
 assert.equal(annual1403?.end,'۱۴۰۳/۱۲/۳۰');
 assert.equal(jalaliInputToIso('۱۴۰۳/۱۲/۳۰')!==null,true);
 assert.equal(jalaliInputToIso('۱۴۰۵/۱۲/۳۰'),null);
});
test('user-customized Persian dates convert to persisted ISO and validate order and real dates',()=>{
 const range=validateCycleRange('۱۴۰۶/۰۱/۱۵','۱۴۰۶/۰۲/۲۰');
 assert.equal(isoToJalaliInput(range.startDate),'۱۴۰۶/۰۱/۱۵');
 assert.equal(isoToJalaliInput(range.endDate),'۱۴۰۶/۰۲/۲۰');
 assert.equal(jalaliToIso(1406,1,1),'2027-03-21');
 assert.equal(normalizePersianDigits('۱۴۰۶/٠١/۰۱'),'1406/01/01');
 assert.deepEqual(validateCycleRange('1406/01/01','1406/03/31'),{startDate:'2027-03-21',endDate:'2027-06-21'});
 assert.throws(()=>validateCycleRange('۱۴۰۶/۰۲/۱۵','۱۴۰۶/۰۱/۱۵'),/تاریخ پایان/);
 assert.throws(()=>validateCycleRange('۱۴۰۶/۱۳/۰۱','۱۴۰۶/۰۳/۳۱'),/تاریخ شروع/);
 assert.throws(()=>validateCycleRange('۱۴۰۶/۰۱/۰۱','۱۴۰۶/۰۷/۳۱'),/تاریخ پایان/);
 assert.throws(()=>validateCycleRange('','۱۴۰۶/۰۳/۳۱'),/تاریخ شروع/);
});
test('cycle form keeps date fields editable and distinguishes creation from editing',async()=>{
 const source=await(await import('node:fs/promises')).readFile(new URL('../portal/okr/OkrWorkspace.tsx',import.meta.url),'utf8');
 assert.match(source,/changeCycleName/);
 assert.match(source,/suggestCycleDates\(title\)/);
 assert.match(source,/editedStart:true/);
 assert.match(source,/editedEnd:true/);
 assert.match(source,/validateCycleRange\(cycleDraft\.start,cycleDraft\.end\)/);
 assert.match(source,/cycleId:c\.id/);
 assert.match(source,/startDate,endDate/);
});
