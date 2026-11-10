import{build}from'esbuild';import{createHash}from'node:crypto';import{readFile,writeFile,mkdir,cp}from'node:fs/promises';
const result=await build({entryPoints:['portal/main.tsx'],bundle:true,minify:true,write:false,outfile:'portal.js',format:'iife',platform:'browser',target:'es2022',jsx:'automatic',loader:{'.woff2':'dataurl','.png':'dataurl'},define:{'process.env.NODE_ENV':'"production"'}});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text.replace(/<\/script/gi,'<\\/script');const css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;

await mkdir('pages',{recursive:true});
// GitHub Pages: cacheable, fingerprinted ESM chunks instead of an inlined mega-HTML.
// Keep the private Worker artifact unchanged (it still receives the IIFE above).
const publicBuild=await build({
 entryPoints:['portal/main.tsx'],bundle:true,minify:true,write:true,
 outdir:'pages',entryNames:'assets/[name]-[hash]',chunkNames:'assets/chunks/[name]-[hash]',assetNames:'assets/media/[name]-[hash]',
 format:'esm',splitting:true,platform:'browser',target:'es2022',jsx:'automatic',metafile:true,
 loader:{'.woff2':'file','.png':'file'},
 define:{'process.env.NODE_ENV':'"production"'}
});
const publicEntry=Object.entries(publicBuild.metafile.outputs).find(([,meta])=>meta.entryPoint==='portal/main.tsx');
if(!publicEntry)throw Error('Public entry chunk not generated');
const publicHref=(path)=>'./'+path.replace(/^pages\\//,'');
const publicJsHref=publicHref(publicEntry[0]);
const publicCssHref=publicEntry[1].cssBundle?publicHref(publicEntry[1].cssBundle):null;
if(!publicCssHref)throw Error('Public CSS bundle not generated');
console.log('Cacheable public assets:',publicJsHref,publicCssHref);

const publicConfig=JSON.parse(await readFile('pages-config.json','utf8'));const adminUrl='https://orgdocs-demo.mo90mosleh.chatgpt.site/admin';
const snapshot=process.env.PAGES_SNAPSHOT==='1';
function html(mode){
 const cfg=mode==='public'?(snapshot?{...publicConfig,mode,authEnabled:true,organizationId:'8847c22d-0282-5b07-80b1-d34bc41a4efa',adminUrl:'#/login',snapshotPath:'./rassan-presentation.json'}:{...publicConfig,mode,adminUrl}):{mode,adminUrl:'/login'};
 const styles=mode==='public'?'<link rel="stylesheet" href="'+publicCssHref+'">':'<style>'+css+'</style>';
 const scripts=mode==='public'?'<script type="module" src="'+publicJsHref+'"></script>':'<script>'+js+'</script>';
 return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#bd2739"><title>نما | مدیریت سازمان و عملکرد</title>'+styles+'</head><body><div id="app"></div><script>window.__ORGDEMO_HASH_ROUTING__='+(mode==='public')+';window.__PORTAL_CONFIG__='+JSON.stringify(cfg)+';</script>'+scripts+'</body></html>';
}
const ico=await readFile('portal/assets/favicon.ico'),svg=await readFile('portal/assets/favicon.svg','utf8'),apple=await readFile('portal/assets/apple-touch-icon.png');const version=createHash('sha256').update(ico).digest('hex').slice(0,8);
function icons(mode){const base=mode==='public'?'./':'/';return '<link rel=\"icon\" type=\"image/svg+xml\" href=\"'+base+'favicon.svg?v='+version+'\"><link rel=\"icon\" type=\"image/x-icon\" href=\"'+base+'favicon.ico?v='+version+'\"><link rel=\"apple-touch-icon\" href=\"'+base+'apple-touch-icon.png?v='+version+'\">';}
const privateHtml=html('private').replace('</head>',icons('private')+'</head>'),publicHtml=html('public').replace('</head>',icons('public')+'</head>');const source=(await readFile('worker/index.js','utf8')).replace("'__PORTAL_HTML__'",()=>JSON.stringify(privateHtml)).replace("'__FAVICON_ICO__'",()=>JSON.stringify(ico.toString('base64'))).replace("'__FAVICON_SVG__'",()=>JSON.stringify(svg)).replace("'__APPLE_ICON__'",()=>JSON.stringify(apple.toString('base64')));await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});await writeFile('dist/server/index.js',source);await cp('.openai/hosting.json','dist/.openai/hosting.json');
await mkdir('pages',{recursive:true});await writeFile('pages/index.html',publicHtml);await writeFile('pages/.nojekyll','');await writeFile('pages/README.md','# نما — خروجی عمومی\n\nنسخهٔ ارائه برای مشاهدهٔ ساختار سازمان، معماری، شناسنامه‌ها و شاخص‌ها. داده‌ها در پروژهٔ مستقل Supabase نگهداری می‌شوند. اطلاعات فرضی قبلی با حذف برچسب رابط به دادهٔ تأییدشدهٔ کسب‌وکار تبدیل نمی‌شوند. هیچ کلید مدیریتی در این خروجی نیست.\n\nپنل مدیریت به سایت خصوصی و ورود مالک متصل است. مشاهده‌گر عمومی تنظیمات و اطلاعات تماس اشخاص را نمی‌بیند.\n\nبازخوردهای محلی با کلید orgdocs-feedback-v1 حفظ می‌شوند؛ فایل JSON فقط یادداشت‌های باز را در گفتگوی پروژه پیوست کنید.\n');await cp('portal/assets/OFL.txt','pages/FONT-LICENSE.txt');console.log('Built نما: private management + public viewer, local Vazirmatn, English RASSAN logo, existing feedback.');

for(const file of ['favicon.svg','favicon.ico','apple-touch-icon.png'])await cp('portal/assets/'+file,'pages/'+file);

if(snapshot){await cp('data/rassan-presentation.json','pages/rassan-presentation.json');await writeFile('pages/README.md','# نما — ارائه عمومی راسان\n\n۴۴ فرآیند، ۴۴ شناسنامه، ۴۴ شاخص و ۹۰ ارجاع سند از بستهٔ بازنگری ۰٫۱ (۲۰۲۶-۱۱-۰۴). پیشنهادها پیش‌نویس هستند. انتشار داده‌ها و لینک‌ها با دستور صریح مالک انجام شده است.\n\nدادهٔ زنده از Supabase خوانده می‌شود و در قطع اتصال، نسخهٔ ذخیره‌شده برای مشاهده باقی می‌ماند. Render لازم نیست. بازدید عمومی بدون ورود است. ورود مدیریتی با ایمیل/رمز Supabase انجام می‌شود؛ مدیر تأییدشده می‌تواند ساختار سازمان، شناسنامه‌ها و برند را در دیتابیس ذخیره کند. در قطع اتصال، نسخهٔ ذخیره‌شده با پیام مشخص و بدون ویرایش نمایش داده می‌شود. بازخوردها در مرورگر ذخیره و به JSON صادر می‌شوند.\n');}
await import('./build-licenses.mjs');

// Preserve the separately maintained verification page in Pages releases.
await cp('namayar-groq-test.html','pages/namayar-groq-test.html');
