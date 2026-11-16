import type{SVGProps}from'react';
/** Compact target with an arrow visibly embedded in the bullseye, matching Lucide stroke weight. */
export function TargetArrowIcon({size=20,...props}:{size?:number}&SVGProps<SVGSVGElement>){
 return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
  <circle cx="11.2" cy="12.8" r="8.1"/>
  <circle cx="11.2" cy="12.8" r="4.5"/>
  <circle cx="11.2" cy="12.8" r="1.15" fill="currentColor" stroke="none"/>
  <path d="M20.8 2.4 11.2 12.8"/>
  <path d="m20.8 2.4-.5 5.2M20.8 2.4l-5.2.1"/>
 </svg>;
}
