import {test,expect} from '@playwright/test';
import {backend} from './pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');
for(const direction of ['افقی','عمودی'])for(const type of ['سمت‌های سازمانی','دپارتمان‌ها'])
test(`selected card opens a small link action without narrowing the chart: ${type}, ${direction}`,async({page})=>{
 await backend(page);await page.goto('./#/organization/chart');
 await page.getByRole('radio',{name:type,exact:true}).click();
 await page.getByRole('radio',{name:direction,exact:true}).click();
 const label=type==='سمت‌های سازمانی'?'مدیر فروش تهران':'فروش تهران';
 const canvas=page.locator('.interactive-chart');const width=await canvas.evaluate(e=>e.getBoundingClientRect().width);
 await page.getByLabel('یافتن واحد یا سمت در چارت').fill(label);
 await page.getByRole('region',{name:'نتایج جست‌وجوی چارت'}).getByRole('button',{name:label+(type==='سمت‌های سازمانی'?' فروش تهران':''),exact:true}).click();
 await expect(page.locator('.unit-detail')).toHaveCount(0);
 const icon=page.getByRole('button',{name:'نمایش شاخص‌ها و فرآیندهای مرتبط با '+label,exact:true});
 await expect(icon).toBeVisible();
 await expect.poll(()=>canvas.evaluate(e=>e.getBoundingClientRect().width)).toBe(width);
 const card=page.getByRole('button',{name:type==='سمت‌های سازمانی'?'انتخاب سمت مدیر فروش تهران در فروش تهران':'انتخاب واحد فروش تهران',exact:true});
 await card.hover();await expect(card).toHaveCSS('cursor','pointer');
 await expect(card.locator('..')).toHaveCSS('cursor','pointer');
 await expect(card.locator('../..')).toHaveCSS('pointer-events','all');
 await card.click();await expect(page.locator('.unit-detail')).toHaveCount(0);
 await icon.click();
 await expect(page.getByRole('dialog',{name:'فرآیندها و شاخص‌های مرتبط با گره انتخاب‌شده'})).toBeVisible();
 await expect(page.locator('.unit-detail h2')).toHaveText(label);
 await expect.poll(()=>canvas.evaluate(e=>e.getBoundingClientRect().width)).toBe(width);
 for(const region of ['فرآیندهای مرتبط','شاخص‌های مرتبط']){
  const link=page.locator('.unit-detail').getByRole('region',{name:region,exact:true}).getByRole('link').first();
  await expect(link).toBeVisible();const href=await link.getAttribute('href');await link.click();
  await expect(page).toHaveURL(new RegExp(href.replace('#','#')+'$'));
  await page.getByRole('button',{name:'بازگشت به صفحهٔ قبل',exact:true}).click();
  await expect(page.locator('.unit-detail')).toHaveCount(0);
  await icon.click();
  await expect(page.locator('.unit-detail h2')).toHaveText(label);
 }
 await page.locator('.unit-detail').getByRole('button',{name:'بستن اطلاعات مرتبط'}).click();
 await expect(page.locator('.unit-detail')).toHaveCount(0);
 const toggle=card.locator('..').getByRole('button',{name:/جمع کردن .*فروش تهران/});
 await toggle.hover();await expect(card.locator('..').locator('.chart-node-preview')).toBeVisible();
 await toggle.click();
 await expect(card.locator('..').getByRole('button',{name:/باز کردن .*فروش تهران/})).toHaveAttribute('aria-expanded','false');
});
