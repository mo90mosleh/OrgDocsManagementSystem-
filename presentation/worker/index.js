const ORG='a0000000-0000-4000-8000-000000000001';
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
class ApiError extends Error {constructor(status,message){super(message);this.status=status;}}
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:JSON_HEADERS});
function identity(request,env){if(env.REQUEST_IDENTITY?.authenticated===true)return env.REQUEST_IDENTITY;const email=request.headers.get('oai-authenticated-user-email')||'';let name=request.headers.get('oai-authenticated-user-full-name')||email.split('@')[0]||'مشاهده‌گر';if(request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){try{name=decodeURIComponent(name);}catch{}}return {name,email,role:email&&email.toLowerCase()===env.OWNER_EMAIL?.toLowerCase()?'ADMIN':'VIEWER'};}
async function rest(env,table,query,options={}){
 if(!env.SUPABASE_URL||!env.SUPABASE_PUBLISHABLE_KEY)throw new ApiError(503,'اتصال دیتابیس پیکربندی نشده است.');
 const headers={apikey:env.SUPABASE_PUBLISHABLE_KEY,...options.headers};
 const response=await fetch(env.SUPABASE_URL+'/rest/v1/'+table+'?'+query,{...options,headers,signal:AbortSignal.timeout(15000)});
 if(!response.ok){let info={};try{info=await response.json();}catch{}if(info.code==='23503')throw new ApiError(409,'این رکورد وابستگی دارد یا مرجع انتخاب‌شده معتبر نیست. ابتدا وابستگی‌ها را اصلاح کنید.');if(info.code==='23505')throw new ApiError(409,'این کد یا تخصیص قبلاً ثبت شده است.');if(info.code==='23514')throw new ApiError(400,info.message?.includes('cycle')?'انتخاب این والد باعث ایجاد چرخه می‌شود.':'اطلاعات رکورد با قواعد سامانه سازگار نیست.');if(['42501','PGRST301'].includes(info.code))throw new ApiError(403,'اجازهٔ انجام این عملیات را ندارید.');throw new ApiError(502,'دریافت یا ذخیره اطلاعات انجام نشد.');}
 return response.status===204?null:response.json();
}
async function body(request){const reader=request.body?.getReader();if(!reader)throw new ApiError(400,'اطلاعات فرم خالی است.');let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1450000){await reader.cancel();throw new ApiError(413,'حجم تصویر بیش از حد مجاز است.');}chunks.push(value);}const result=new Uint8Array(size);let offset=0;for(const c of chunks){result.set(c,offset);offset+=c.length;}try{return JSON.parse(new TextDecoder().decode(result));}catch{throw new ApiError(400,'اطلاعات فرم معتبر نیست.');}}
function validateBrand(data){const clean={};for(const key of ['name','display_name']){if(typeof data[key]!=='string'||!data[key].trim()||data[key].trim().length>150)throw new ApiError(400,'نام سازمان و سامانه باید بین ۱ تا ۱۵۰ نویسه باشد.');clean[key]=data[key].trim();}if(!/^#[a-f0-9]{6}$/i.test(data.primary_color))throw new ApiError(400,'رنگ انتخاب‌شده معتبر نیست.');clean.primary_color=data.primary_color;
 if(data.logo_data_url===null)clean.logo_data_url=null;
 else if(data.logo_data_url!==undefined){if(typeof data.logo_data_url!=='string'||data.logo_data_url.length>1400000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data.logo_data_url))throw new ApiError(400,'لوگو باید تصویر PNG، JPEG یا WebP با حجم کمتر از ۱ مگابایت باشد.');const encoded=data.logo_data_url.split(',')[1];let binary;try{binary=atob(encoded);}catch{throw new ApiError(400,'تصویر معتبر نیست.');}if(binary.length>1048576)throw new ApiError(400,'حداکثر حجم لوگو ۱ مگابایت است.');const png=binary.startsWith('\x89PNG\r\n\x1a\n'),jpeg=binary.startsWith('\xff\xd8\xff'),webp=binary.startsWith('RIFF')&&binary.slice(8,12)==='WEBP';if(!(png||jpeg||webp))throw new ApiError(400,'محتوای تصویر معتبر نیست.');clean.logo_data_url=data.logo_data_url;}
 return clean;
}
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function uuid(value,optional=false){if(optional&&(value===''||value===null||value===undefined))return null;if(typeof value!=='string'||!UUID.test(value))throw new ApiError(400,'شناسهٔ انتخاب‌شده معتبر نیست.');return value;}
function text(value,required=false,max=150){if(value==null||value===''){if(required)throw new ApiError(400,'فیلدهای الزامی را تکمیل کنید.');return null;}if(typeof value!=='string'||value.trim().length>max||required&&!value.trim())throw new ApiError(400,'متن واردشده معتبر نیست.');return value.trim()||null;}
function capability(env){if(!env.DEMO_WRITE_TOKEN)throw new ApiError(503,'دسترسی مدیریت پیکربندی نشده است.');return {'x-demo-write-token':env.DEMO_WRITE_TOKEN};}
function validateEntity(kind,data){if(!data||typeof data!=='object'||Array.isArray(data))throw new ApiError(400,'اطلاعات فرم معتبر نیست.');switch(kind){case 'org-units':return {name:text(data.name,true),code:text(data.code),parent_id:uuid(data.parent_id,true),...(Number.isSafeInteger(data.sort_order)?{sort_order:data.sort_order}:{})};case 'positions':return {title:text(data.title,true),org_unit_id:uuid(data.org_unit_id),reports_to_position_id:uuid(data.reports_to_position_id,true)};case 'persons':{const email=text(data.email,false,254);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new ApiError(400,'ایمیل معتبر وارد کنید.');return {display_name:text(data.display_name,true),email,phone:text(data.phone,false,40)};}case 'assignments':return {person_id:uuid(data.person_id),position_id:uuid(data.position_id)};default:throw new ApiError(404,'مسیر پیدا نشد.');}}
const tables={'org-units':'org_units',positions:'positions',persons:'persons',assignments:'assignments'};
export default {async fetch(request,env){try{
 const url=new URL(request.url);const user=identity(request,env);const ORG=env.PRESENTATION_ORG_ID||'a0000000-0000-4000-8000-000000000001';
 if(url.pathname==='/api/data'&&request.method==='GET'){
  const authenticated=user.authenticated||Boolean(user.email);
  if(env.PRESENTATION_ORG_ID&&!authenticated)throw new ApiError(401,'ابتدا وارد فضای خصوصی شوید.');
  const headers=authenticated?capability(env):{};
  const get=(table,select,order='')=>rest(env,table,'select='+select+'&'+(table==='organizations'?'id':'organization_id')+'=eq.'+ORG+order,{headers});
  const [orgs,units,nodes,kpis,links,documents,profiles]=await Promise.all([
   get('organizations','id,name,display_name,primary_color,logo_data_url'),get('org_units','id,name,parent_id,code,sort_order','&order=sort_order'),
   get('process_nodes',env.PRESENTATION_ORG_ID?'*':'id,parent_id,kind,classification,code,name,summary,owner_org_unit_id','&order=code'),
   get('kpis','*','&order=code'),get('process_kpis','process_id,kpi_id'),get('documents',env.PRESENTATION_ORG_ID?'id,title,process_id,doc_type,external_url,content_status,content_revision':'id,title'),get('process_profiles','*')]);
  if(!orgs.length)throw new ApiError(503,'اطلاعات سازمان در دسترس نیست.');
  let positions=[],persons=[],assignments=[],references=[],relations=[],requirements=[];
  if(authenticated)[positions,persons,assignments,references,relations,requirements]=await Promise.all([get('positions','id,title,org_unit_id,reports_to_position_id'),get('persons','id,display_name,email,phone'),get('assignments','id,person_id,position_id'),get('bpms_references','*'),get('process_relations','*'),get('kpi_data_requirements','*')]);
  return json({organization:orgs[0],units,nodes,kpis,links,documents,profiles,positions,persons,assignments,references,relations,requirements,user});
 }
 if(url.pathname.startsWith('/api/')&&!['GET','HEAD'].includes(request.method)){
  if(user.role!=='ADMIN')throw new ApiError(403,'فقط مدیر سامانه اجازهٔ ثبت تغییرات را دارد.');
  if(!env.APP_ORIGIN||request.headers.get('origin')!==new URL(env.APP_ORIGIN).origin)throw new ApiError(403,'مبدأ درخواست معتبر نیست.');
  if(url.pathname==='/api/organization'&&request.method==='PATCH'){
   const clean=validateBrand(await body(request));const result=await rest(env,'organizations','id=eq.'+ORG+'&select=id,name,display_name,primary_color,logo_data_url',{method:'PATCH',headers:{'Content-Type':'application/json','Prefer':'return=representation',...capability(env)},body:JSON.stringify(clean)});if(!result?.length)throw new ApiError(403,'ذخیرهٔ تنظیمات مجاز نیست.');return json({organization:result[0]});
  }
  const match=url.pathname.match(/^\/api\/(org-units|positions|persons|assignments)(?:\/([a-f0-9-]+))?$/i);
  if(match){const kind=match[1],id=match[2]?uuid(match[2]):null;const table=tables[kind];const headers={'Content-Type':'application/json',Prefer:'return=representation',...capability(env)};
   if(request.method==='POST'&&!id){const data=validateEntity(kind,await body(request));const records=await rest(env,table,'select=*',{method:'POST',headers,body:JSON.stringify({...data,organization_id:ORG})});return json({record:records[0]},201);}
   if(request.method==='PATCH'&&id){const data=validateEntity(kind,await body(request));const records=await rest(env,table,'id=eq.'+id+'&organization_id=eq.'+ORG+'&select=*',{method:'PATCH',headers,body:JSON.stringify(data)});if(!records?.length)throw new ApiError(404,'رکورد پیدا نشد.');return json({record:records[0]});}
   if(request.method==='DELETE'&&id){const records=await rest(env,table,'id=eq.'+id+'&organization_id=eq.'+ORG,{method:'DELETE',headers});if(!records?.length)throw new ApiError(404,'رکورد پیدا نشد.');return json({ok:true});}
   throw new ApiError(405,'روش درخواست معتبر نیست.');
  }
  const profile=url.pathname.match(/^\/api\/profiles\/([a-f0-9-]+)$/i);
  if(profile&&request.method==='PUT'){
   const id=uuid(profile[1]);const headers={'Content-Type':'application/json',...capability(env)};const process=await rest(env,'process_nodes','id=eq.'+id+'&organization_id=eq.'+ORG+'&kind=eq.PROCESS&select=id',{headers});if(!process?.length)throw new ApiError(404,'فرآیند پیدا نشد.');
   const input=await body(request);const clean={};for(const key of ['objective','start_event','end_event','inputs','outputs','roles','expected_outcome','notes'])clean[key]=text(input[key],false,4000);
   const result=await rest(env,'process_profiles','on_conflict=process_id&select=*',{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify({...clean,process_id:id,organization_id:ORG})});return json({profile:result[0]});
  }
 }
 if(url.pathname.startsWith('/api/'))return json({error:'مسیر پیدا نشد.'},404);
 if(!['GET','HEAD'].includes(request.method))return json({error:'درخواست پشتیبانی نمی‌شود.'},405);
 if(url.pathname==='/favicon.ico')return new Response(Uint8Array.from(atob(FAVICON_ICO),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/x-icon','Cache-Control':'public,max-age=86400'}});
 if(url.pathname==='/favicon.svg')return new Response(FAVICON_SVG,{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public,max-age=86400'}});
 if(url.pathname==='/apple-touch-icon.png')return new Response(Uint8Array.from(atob(APPLE_ICON),c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/png','Cache-Control':'public,max-age=86400'}});
 return new Response(request.method==='HEAD'?null:HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'"}});
 }catch(error){if(error instanceof ApiError)return json({error:error.message},error.status);console.error('Portal request failed',error?.name);return json({error:'ارتباط با سامانه برقرار نشد؛ دوباره تلاش کنید.'},500);}}};
const HTML='__PORTAL_HTML__';

const FAVICON_ICO='__FAVICON_ICO__';
const FAVICON_SVG='__FAVICON_SVG__';
const APPLE_ICON='__APPLE_ICON__';
