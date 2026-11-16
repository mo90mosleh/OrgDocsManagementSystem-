import{test,expect}from'@playwright/test';
import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');

test('architecture, process map and profiles are three tabs inside one process workspace',async({page})=>{
 const data=await backend(page);
 await page.goto('./#/architecture');
 const nav=page.getByRole('navigation',{name:'بخش‌های مدیریت فرآیندها'});
 await expect(page.getByRole('heading',{name:'مدیریت فرآیندها'})).toBeVisible();
 await expect(nav.getByRole('link')).toHaveCount(3);
 await expect(nav.getByRole('link',{name:'معماری فرآیندها'})).toHaveClass(/active/);
 const main=page.getByRole('navigation',{name:'منوی اصلی'});
 await expect(main.getByRole('link',{name:'مدیریت فرآیندها'})).toHaveCount(1);
 await expect(main.getByRole('link',{name:'شناسنامه فرآیندها'})).toHaveCount(0);
 await nav.getByRole('link',{name:'نقشه فرآیندها'}).click();
 await expect(page).toHaveURL(/#\/process-map$/);
 await expect(nav.getByRole('link',{name:'نقشه فرآیندها'})).toHaveClass(/active/);
 await expect(page.locator('.process-map-meta')).toContainText('۴۴ فرآیند');
 await expect(page.locator('.process-map-meta')).toContainText('۱۹ ارتباط ثبت‌شده');
 await expect(page.locator('.process-map-network')).toBeVisible();
 await nav.getByRole('link',{name:'شناسنامه فرآیندها'}).click();
 await expect(page).toHaveURL(/#\/processes$/);
 await expect(page.locator('tbody tr')).toHaveCount(data.nodes.filter(n=>n.kind==='PROCESS').length);
 await page.locator('tbody tr').first().getByRole('link').first().click();
 await expect(page).toHaveURL(/#\/processes\/[a-f0-9-]+$/);
 await expect(nav.getByRole('link',{name:'شناسنامه فرآیندها'})).toHaveClass(/active/);
});

test('interactive map shows all processes and read-only viewers can explore relationships without view toggles',async({page})=>{
 const data=await backend(page);await page.goto('./#/process-map');
 await expect(page.locator('.pm-flow-card')).toHaveCount(44);
 await expect(page.getByRole('group',{name:'نمای نقشه فرآیندها'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'تعریف ارتباط',exact:true})).toHaveCount(0);
 const origin=data.nodes.find(p=>p.id===data.relations[0].source_process_id);
 await page.getByRole('textbox',{name:'جست‌وجوی فرآیند روی نقشه'}).fill(origin.name);
 await page.locator('.pm-search-results').getByRole('button').filter({hasText:origin.name}).click();
 await expect(page.locator('.pm-selected-profile h3')).toHaveText(origin.name);
 await expect(page.locator('.pm-relations-list .process-map-neighbor')).not.toHaveCount(0);
 await expect(page.getByRole('button',{name:/ویرایش ارتباط با|حذف ارتباط با/})).toHaveCount(0);
 await page.getByRole('link',{name:'مشاهده شناسنامه',exact:true}).click();
 await expect(page).toHaveURL(new RegExp('#/processes/'+origin.id));
});
test('dashboard has four concept cards and the fourth links to OKR; menu icon is a target pierced by an arrow',async({page})=>{
 await backend(page);await page.goto('./#/dashboard');
 const cards=page.locator('.dashboard-concepts .concept-card');
 await expect(cards).toHaveCount(4);
 await expect(cards.nth(3)).toContainText('مدیریت OKR');
 await expect(page.locator('.dashboard-concepts')).not.toContainText('شناسنامهٔ فرآیندها');
 await expect(cards.nth(3).getByRole('link')).toHaveAttribute('href','#/okr');
 const icon=page.getByRole('navigation',{name:'منوی اصلی'}).getByRole('link',{name:'مدیریت OKR'}).locator('svg');
 await expect(icon.locator('circle')).toHaveCount(3);
 await expect(icon.locator('path')).toHaveCount(2);
});
test('mobile bottom navigation keeps unified process workspace and OKR without duplicate process menu entry',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await backend(page);await page.goto('./#/process-map');
 const bottom=page.getByRole('navigation',{name:'ناوبری پایین صفحه'});
 await expect(bottom.getByRole('link',{name:'فرآیندها'})).toHaveAttribute('aria-current','page');
 await expect(bottom.getByRole('link',{name:'OKR'})).toBeVisible();
 await expect(page.getByRole('navigation',{name:'بخش‌های مدیریت فرآیندها'}).getByRole('link')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/process-map-mobile.png',fullPage:true});
});
