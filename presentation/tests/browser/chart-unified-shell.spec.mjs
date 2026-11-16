import{test,expect}from'@playwright/test';
import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');

test('organizational chart uses the shared compact header and existing segmented controls',async({page})=>{
 await backend(page);await page.goto('./#/organization/chart');
 const app=page.locator('.app');
 await expect(app).toHaveClass(/chart-focus-mode/);
 await expect(app).not.toHaveClass(/chart-immersive/);
 await expect(page.locator('.topbar')).toBeVisible();
 await expect(page.locator('.topbar .company-logo')).toBeVisible();
 await expect(page.locator('.topbar .chart-shell-page-title')).toBeVisible();
 await expect(page.locator('.topbar .chart-menu-toggle')).toBeVisible();
 await expect(page.locator('.side')).toBeHidden();
 await expect(page.locator('.chart-header .chart-menu-toggle')).toHaveCount(0);
 await expect(page.locator('#chart-assistance-controls')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'راهنمای این صفحه'})).toBeVisible();
 await expect(page.getByRole('button',{name:'بازگشت به صفحهٔ قبل'})).toHaveCount(1);
 for(const [label,choice] of [['محتوای چارت','سمت‌های سازمانی'],['جهت نمایش چارت','عمودی'],['نمایش چارت','نمودار']]){
  await expect(page.getByRole('radiogroup',{name:label}).getByRole('radio',{name:choice,exact:true})).toHaveAttribute('aria-checked','true');
 }
 await page.getByRole('radio',{name:'افقی',exact:true}).click();
 await expect(page.getByRole('radio',{name:'افقی',exact:true})).toHaveAttribute('aria-checked','true');
 await page.getByRole('button',{name:'حالت تمرکز چارت'}).click();
 await expect(app).toHaveClass(/chart-immersive/);
 await expect(page.locator('.topbar')).toBeHidden();
 await expect(page.locator('.chart-header-switches')).toBeHidden();
 await expect(page.locator('.interactive-chart')).toBeVisible();
 await expect(page.locator('.org-position-node')).toHaveCount(41);
 await page.getByRole('button',{name:'خروج از حالت تمرکز'}).click();
 await expect(app).not.toHaveClass(/chart-immersive/);
 await expect(page.locator('.topbar')).toBeVisible();
 await expect(page.getByRole('radio',{name:'افقی',exact:true})).toHaveAttribute('aria-checked','true');
 await expect(page.getByRole('radiogroup',{name:'محتوای چارت'})).toBeVisible();
 await page.getByRole('button',{name:'نمایش منوی اصلی چارت'}).click();
 await expect(page.getByRole('dialog',{name:'منوی چارت سازمانی'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'منوی چارت سازمانی'})).not.toBeVisible();
});
test('compact header and immersive view fit on a small mobile viewport without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await backend(page);await page.goto('./#/organization/chart');
 await expect(page.locator('.topbar')).toBeVisible();
 await expect(page.locator('.chart-shell-page-title')).toBeVisible();
 await expect(page.locator('.topbar .chart-menu-toggle')).toBeVisible();
 await expect(page.getByRole('radiogroup',{name:'نمایش چارت'})).toBeVisible();
 await expect(page.getByRole('radiogroup',{name:'محتوای چارت'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'حالت تمرکز چارت'}).click();
 await expect(page.locator('.topbar')).toBeHidden();
 await expect(page.getByRole('button',{name:'خروج از حالت تمرکز'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'خروج از حالت تمرکز'}).click();
 await expect(page.locator('.topbar')).toBeVisible();
 await page.screenshot({path:'test-results/chart-unified-shell-mobile.png',fullPage:true});
});
