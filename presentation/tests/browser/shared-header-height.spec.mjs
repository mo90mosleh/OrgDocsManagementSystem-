import{test,expect}from'@playwright/test';
import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');

for(const [width,height,expected] of [[1440,900,60],[390,844,56]]){
 test('Nama uses the same compact header height across pages at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height});await backend(page);
  const routes=['/dashboard','/organization/chart','/architecture','/processes','/kpis','/okr','/documents'];
  const measured=[];
  for(const path of routes){
   await page.goto('./#'+path);
   const bar=page.locator('.topbar');
   await expect(bar).toBeVisible();
   const size=await bar.evaluate(el=>el.getBoundingClientRect().height);
   measured.push({path,size});
   expect(Math.abs(size-expected),path+' header height').toBeLessThan(1);
   await expect(page.getByRole('button',{name:'بازگشت به صفحهٔ قبل'})).toBeVisible();
  }
  expect(new Set(measured.map(x=>Math.round(x.size))).size).toBe(1);
  await page.goto('./#/organization/chart');
  await expect(page.getByRole('radiogroup',{name:'محتوای چارت'}).getByRole('radio',{name:'سمت‌های سازمانی',exact:true})).toHaveAttribute('aria-checked','true');
  await expect(page.getByRole('radiogroup',{name:'نمایش چارت'}).getByRole('radio',{name:'نمودار',exact:true})).toHaveAttribute('aria-checked','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
