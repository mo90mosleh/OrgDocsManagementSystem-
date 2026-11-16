// Warm only the destination the user is about to open; never preload all pages.
const pending=new Map<string,Promise<unknown>>();
export function preloadRoute(path:string){
 if(typeof navigator!=='undefined'&&(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData)return;
 const kind=path==='/organization/chart'?'chart':path==='/okr'?'okr':path==='/architecture'?'architecture':path==='/process-map'?'map':path==='/processes'?'catalog':path.startsWith('/processes/')?'profile':null;
 if(!kind||pending.has(kind))return;
 const request=kind==='chart'?import('./Chart'):kind==='okr'?import('./okr/OkrWorkspace'):Promise.all([import('./ProcessWorkspace'),kind==='architecture'?import('./Architecture'):kind==='map'?import('./ProcessMap'):kind==='catalog'?import('./ProcessCatalog'):import('./ProcessDetail')]);
 pending.set(kind,request);
 void request.catch(()=>pending.delete(kind));
}
