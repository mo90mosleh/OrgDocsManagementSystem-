import{test,expect}from'@playwright/test';import{readFile}from'node:fs/promises';
const path=process.env.RASSAN_TEST_PAYLOAD;test.skip(!path,'Private package supplied explicitly for isolated testing only');
let d;
if(path){const p=JSON.parse(await readFile(path,'utf8'));const rows=t=>p.items.filter(i=>i.table===t).map(i=>i.values);d={organization:{id:p.organization_id,name:'شیرآلات راسان',display_name:'نما',primary_color:'#bd2739',logo_data_url:null},units:rows('org_units'),nodes:rows('process_nodes'),profiles:rows('process_profiles'),kpis:rows('kpis'),links:rows('process_kpis'),documents:rows('documents'),references:rows('bpms_references'),relations:rows('process_relations'),requirements:rows('kpi_data_requirements'),positions:[],persons:[],assignments:[],user:{name:'بازبین ارائه',email:'',role:'VIEWER'}};}
test('44 imported process review: source, draft, docs, owner filter, KPI requirements',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('http://127.0.0.1:4176/api/data',r=>r.fulfill({json:d}));
 await page.goto('http://127.0.0.1:4176/dashboard');await expect(page.locator('.stat').filter({hasText:'فرآیندها'}).locator('strong')).toHaveText('۴۴');await expect(page.locator('.stat').filter({hasText:'مستندات'}).locator('strong')).toHaveText('۹۰');
 for(const[code,name,owner]of [['RAS-U013','انتقال اسناد نماینده','مالی'],['RAS-U027','فروش (تهران)','فروش تهران'],['RAS-U038','درخواست کارت پاداش','خدمات پس از فروش']]){
  await page.goto('http://127.0.0.1:4176/processes');await page.getByLabel('جست‌وجو در فرآیندها').fill(code);await page.getByRole('link',{name,exact:true}).click();await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();await expect(page.locator('.facts')).toContainText(owner);await expect(page.locator('.draft-note')).toContainText('پیش‌نویس');await expect(page.getByRole('heading',{name:'پرسش باز',exact:true})).toBeVisible();const process=d.nodes.find(n=>n.code===code),doc=d.documents.find(x=>x.process_id===process.id&&x.doc_type==='BPMN2_PDF');await expect(page.locator('.document-list a[href="'+doc.external_url+'"]')).toHaveText('باز کردن سند مرجع ↗');await expect(page.getByText('ویرایش شناسنامه',{exact:true})).toHaveCount(0);
 }
 await page.goto('http://127.0.0.1:4176/processes');await page.getByLabel('واحد مالک',{exact:true}).selectOption(d.units.find(u=>u.name==='مالی').id);await expect(page.locator('tbody tr')).toHaveCount(5);
 await page.goto('http://127.0.0.1:4176/kpis/'+d.kpis[0].id);await expect(page.locator('.requirement')).toHaveCount(3);await expect(page.locator('main')).toContainText('تعیین نشده');
 await page.goto('http://127.0.0.1:4176/documents');await expect(page.locator('.document-list article')).toHaveCount(90);expect(errors).toEqual([]);
});
