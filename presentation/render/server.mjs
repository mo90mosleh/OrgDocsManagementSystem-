import{createServer}from'node:http';import{createHash,createHmac,timingSafeEqual}from'node:crypto';import worker from'../dist/server/index.js';
const hash=s=>createHash('sha256').update(s).digest(),equal=(a,b)=>timingSafeEqual(hash(a),hash(b));
export function createHandler(env,app=worker){
 for(const k of ['PRESENTATION_ADMIN_KEY','PRESENTATION_VIEWER_KEY','SESSION_SECRET','DEMO_WRITE_TOKEN','PRESENTATION_ORG_ID'])if(!env[k]||env[k].length<20)throw Error('Missing secure runtime configuration: '+k);
 const origin=new URL(env.APP_ORIGIN||env.RENDER_EXTERNAL_URL).origin,rates=new Map();
 const key=role=>role==='ADMIN'?env.PRESENTATION_ADMIN_KEY:env.PRESENTATION_VIEWER_KEY;
 const sign=(payload,role)=>createHmac('sha256',env.SESSION_SECRET+hash(key(role)).toString('hex')).update(payload).digest('base64url');
 const cookie=(value,age)=>'__Host-rassan='+value+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+age;
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"};
 function login(error='',status=200){return new Response('<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ورود به ارائهٔ خصوصی راسان</title><style>body{font-family:Tahoma,sans-serif;background:#f5f5f7;color:#24242c;margin:0;display:grid;place-items:center;min-height:100vh}main{background:white;border:1px solid #ddd;border-radius:16px;padding:32px;max-width:400px;margin:20px}h1{font-size:22px}p{line-height:1.9}input,button{box-sizing:border-box;width:100%;padding:14px;margin:12px 0;border:1px solid #bbb;border-radius:8px}button{background:#bd2739;color:white;border:0;cursor:pointer}.error{color:#b21}</style><main><h1>ارائهٔ خصوصی راسان</h1><p>برای مشاهدهٔ فرآیندها و ثبت بازخورد، کلید دسترسی ارائه را وارد کنید.</p><form method="post" action="/login"><label for="key">کلید دسترسی</label><input id="key" name="key" type="password" required autocomplete="current-password" maxlength="200"><button>ورود به سامانه</button></form><p class="error" role="alert">'+error+'</p></main></html>',{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});}
 function identity(req){try{const raw=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-rassan='))?.slice(14);if(!raw)return null;const[p,s]=raw.split('.');const v=JSON.parse(Buffer.from(p,'base64url').toString());if(!['ADMIN','VIEWER'].includes(v.role)||!Number.isSafeInteger(v.exp)||v.exp<Date.now()||v.exp>Date.now()+4*3600000||!s||!equal(sign(p,v.role),s))return null;return{authenticated:true,role:v.role,name:v.role==='ADMIN'?'مدیر ارائه':'بازبین ارائه',email:''};}catch{return null;}}
 return async function handle(req,client='unknown'){
  const url=new URL(req.url);if(url.origin!==origin)return new Response('Invalid host',{status:400,headers});
  if(url.pathname==='/health')return Response.json({status:'ok'},{headers});
  if(url.pathname==='/login'){
   if(req.method==='GET')return login();if(req.method!=='POST')return new Response(null,{status:405,headers});
   if(req.headers.get('origin')!==origin)return new Response('Invalid origin',{status:403,headers});
   if(rates.size>10000)for(const[k,v]of rates)if(v.reset<Date.now())rates.delete(k);
   const now=Date.now(),rate=rates.get(client);if(rate&&rate.reset>now&&rate.n>=10)return login('تعداد تلاش‌ها زیاد است. ۱۵ دقیقه بعد دوباره امتحان کنید.',429);
   rates.set(client,{reset:rate?.reset>now?rate.reset:now+900000,n:rate?.reset>now?rate.n+1:1});
   if(Number(req.headers.get('content-length')||0)>1000)return new Response(null,{status:413,headers});
   const reader=req.body?.getReader();let size=0,chunks=[];while(reader){const v=await reader.read();if(v.done)break;size+=v.value.length;if(size>1000){await reader.cancel();return new Response(null,{status:413,headers});}chunks.push(v.value);}
   const input=new URLSearchParams(Buffer.concat(chunks).toString()).get('key')||'';const role=equal(input,env.PRESENTATION_ADMIN_KEY)?'ADMIN':equal(input,env.PRESENTATION_VIEWER_KEY)?'VIEWER':null;
   if(!role)return login('کلید دسترسی معتبر نیست.',401);rates.delete(client);const p=Buffer.from(JSON.stringify({role,exp:now+4*3600000})).toString('base64url');return new Response(null,{status:303,headers:{...headers,Location:'/dashboard','Set-Cookie':cookie(p+'.'+sign(p,role),14400)}});
  }
  if(url.pathname==='/logout'){if(req.method!=='POST'||req.headers.get('origin')!==origin)return new Response(null,{status:403,headers});return new Response(null,{status:303,headers:{...headers,Location:'/login','Set-Cookie':cookie('',0)}});}
  const actor=identity(req);if(!actor)return url.pathname.startsWith('/api/')?Response.json({error:'ابتدا وارد شوید.'},{status:401,headers}):new Response(null,{status:303,headers:{...headers,Location:'/login'}});
  const clean=new Headers(req.headers);for(const k of [...clean.keys()])if(k.startsWith('oai-authenticated-'))clean.delete(k);
  return app.fetch(new Request(req,{headers:clean}),{...env,APP_ORIGIN:origin,REQUEST_IDENTITY:actor});
 };
}
if(process.env.NODE_ENV!=='test'){
 const handle=createHandler(process.env);const origin=new URL(process.env.APP_ORIGIN||process.env.RENDER_EXTERNAL_URL).origin;
 const server=createServer(async(req,res)=>{try{const address=req.socket.remoteAddress||'unknown';const request=new Request(new URL(req.url,origin),{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});const response=await handle(request,address);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('Service unavailable');}}).listen(Number(process.env.PORT)||10000,'0.0.0.0');
 process.on('SIGTERM',()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),25000).unref();});
}
