import{test,expect}from'@playwright/test';import{backend}from'./pages-backend.mjs';
test.skip(!process.env.PAGES_BASE_PATH,'Pages build only');
async function setup(page){const d=await backend(page),position=d.positions.find(p=>p.title==='مدیر فروش تهران');
 d.persons=Array.from({length:6},(_,i)=>({id:crypto.randomUUID(),display_name:'همکار آزمون '+i,email:null,phone:'0912123456'+i,extension:'20'+i,avatar_data_url:null}));
 d.assignments=d.persons.map(p=>({id:crypto.randomUUID(),person_id:p.id,position_id:position.id}));
 await page.goto('./#/login');await page.getByLabel('ایمیل',{exact:true}).fill('mo90mosleh@gmail.com');await page.getByLabel('رمز عبور',{exact:true}).fill('correct-password');await page.getByRole('button',{name:'ورود',exact:true}).click();
 await expect(page).toHaveURL(/#\/admin$/);await expect(page.getByRole('heading',{name:'پنل مدیریت',exact:true})).toBeVisible();
 await page.goto('./#/organization/chart');await page.getByLabel('یافتن واحد یا سمت در چارت').fill(position.title);await page.getByRole('region',{name:'نتایج جست‌وجوی چارت'}).getByRole('button',{name:position.title+' فروش تهران',exact:true}).click();
 await page.getByRole('button',{name:'بستن اطلاعات مرتبط'}).click();return d;
}
test('multiple people, semantic zoom and desktop call links',async({page})=>{await setup(page);
 const card=page.getByRole('button',{name:'انتخاب سمت مدیر فروش تهران در فروش تهران',exact:true}).locator('..');
 await expect(card.locator('.person-avatar-button')).toHaveCount(3);await card.getByRole('button',{name:'اطلاعات همکار آزمون 0',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'اطلاعات همکار'});await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('link',{name:'تماس با موبایل همکار آزمون 0'})).toHaveAttribute('href','tel:09121234560');await expect(dialog.getByRole('link',{name:'تماس با داخلی همکار آزمون 0'})).toHaveAttribute('href','sip:200');
 await dialog.getByRole('button',{name:'همه افراد این جایگاه'}).click();await expect(page.locator('.person-contact-list li')).toHaveCount(6);await page.keyboard.press('Escape');
 for(let i=0;i<4;i++){await page.getByRole('button',{name:'کوچک‌نمایی چارت',exact:true}).click();await page.waitForTimeout(160);}
 await expect(card.locator('.person-avatar-button')).toHaveCount(0);await expect(card.locator('.person-avatar-more')).toBeVisible();
 for(let i=0;i<7;i++){await page.getByRole('button',{name:'بزرگ‌نمایی چارت',exact:true}).click();await page.waitForTimeout(160);}
 await expect(card.locator('.person-avatar-button')).toHaveCount(5);
});
test('mobile contact dialog omits extension and fits viewport',async({page})=>{await page.setViewportSize({width:390,height:844});await setup(page);
 const card=page.getByRole('button',{name:'انتخاب سمت مدیر فروش تهران در فروش تهران',exact:true}).locator('..');await card.getByRole('button',{name:'اطلاعات همکار آزمون 0',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'اطلاعات همکار'});await expect(dialog.getByRole('link',{name:/تماس با موبایل/})).toBeVisible();await expect(dialog.getByRole('link',{name:/تماس با داخلی/})).toHaveCount(0);
 const box=await dialog.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);await page.screenshot({path:'/tmp/nama-person-mobile.png'});
});
