import{test,expect}from'@playwright/test';
import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');
for(const width of [320,390,760])test(`filters and architecture controls fit ${width}px mobile screens`,async({page})=>{
 await page.setViewportSize({width,height:844});await backend(page);
 const fits=async locator=>{
  for(const element of await locator.all()){
   const box=await element.boundingBox();if(!box)continue;
   expect(box.x).toBeGreaterThanOrEqual(-1);expect(box.x+box.width).toBeLessThanOrEqual(width+1);
   expect(box.height).toBeGreaterThanOrEqual(42);
  }
 };
 for(const route of ['kpis','processes']){
  await page.goto('./#/'+route);
  const filters=page.locator('.mobile-filter-disclosure');
  await filters.locator('summary').click();
  await fits(page.locator('.toolbar select'));
  const department=page.getByLabel('فیلتر دپارتمان'),position=page.getByLabel('فیلتر سمت سازمانی');
  const a=await department.boundingBox(),b=await position.boundingBox();
  expect(Math.abs(a.y-b.y)).toBeLessThan(2);
  await department.selectOption({index:1});
  await expect(page.locator('.organization-filter-note')).toBeVisible();
  await page.getByRole('button',{name:'پاک کردن فیلتر سازمانی',exact:true}).click();
  await expect(department).toHaveValue('');
 }
 await page.goto('./#/architecture');
 await page.getByRole('radio',{name:'درختی',exact:true}).click();
 await fits(page.locator('.architecture-tools button.secondary'));
 await page.getByRole('button',{name:'بستن همه',exact:true}).click();
 await page.getByRole('button',{name:'باز کردن همه',exact:true}).click();
 await expect(page.locator('.architecture-tree-row').first()).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
