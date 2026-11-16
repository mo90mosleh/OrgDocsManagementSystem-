import{test,expect}from'@playwright/test';
import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');
test('OKR appears as one shared navigation entry with three workspace tabs',async({page})=>{
 await backend(page);await page.goto('./#/okr');
 await expect(page.getByRole('heading',{name:'مدیریت OKR'})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'منوی اصلی'}).getByRole('link',{name:'مدیریت OKR'})).toHaveCount(1);
 const tabs=page.getByRole('navigation',{name:'بخش‌های مدیریت OKR'});
 await expect(tabs.getByRole('button')).toHaveCount(3);
 await expect(page.getByText(/داده‌های پاییز ۱۴۰۵ کاملاً فرضی/)).toBeVisible();
 await expect(page.locator('.okr-goal-card').first()).toBeVisible();
 await tabs.getByRole('button',{name:'اهداف و نتایج کلیدی'}).click();
 await expect(page.getByRole('button',{name:'جدولی'})).toBeVisible();
 await tabs.getByRole('button',{name:'پایش و عملکرد'}).click();
 await expect(page.getByRole('heading',{name:'تحقق اهداف به تفکیک دپارتمان'})).toBeVisible();
});
test('interactive OKR check-in updates current KR value in local demo workspace',async({page})=>{
 await backend(page);await page.goto('./#/okr');
 await page.locator('.okr-goal-card').first().click();
 await expect(page.getByRole('dialog',{name:'جزئیات هدف OKR'})).toBeVisible();
 await page.getByRole('dialog',{name:'جزئیات هدف OKR'}).getByRole('button',{name:'ثبت Check-in'}).first().click();
 const modal=page.getByRole('dialog',{name:'فرم مدیریت OKR'});
 await modal.getByRole('spinbutton').fill('2.6');
 await modal.getByRole('button',{name:'ذخیره آزمایشی'}).click();
 await expect(modal).toHaveCount(0);
 await expect(page.getByRole('dialog',{name:'جزئیات هدف OKR'})).toContainText('۲٫۶');
});
