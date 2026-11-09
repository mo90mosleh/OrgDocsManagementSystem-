import{test,expect}from'@playwright/test';
test.skip(!process.env.PAGES_BASE_PATH,'Public snapshot build only');
test('public Pages serves real 44-process snapshot without backend or login and feedback works',async({page})=>{
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4175/'))external.push(r.url());});
 await page.goto('./');await expect(page.getByRole('heading',{name:'داشبورد',exact:true})).toBeVisible();await expect(page.locator('.stat').filter({hasText:'فرآیندها'}).locator('strong')).toHaveText('۴۴');await expect(page.locator('.stat').filter({hasText:'مستندات'}).locator('strong')).toHaveText('۹۰');
 await page.goto('./#/processes');await expect(page.locator('tbody tr')).toHaveCount(44);await page.getByLabel('جست‌وجو در فرآیندها').fill('RAS-U013');await page.getByRole('link',{name:'انتقال اسناد نماینده',exact:true}).click();await expect(page.locator('.draft-note')).toContainText('پیش‌نویس');await expect(page.locator('.facts')).toContainText('مالی');await expect(page.locator('.document-list article').first()).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'انتقال اسناد نماینده',exact:true})).toBeVisible();await page.goto('./#/documents');await expect(page.locator('.document-list article')).toHaveCount(90);await expect(page.locator('.document-list a[target="_blank"]')).toHaveCount(90);
 await page.locator('.profile-menu summary').click();await expect(page.getByRole('link',{name:'ورود به فضای مدیریت'})).toHaveCount(0);
 await page.getByRole('button',{name:'بازخورد',exact:true}).click();await page.getByRole('heading',{name:'مستندات',exact:true}).click();await page.getByLabel('تغییر پیشنهادی').fill('بازخورد نسخه عمومی');await page.getByRole('button',{name:'ذخیره یادداشت',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.reload();await page.getByRole('button',{name:/مشاهده بازخوردهای ثبت‌شده/}).click();await expect(page.getByRole('dialog')).toContainText('بازخورد نسخه عمومی');
 expect(errors).toEqual([]);expect(external).toEqual([]);
});
