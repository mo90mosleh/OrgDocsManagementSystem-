import{test,expect}from'@playwright/test';
import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');
test('OKR appears as one shared navigation entry with three workspace tabs',async({page})=>{
 await backend(page);await page.goto('./#/okr');
 await expect(page.getByRole('heading',{name:'مدیریت OKR'})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'منوی اصلی'}).getByRole('link',{name:'مدیریت OKR'})).toHaveCount(1);
 const tabs=page.getByRole('navigation',{name:'بخش‌های مدیریت OKR'});
 await expect(tabs.getByRole('button')).toHaveCount(3);
 await expect(page.locator('.okr-demo-banner')).toHaveCount(0);
 await expect(page.locator('.breadcrumb')).toHaveCount(0);
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

test('cycle management lists all periods and creates new ones without leaving the OKR workspace',async({page})=>{
 await backend(page);await page.goto('./#/okr');
 await page.getByRole('button',{name:'مدیریت دوره‌ها'}).click();
 const manager=page.getByRole('dialog',{name:'مدیریت دوره‌های OKR'});
 await expect(manager).toBeVisible();
 await expect(manager.locator('.okr-cycle-item')).toHaveCount(2);
 await expect(manager.getByRole('heading',{name:'پاییز ۱۴۰۵'})).toBeVisible();
 await expect(manager.getByRole('heading',{name:'زمستان ۱۴۰۵'})).toBeVisible();
 await expect(manager.getByText('۵ هدف')).toBeVisible();
 await manager.getByRole('button',{name:'دوره جدید'}).click();
 const create=page.getByRole('dialog',{name:'فرم مدیریت OKR'});
 await expect(create.getByRole('heading',{name:'ایجاد دوره جدید'})).toBeVisible();
 await create.getByRole('textbox',{name:'نام دوره'}).fill('بهار ۱۴۰۶');
 await expect(create.getByRole('textbox',{name:'تاریخ شروع (شمسی)'})).toHaveValue('۱۴۰۶/۰۱/۰۱');
 await expect(create.getByRole('textbox',{name:'تاریخ پایان (شمسی)'})).toHaveValue('۱۴۰۶/۰۳/۳۱');
 await create.getByRole('button',{name:'ذخیره آزمایشی'}).click();
 await expect(create).toHaveCount(0);
 await expect(manager.locator('.okr-cycle-item')).toHaveCount(3);
 await expect(manager.getByRole('heading',{name:'بهار ۱۴۰۶'})).toBeVisible();
 const spring=manager.locator('.okr-cycle-item').filter({has:page.getByRole('heading',{name:'بهار ۱۴۰۶'})});
 await expect(spring).toContainText('۱ فروردین ۱۴۰۶');
 await expect(spring).toContainText('۳۱ خرداد ۱۴۰۶');
 await spring.getByRole('button',{name:'ویرایش تاریخ‌ها'}).click();
 await expect(create.getByRole('heading',{name:'ویرایش دوره'})).toBeVisible();
 await create.getByRole('textbox',{name:'تاریخ شروع (شمسی)'}).fill('۱۴۰۶/۰۱/۱۰');
 await create.getByRole('button',{name:'ذخیره آزمایشی'}).click();
 await expect(create).toHaveCount(0);
 await expect(spring).toContainText('۱۰ فروردین ۱۴۰۶');
 await manager.locator('.okr-cycle-item').filter({has:page.getByRole('heading',{name:'زمستان ۱۴۰۵'})}).getByRole('button',{name:'مشاهده دوره'}).click();
 await expect(manager).toHaveCount(0);
 await expect(page.getByLabel('دوره OKR')).toHaveValue('1405-winter');
});
test('top breadcrumbs are removed from the integrated process workspace, KPI and OKR',async({page})=>{
 await backend(page);
 for(const route of ['architecture','process-map','processes','kpis','okr']){
  await page.goto('./#/'+route);
  await expect(page.locator('.breadcrumb')).toHaveCount(0);
 }
 await page.goto('./#/documents');
 await expect(page.locator('.breadcrumb')).toBeVisible();
});


test('keeps automatic schedule status without displaying expected percentages',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-11-16T12:00:00Z'));
 await backend(page);await page.goto('./#/okr');
 await expect(page.locator('.okr-goal-card.is-company .okr-status')).toHaveText('نیازمند توجه');
 await expect(page.locator('.okr-current-cycle')).not.toContainText('انتظار');
 await expect(page.locator('.okr-card-expected')).toHaveCount(0);
 await page.locator('.okr-goal-card.is-company').click();
 const details=page.getByRole('dialog',{name:'جزئیات هدف OKR'});
 await expect(details.locator('.okr-pace-detail')).toHaveCount(0);
 await expect(details.locator('.okr-detail-summary .okr-status')).toHaveText('نیازمند توجه');
 await details.getByRole('button',{name:'بستن جزئیات'}).click();
 for(const name of ['اهداف و نتایج کلیدی','پایش و عملکرد']){
  await page.getByRole('navigation',{name:'بخش‌های مدیریت OKR'}).getByRole('button',{name,exact:true}).click();
  await expect(page.locator('main')).not.toContainText('انتظار');
 }
});
