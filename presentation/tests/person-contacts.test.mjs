import{test}from'node:test';import assert from'node:assert/strict';import{dialNumber}from'../portal/contact-numbers.ts';
test('contact numbers normalize digits without allowing URI injection',()=>{
 assert.equal(dialNumber('۰۹۱۲ ۱۲۳-۴۵۶۷'),'09121234567');assert.equal(dialNumber('+98 (912) 123 4567'),'+989121234567');assert.equal(dialNumber('٢٠١'),'201');
 for(const value of ['','sip:201','201?x=a','javascript:alert(1)','201@example.test','12;345'])assert.equal(dialNumber(value),null);
});
