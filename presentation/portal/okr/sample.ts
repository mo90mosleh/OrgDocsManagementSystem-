import type{OkrPortfolio}from'./model';
/** Hypothetical Rassan teaching data. Does not represent measured organization performance. */
export const autumn1405:OkrPortfolio={
 cycles:[{id:'1405-fall',title:'پاییز ۱۴۰۵',status:'ACTIVE',startDate:'2026-09-23',endDate:'2026-12-21'},{id:'1405-winter',title:'زمستان ۱۴۰۵',status:'PLANNING',startDate:'2026-12-22',endDate:'2027-03-20'}],
 objectives:[
  {id:'obj-company',code:'O-1405-01',title:'تجربه پاسخ‌گویی سریع و قابل اتکا برای مشتریان و نمایندگان بسازیم',description:'بهبود سرعت و قابلیت پیش‌بینی در نقاط تماس کلیدی مشتری و نمایندگان.',cycleId:'1405-fall',parentId:null,level:'COMPANY',ownerUnitId:'af5f5376-5b3c-4031-d565-939e5c38416a',pillar:'تجربه مشتری',confidence:'AT_RISK',processIds:['ced627f9-af79-5dfe-9190-cdaeca031416','c551529c-25e6-5a42-b616-c90a1b78a5f3']},
  {id:'obj-service',code:'O-1405-02',title:'زمان رسیدگی به درخواست‌های خدمات را کاهش دهیم',description:'تسریع رسیدگی به خدمات پس از فروش و آماده‌سازی نصب.',cycleId:'1405-fall',parentId:'obj-company',level:'DEPARTMENT',ownerUnitId:'01318825-e9fb-5ebd-88ad-d8be02603e04',pillar:'تجربه مشتری',confidence:'AT_RISK',processIds:['ced627f9-af79-5dfe-9190-cdaeca031416','ec54017b-7df1-512c-9e57-0908af19e4cf']},
  {id:'obj-sales',code:'O-1405-03',title:'فرآیندهای کلیدی فروش تهران را چابک‌تر کنیم',description:'کاهش زمان صدور اسناد و پیگیری مشتریان.',cycleId:'1405-fall',parentId:'obj-company',level:'DEPARTMENT',ownerUnitId:'7773b25b-cac4-585c-8fd6-787b28e72ebc',pillar:'رشد و فروش',confidence:'ON_TRACK',processIds:['7028d928-6f34-5a10-9e9a-327cd6e77b8c','da3102c5-d69f-5524-a3f0-8c04561cde23']},
  {id:'obj-finance',code:'O-1405-04',title:'انتقال اسناد و پرداخت‌های نمایندگان را تسریع کنیم',description:'کاهش زمان گردش اطلاعات مالی و درخواست‌های تأیید شده.',cycleId:'1405-fall',parentId:'obj-company',level:'DEPARTMENT',ownerUnitId:'58cfc43d-407c-5780-928b-02c35f544c4b',pillar:'کارایی عملیاتی',confidence:'ON_TRACK',processIds:['3c067a11-09a9-55f8-bd2a-0ed9a547ed32','6ce7a830-74af-51da-9a7b-dd2b96a92ea8']},
  {id:'obj-it',code:'O-1405-05',title:'کیفیت و سرعت پشتیبانی فناوری اطلاعات را ارتقا دهیم',description:'کاهش زمان حل درخواست و تحویل تغییرات سامانه‌ها.',cycleId:'1405-fall',parentId:'obj-company',level:'DEPARTMENT',ownerUnitId:'1b849c2e-4d2b-59db-88da-faa9cff9ce0e',pillar:'کارایی عملیاتی',confidence:'ON_TRACK',processIds:['dc8640fd-7d82-5090-95a2-a057fa6acd91','557f4a21-9db8-516f-a620-6daf742f8be1']}
 ],
 keyResults:[
  {id:'kr-org-1',objectiveId:'obj-company',title:'کاهش زمان متوسط پاسخ‌گویی به درخواست خدمات از ۵ به ۲ روز',baseline:5,target:2,current:3.3,unit:'روز',kpiId:'710c746b-8f36-5b29-b1be-a39d992d6fad',weight:1},
  {id:'kr-org-2',objectiveId:'obj-company',title:'کاهش زمان تماس اول با متقاضی نمایندگی از ۴۸ به ۱۲ ساعت',baseline:48,target:12,current:28,unit:'ساعت',kpiId:'827761ff-53cf-5e7c-acd2-6cc63e531e74',weight:1},
  {id:'kr-service-1',objectiveId:'obj-service',title:'کاهش زمان رفع درخواست خدمات از ۵ به ۲ روز',baseline:5,target:2,current:3.7,unit:'روز',kpiId:'710c746b-8f36-5b29-b1be-a39d992d6fad',weight:1},
  {id:'kr-service-2',objectiveId:'obj-service',title:'کاهش زمان انتظار برای نصب از ۷۲ به ۲۴ ساعت',baseline:72,target:24,current:43,unit:'ساعت',kpiId:'36810f5f-71ba-5e59-8227-8976417bea01',weight:1},
  {id:'kr-sales-1',objectiveId:'obj-sales',title:'کاهش زمان صدور فاکتور تهران از ۳۶ به ۱۲ ساعت',baseline:36,target:12,current:20,unit:'ساعت',kpiId:'79ade664-8ec9-5e69-9f83-62d11062d382',weight:1},
  {id:'kr-sales-2',objectiveId:'obj-sales',title:'کاهش زمان بررسی پرونده نمایندگی از ۷ به ۳ روز',baseline:7,target:3,current:4.6,unit:'روز',kpiId:'d1e1567f-7910-5485-9276-0c63e10af6a4',weight:1},
  {id:'kr-finance-1',objectiveId:'obj-finance',title:'کاهش زمان انتقال اسناد نماینده از ۴۸ به ۱۲ ساعت',baseline:48,target:12,current:19,unit:'ساعت',kpiId:'8d0c648d-a6c2-5069-bfd1-67cdfb4ec572',weight:1},
  {id:'kr-finance-2',objectiveId:'obj-finance',title:'کاهش زمان اجرای پرداخت تأییدشده از ۴۸ به ۲۴ ساعت',baseline:48,target:24,current:31,unit:'ساعت',kpiId:'5c839177-f725-5c7d-8242-e8b48df2cacb',weight:1},
  {id:'kr-it-1',objectiveId:'obj-it',title:'کاهش زمان رفع درخواست IT از ۴۸ به ۱۲ ساعت',baseline:48,target:12,current:23,unit:'ساعت',kpiId:'3c0e26ff-ecee-5b77-957c-d6716070f89d',weight:1},
  {id:'kr-it-2',objectiveId:'obj-it',title:'کاهش زمان تحویل تغییر سامانه از ۱۰ به ۵ روز',baseline:10,target:5,current:7,unit:'روز',kpiId:'ed6e0c1f-3c7e-5ed0-9d80-2a173490aebf',weight:1}
 ],
 checkins:[
  {id:'ci-demo-1',keyResultId:'kr-service-1',objectiveId:'obj-service',previous:4,value:3.7,confidence:'AT_RISK',note:'ظرفیت رسیدگی به درخواست‌های پرتعداد نیاز به بازبینی دارد.',createdAt:'2026-11-08T09:00:00.000Z'},
  {id:'ci-demo-2',keyResultId:'kr-sales-1',objectiveId:'obj-sales',previous:25,value:20,confidence:'ON_TRACK',note:'هماهنگی صدور فاکتور فروش تهران بهبود یافته است.',createdAt:'2026-11-10T09:00:00.000Z'},
  {id:'ci-demo-3',keyResultId:'kr-finance-1',objectiveId:'obj-finance',previous:25,value:19,confidence:'ON_TRACK',note:'مرحله انتقال اسناد نماینده بازبینی شد.',createdAt:'2026-11-12T09:00:00.000Z'}
 ]
};
export function sampleAutumn1405():OkrPortfolio{return JSON.parse(JSON.stringify(autumn1405)) as OkrPortfolio;}
