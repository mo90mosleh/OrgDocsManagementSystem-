import{createClient}from'@supabase/supabase-js';
const cfg=window.__PORTAL_CONFIG__;
export const authClient=cfg.authEnabled&&cfg.url&&cfg.publishableKey?createClient(cfg.url,cfg.publishableKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'nama-auth-v1'},global:{fetch:(url,options)=>fetch(url,{...options,signal:options?.signal??AbortSignal.timeout(20000)})}}):null;
export const authCallback=()=>new URL('./',location.href).origin+new URL('./',location.href).pathname;
export async function signOut(){if(!authClient)return;const{error}=await authClient.auth.signOut({scope:'local'});if(error)throw Error('خروج انجام نشد؛ اتصال را بررسی کنید.');window.dispatchEvent(new Event('nama:auth'));}
export async function verifiedSession(){if(!authClient)return null;const{data:{session},error}=await authClient.auth.getSession();if(error)throw Error('نشست ورود قابل دریافت نیست. دوباره وارد شوید.');if(!session)return null;const{data:{user},error:invalid}=await authClient.auth.getUser();if(invalid||!user)throw Error('نشست ورود معتبر نیست؛ دوباره وارد شوید.');return{session,user};}
