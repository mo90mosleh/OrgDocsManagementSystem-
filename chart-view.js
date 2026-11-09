(()=>{"use strict";
const PATH="/organization/chart";
let data=null, busy=false, active=false, collapsed=new Set(),mode="positions",selection=null;
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const route=()=>decodeURIComponent(location.hash.replace(/^#/,"").split("?")[0])===PATH;
const style=document.createElement("style");style.textContent=`
#orgchart-pages-v2{direction:rtl;margin:16px 0 36px}
#orgchart-pages-v2 .orgc-toolbar{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-bottom:12px}
#orgchart-pages-v2 button{border:1px solid #d6dbe3;background:#fff;color:#283343;border-radius:9px;padding:9px 13px;cursor:pointer;font:inherit}
#orgchart-pages-v2 button.active{background:#b72a3e;color:white;border-color:#b72a3e}
#orgchart-pages-v2 .orgc-info{font-size:13px;color:#657081;margin-bottom:14px}
#orgchart-pages-v2 .orgc-scroll{overflow:auto;max-width:100%;min-height:500px;padding:25px 20px 45px;background:#fff;border:1px solid #e1e4e9;border-radius:12px}
#orgchart-pages-v2 ul{display:flex;justify-content:center;align-items:flex-start;gap:16px;list-style:none;padding:24px 0 0;margin:0;position:relative}
#orgchart-pages-v2 li{display:flex;flex-direction:column;align-items:center;position:relative;flex-shrink:0}
#orgchart-pages-v2 li>ul{padding-top:34px}
#orgchart-pages-v2 li>ul:before{content:"";position:absolute;top:0;right:50%;height:34px;border-right:1px solid #b6bec9}
#orgchart-pages-v2 li>ul>li:before{content:"";position:absolute;top:-12px;right:50%;height:12px;border-right:1px solid #b6bec9}
#orgchart-pages-v2 li>ul>li:not(:only-child):after{content:"";position:absolute;top:-12px;right:0;left:0;border-top:1px solid #b6bec9}
#orgchart-pages-v2 li>ul>li:first-child:after{right:50%}
#orgchart-pages-v2 li>ul>li:last-child:after{left:50%}
#orgchart-pages-v2 .orgc-node{min-width:175px;max-width:230px;min-height:78px;padding:10px 12px;border:1px solid #d9dfe7;border-top:3px solid #b72a3e;border-radius:10px;background:#fcfcfd;display:flex;flex-direction:column;gap:5px;text-align:center;box-shadow:0 2px 8px #1a29400d}
#orgchart-pages-v2 .orgc-node strong{font-size:13px;line-height:1.7}
#orgchart-pages-v2 .orgc-node small{font-size:11px;color:#647083;line-height:1.6}
#orgchart-pages-v2 .orgc-node button{padding:2px 8px;font-size:11px;margin:3px auto 0}
#orgchart-pages-v2 .orgc-empty{padding:32px;text-align:center;color:#657081}
@media(max-width:700px){#orgchart-pages-v2 .orgc-scroll{padding:14px 8px}#orgchart-pages-v2 .orgc-toolbar{gap:8px}#orgchart-pages-v2 button{font-size:12px}}
`;document.head.append(style);
function render(){
 const root=document.getElementById("orgchart-pages-v2");if(!root||!data)return;
 root.replaceChildren();
 const toolbar=el("div","orgc-toolbar"),left=el("div"),right=el("div");
 const btn=(txt,fn,isActive=false)=>{const b=el("button",isActive?"active":"",txt);b.type="button";b.addEventListener("click",fn);return b;};
 left.append(btn("چارت سمت‌ها",()=>{mode="positions";collapsed.clear();render();},mode==="positions"),btn("ساختار واحدها",()=>{mode="units";collapsed.clear();render();},mode==="units"));
 right.append(btn("باز کردن همه",()=>{collapsed.clear();render();}),btn("جمع کردن همه",()=>{collapsed=new Set((mode==="positions"?data.positions:data.units).map(x=>x.id));render();}));
 toolbar.append(left,right);root.append(toolbar);
 root.append(el("p","orgc-info",mode==="positions"?`${data.positions.length} جایگاه سازمانی | اطلاعات افراد در نسخه عمومی نمایش داده نمی‌شود.`:`${data.units.length} واحد سازمانی`));
 const scroll=el("div","orgc-scroll");root.append(scroll);
 const records=mode==="positions"?data.positions:data.units;
 const children=new Map(),byId=new Map(records.map(x=>[x.id,x])),units=new Map(data.units.map(x=>[x.id,x.name]));
 for(const x of records){const parent=mode==="positions"?x.reports_to_position_id:x.parent_id;const k=parent&&byId.has(parent)?parent:"__root__";const arr=children.get(k)||[];arr.push(x);children.set(k,arr);}
 function node(item,visited){
  const li=el("li"),card=el("div","orgc-node"),title=mode==="positions"?item.title:item.name;
  card.append(el("strong","",title));
  if(mode==="positions")card.append(el("small","",units.get(item.org_unit_id)||""));
  const kids=(children.get(item.id)||[]).filter(x=>!visited.has(x.id));
  if(kids.length)card.append(btn(collapsed.has(item.id)?"نمایش زیرمجموعه ("+kids.length+")":"جمع کردن ("+kids.length+")",()=>{collapsed.has(item.id)?collapsed.delete(item.id):collapsed.add(item.id);render();}));
  li.append(card);
  if(kids.length&&!collapsed.has(item.id)){const ul=el("ul"),next=new Set([...visited,item.id]);for(const child of kids)ul.append(node(child,next));li.append(ul);}
  return li;
 }
 const roots=children.get("__root__")||[];
 if(!roots.length){scroll.append(el("p","orgc-empty","ساختار سازمانی ثبت نشده است."));return;}
 const ul=el("ul");for(const item of roots)ul.append(node(item,new Set([item.id])));scroll.append(ul);
}
async function mount(){
 if(!route()||busy)return;
 const main=document.querySelector("main#main");if(!main)return;
 if(document.getElementById("orgchart-pages-v2"))return;
 busy=true;
 try{
  if(!data){const r=await fetch("./rassan-presentation.json",{cache:"no-store"});if(!r.ok)throw Error("Unable to load chart");data=await r.json();}
  if(!route())return;
  const mainNow=document.querySelector("main#main");if(!mainNow)return;
  const heading=[...mainNow.querySelectorAll("h1")].find(h=>h.textContent?.includes("چارت سازمانی"));
  if(!heading)return;
  const chart=mainNow.querySelector(".chart-layout")||mainNow.querySelector(".tree-canvas");
  const container=chart?.closest(".chart-layout")||chart;
  if(container){container.style.display="none";const toolbar=container.previousElementSibling;if(toolbar?.classList.contains("toolbar"))toolbar.style.display="none";}
  const root=el("div");root.id="orgchart-pages-v2";heading.parentElement?.after(root);render();
 }catch(e){console.warn("Org chart failed to load",e);}finally{busy=false;}
}
let pending=false;
const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;mount();});});
observer.observe(document.body,{childList:true,subtree:true});
addEventListener("hashchange",()=>{collapsed.clear();mount();});
mount();
})();