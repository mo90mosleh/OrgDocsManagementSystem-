import{test,expect}from'@playwright/test';import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');
test('evaluation levels filter correctly and detail identifies the linked role',async({page})=>{
 await backend(page);await page.goto('./#/kpis');
 await expect(page.getByRole('heading',{name:'شاخص‌های ارزیابی عملکرد',exact:true})).toBeVisible();
 await page.getByRole('combobox',{name:'سطح ارزیابی',exact:true}).selectOption('DEPARTMENT');await expect(page.locator('tbody tr')).toHaveCount(27);
 await page.getByRole('combobox',{name:'سطح ارزیابی',exact:true}).selectOption('POSITION');await expect(page.locator('tbody tr')).toHaveCount(17);
 await page.getByRole('textbox',{name:'جست‌وجو در شاخص‌ها',exact:true}).fill('KPI-RAS-U027');await expect(page.locator('tbody tr')).toHaveCount(1);
 await expect(page.locator('tbody tr')).toContainText('کارشناس فروش');await expect(page.locator('tbody tr')).toContainText('فروش تهران');
 await page.locator('tbody a').first().click();await expect(page.locator('.facts')).toContainText('کارشناس فروش');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
