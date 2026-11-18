import{test,expect}from'@playwright/test';
import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');
async function visitSearch(page,title){
 await page.getByLabel('یافتن واحد، سمت یا شخص در چارت').fill(title);
 const results=page.getByRole('region',{name:'نتایج جست‌وجوی چارت'});
 await results.getByRole('button',{name:new RegExp(title)}).first().click();
 await expect(page.locator('.chart-insight-popover h2')).toContainText(title);
}
test('organizational ancestry and visited-card previous/next preserve reporting context',async({page})=>{
 await backend(page);await page.goto('./#/organization/chart');
 await visitSearch(page,'مدیر فروش تهران');
 const chart=page.getByRole('navigation',{name:'مسیر سازمانی و تاریخچه بازدید'});
 await expect(chart).toBeVisible();
 await expect(chart.locator('.chart-crumb button.current')).toContainText('مدیر فروش تهران');
 const firstLink=page.url();
 await visitSearch(page,'مدیر فروش شهرستان');
 await expect(chart.getByRole('button',{name:'کارت قبلی'})).toBeEnabled();
 await chart.getByRole('button',{name:'کارت قبلی'}).click();
 await expect(page.locator('.chart-insight-popover h2')).toHaveText('مدیر فروش تهران');
 await expect(page).toHaveURL(firstLink);
 await chart.getByRole('button',{name:'کارت بعدی'}).click();
 await expect(page.locator('.chart-insight-popover h2')).toHaveText('مدیر فروش شهرستان');
 expect(await page.locator('.flow-org-node.on-reporting-path').count()).toBeGreaterThan(0);
});
test('direct chart link loads chosen card with KPI-first popup in a fresh browser view',async({page,context})=>{
 await backend(page);await page.goto('./#/organization/chart');
 await visitSearch(page,'مدیر فروش تهران');
 const selectedUrl=page.url();
 await expect(page.getByRole('button',{name:'کپی لینک مستقیم کارت انتخاب‌شده'})).toBeVisible();
 expect(selectedUrl).toContain('node=');
 expect(selectedUrl).toContain('kind=position');
 const fresh=await context.newPage();
 await backend(fresh);
 await fresh.goto(selectedUrl);
 await expect(fresh.locator('.chart-insight-popover h2')).toHaveText('مدیر فروش تهران');
 await expect(fresh.getByRole('radiogroup',{name:'نمایش اطلاعات مرتبط'}).getByRole('radio',{name:/^شاخص‌ها/})).toHaveAttribute('aria-checked','true');
 expect(await fresh.locator('.flow-org-node.on-reporting-path').count()).toBeGreaterThan(0);
 await fresh.close();
});
