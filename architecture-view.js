(()=>{"use strict";
const selector='section.architecture-tree';
function enhance(){
 const route=decodeURIComponent(location.hash.replace(/^#/,"").split("?")[0]);
 if(route!=="/architecture")return;
 const chart=document.querySelector(selector);if(!chart)return;
 const heading=chart.parentElement?.querySelector("h1");
 if(heading&&!document.getElementById("architecture-review-banner")){
  const banner=document.createElement("p");banner.id="architecture-review-banner";
  banner.textContent="پیش‌نویس معماری فرآیندهای راسان — L0: اصلی، مدیریتی و پشتیبان | L1: حوزه‌ها | L2: فرآیندهای پیشنهادی. موارد L3 صرفاً گردش‌کارهای مرجع پیام‌گستر هستند و لزوماً فرآیند مستقل محسوب نمی‌شوند.";
  banner.style.cssText="direction:rtl;padding:12px 16px;border:1px solid #e7dcc6;background:#fffbf3;color:#605338;border-radius:9px;margin:15px 0;line-height:2;font-size:12px;";
  heading.closest(".page-heading")?.after(banner) || chart.before(banner);
 }
 for(const node of chart.querySelectorAll(".architecture-node:not([data-architecture-labeled])")){
  node.dataset.architectureLabeled="true";
  const level=node.querySelector(".level-label")?.textContent?.trim();
  const text=node.querySelector("strong,a")?.textContent?.trim();
  if(!level)continue;
  let label="";
  if(level==="L0"){label=text==="فرآیندهای اصلی"?"اصلی":text==="فرآیندهای مدیریتی"?"مدیریتی":text==="فرآیندهای پشتیبان"?"پشتیبان":"";}
  else if(level==="L2")label="پیشنهادی";
  else if(level==="L3")label="گردش‌کار مرجع";
  if(label){const tag=document.createElement("span");tag.className="badge neutral";tag.textContent=label;tag.style.cssText="font-size:10px;white-space:nowrap";node.append(tag);}
 }
}
let busy=false;const observer=new MutationObserver(()=>{if(busy)return;busy=true;queueMicrotask(()=>{busy=false;enhance();});});
observer.observe(document.body,{subtree:true,childList:true});
addEventListener("hashchange",enhance);
enhance();
})();