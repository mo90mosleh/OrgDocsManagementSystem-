import{useEffect,useRef,useState}from'react';
import{createPortal}from'react-dom';
import{Phone,Smartphone,Copy,X,ArrowRight,Users}from'lucide-react';
import type{Data,Person}from'./types';
import{number}from'./ui';
import './person-contacts.css';
import{dialNumber}from'./contact-numbers';
function Avatar({person}:{person:Person}){const[failed,setFailed]=useState(false);const image=person.avatar_data_url;return <span className="person-avatar">{image&&!failed&&/^data:image\/(png|jpeg|webp);base64,/.test(image)?<img src={image} alt="" onError={()=>setFailed(true)}/>:<span aria-hidden="true">{person.display_name.trim().split(/\s+/).slice(0,2).map(n=>Array.from(n)[0]).join('‌')}</span>}</span>;}
export function PeopleAvatars({people,limit,onOpen}:{people:Person[];limit:number;onOpen:(id?:string)=>void}){if(!people.length)return null;const shown=people.slice(0,limit);return <div className="person-avatar-group nodrag nopan" aria-label="افراد این جایگاه" onClick={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()}>
 {shown.map(p=><button type="button" key={p.id} className="person-avatar-button" title={p.display_name} aria-label={'اطلاعات '+p.display_name} onClick={()=>onOpen(p.id)}><Avatar person={p}/></button>)}
 {people.length>shown.length&&<button type="button" className="person-avatar-more" title="نمایش همه افراد" aria-label={'نمایش همه '+number.format(people.length)+' نفر'} onClick={()=>onOpen()}>{limit? '+'+number.format(people.length-shown.length):<><Users size={14}/>{number.format(people.length)}</>}</button>}
 </div>;}
export function PersonContactDialog({people,personId,title,unit,data,mobile,onClose}:{people:Person[];personId?:string;title:string;unit:string;data:Data;mobile:boolean;onClose:()=>void}){
 const [selected,setSelected]=useState(personId??(people.length===1?people[0].id:null)),[notice,setNotice]=useState('');const ref=useRef<HTMLDialogElement>(null),person=people.find(p=>p.id===selected);
 useEffect(()=>{const previous=document.activeElement;ref.current?.showModal();return()=>{ref.current?.close();if(previous instanceof HTMLElement&&previous.isConnected)previous.focus({preventScroll:true});};},[]);
 const mobileNumber=dialNumber(person?.phone),extension=dialNumber(person?.extension);
 async function copy(value:string){try{await navigator.clipboard.writeText(value);setNotice('شماره کپی شد.');}catch{setNotice('کپی خودکار انجام نشد؛ شماره را انتخاب و کپی کنید.');}}
 const positions=person?data.assignments.filter(a=>a.person_id===person.id).map(a=>data.positions.find(p=>p.id===a.position_id)).filter(p=>p!==undefined):[];
 return createPortal(<dialog ref={ref} className="person-contact-dialog" aria-labelledby="contact-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
 <header><h2 id="contact-title">{person?'اطلاعات همکار':'افراد '+title}</h2><button type="button" className="icon-button" aria-label="بستن اطلاعات همکار" onClick={onClose}><X size={20}/></button></header>
 {person?<>{people.length>1&&<button className="text-button" onClick={()=>{setSelected(null);setNotice('');}}><ArrowRight size={16}/>همه افراد این جایگاه</button>}<div className="person-contact-heading"><Avatar key={person.id} person={person}/><div><h3>{person.display_name}</h3><p>{unit}</p></div></div>
 <ul className="person-contact-positions">{positions.map(p=><li key={p.id}>{p.title} · {data.units.find(u=>u.id===p.org_unit_id)?.name}</li>)}</ul>
 <div className="person-contact-actions">{mobileNumber?<div><a className="secondary" href={'tel:'+mobileNumber} aria-label={'تماس با موبایل '+person.display_name}><Smartphone size={18}/><span>تماس با موبایل<bdi>{person.phone}</bdi></span></a><button className="icon-button" title="کپی شماره موبایل" aria-label="کپی شماره موبایل" onClick={()=>void copy(mobileNumber)}><Copy size={16}/></button></div>:<p className="muted">شماره موبایل ثبت نشده یا معتبر نیست.</p>}
 {!mobile&&(extension?<div><a className="secondary" href={'sip:'+extension} aria-label={'تماس با داخلی '+person.display_name}><Phone size={18}/><span>تماس با داخلی<bdi>{person.extension}</bdi></span></a><button className="icon-button" title="کپی شماره داخلی" aria-label="کپی شماره داخلی" onClick={()=>void copy(extension)}><Copy size={16}/></button></div>:<p className="muted">شماره داخلی ثبت نشده است.</p>)}</div>
 {!mobile&&extension&&<p className="muted person-call-help">تماس داخلی با برنامه پیش‌فرض تماس سیستم باز می‌شود. اگر باز نشد، شماره را کپی و در سافت‌فون وارد کنید.</p>}
 {person.email&&<p className="person-contact-email">ایمیل: <bdi>{person.email}</bdi></p>}</>:<><p className="muted">{unit} · {number.format(people.length)} نفر</p><ul className="person-contact-list">{people.map(p=><li key={p.id}><button onClick={()=>setSelected(p.id)}><Avatar person={p}/><span>{p.display_name}</span></button></li>)}</ul></>}
 <p role="status" className="person-copy-status">{notice}</p></dialog>,document.body);
}
