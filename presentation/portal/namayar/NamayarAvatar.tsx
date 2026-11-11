type AvatarState = 'idle' | 'awake' | 'thinking' | 'listening' | 'responding' | 'success';

const ink = '#303030';
const ivory = '#faf5ed';
const red = '#fa422d';

const motion = `
.namayar-avatar .namayar-shell.nm-character {animation:none;transform:none}
.nm-resting-face {transform:translateY(10px)}
.nm-sleepy-eyes,.nm-heart {transform-box:fill-box;transform-origin:center}
.nm-sleepy-eyes {animation:nm-doze 8s ease-in-out infinite}
.nm-standing-feet,.nm-standing-face {display:none}
.namayar-launcher:is(:hover,:focus-visible) .nm-idle .nm-standing-feet,
.namayar-launcher:is(:hover,:focus-visible) .nm-idle .nm-standing-face {display:block}
.namayar-launcher:is(:hover,:focus-visible) .nm-idle .nm-seated-feet,
.namayar-launcher:is(:hover,:focus-visible) .nm-idle .nm-neutral {display:none}
.namayar-launcher:is(:hover,:focus-visible) .nm-idle .nm-resting-face {animation:nm-rise .26s ease-out both}
.namayar-launcher:is(:hover,:focus-visible) .nm-idle .nm-heart {animation:nm-heart-pop .43s ease-out both}
.nm-search-head {animation:nm-scan-head 2s ease-in-out infinite}
.nm-search-eyes {animation:nm-scan-eyes 2s ease-in-out infinite}
.nm-working-head {animation:nm-ponder 4s ease-in-out infinite}
.nm-working-eyes {animation:nm-read 4s ease-in-out infinite}
.nm-hand-a {animation:nm-tap-a 4s ease-in-out infinite}
.nm-hand-b {animation:nm-tap-b 4s ease-in-out infinite}
.nm-search-head,.nm-working-head {transform-origin:32px 38px}
@keyframes nm-doze {0%,12%,100%{transform:scaleY(1)}53%,67%{transform:scaleY(.09)}}
@keyframes nm-rise {0%{transform:translateY(10px)}74%{transform:translateY(-1px)}100%{transform:translateY(0)}}
@keyframes nm-heart-pop {0%{transform:scale(.12)}65%{transform:scale(1.18)}100%{transform:scale(1)}}
@keyframes nm-scan-head {0%,14%,100%{transform:rotate(-4deg)}29%,45%{transform:rotate(9deg)}68%,84%{transform:rotate(-6deg)}}
@keyframes nm-scan-eyes {0%,14%,100%{transform:translate(-3px,0)}29%,45%{transform:translate(4px,2px)}68%,84%{transform:translate(-4px,-1px)}}
@keyframes nm-ponder {0%,100%{transform:rotate(0)}12%,32%{transform:rotate(-7deg)}52%,84%{transform:rotate(4deg)}}
@keyframes nm-read {0%,100%{transform:translate(0,0)}12%,32%{transform:translate(-2px,-4px)}52%,84%{transform:translate(1px,4px)}}
@keyframes nm-tap-a {0%,49%,58%,66%,74%,82%,100%{transform:translateY(0)}54%,62%,70%,78%{transform:translateY(2.8px)}}
@keyframes nm-tap-b {0%,53%,61%,69%,77%,87%,100%{transform:translateY(0)}57%,65%,73%,81%{transform:translateY(2.8px)}}
@media(prefers-reduced-motion:reduce){
.namayar-avatar.nm-avatar *{animation:none!important;transition:none!important}
.namayar-launcher:is(:hover,:focus-visible) .nm-idle .nm-resting-face{transform:translateY(0)}
}
`;

function Feet() {
  return <g fill={ink}>{[20,44].map(x => <g key={x}>
    <rect x={x-3} y="43" width="6" height="14" rx="2"/>
    <rect x={x-7} y="54" width="14" height="6" rx="3"/>
  </g>)}</g>;
}

function Body() {
  return <rect x="8" y="7" width="48" height="39" rx="12" fill={ink}/>;
}

function Eyes() {
  return <g fill={ivory}>{[25,39].map(x =>
    <rect key={x} x={x-2.7} y="20" width="5.4" height="11" rx="2.7"/>
  )}</g>;
}

function Resting() {
  return <g className="nm-idle">
    <g className="nm-standing-feet"><Feet/></g>
    <g className="nm-resting-face"><Body/>
      <g className="nm-neutral"><g className="nm-sleepy-eyes" fill={ivory}>
        <path d="M22 23h6v3a3 3 0 0 1-6 0zm14 0h6v3a3 3 0 0 1-6 0z"/>
      </g></g>
      <g className="nm-standing-face namayar-hearts" fill={red}>
        {[24,40].map((x,i)=><g key={x} transform={'translate('+x+' 26) rotate('+(i?7:-7)+')'}>
          <path className="nm-heart" d="M0-2C-4-8-10-3-6 2Q-4 4 0 6Q5 4 6 1C10-5 4-8 0-2Z"/>
        </g>)}
      </g>
    </g>
    <g className="nm-seated-feet">{[18,46].map(x=><g key={x}>
      <ellipse cx={x} cy="55" rx="7.5" ry="5" fill={ink} stroke={ivory} strokeWidth=".35"/>
      <path d={`M${x-6} 58.2q6 4.3 12 0q-6 1.4-12 0`} fill={red}/>
    </g>)}</g>
  </g>;
}

function Working() {
  return <><Feet/>
    <g className="nm-working-head"><Body/><g className="nm-working-eyes"><Eyes/></g></g>
    <path d="M16 41h32l3 7q.4 1.4-1.5 1.4h-35Q13 49.4 13.4 48Z" fill="#f4ede4" stroke={ink} strokeWidth=".8"/>
    {[43,46].map(y=><g key={y} fill="#a79f97">{[18,24,30,36,42].map(x=>
      <rect key={x} x={x} y={y} width="3.7" height="1" rx=".5"/>
    )}</g>)}
    <rect x="45" y="46" width="2.5" height="1.2" rx=".5" fill={red}/>
    {[21,43].map((x,i)=><ellipse key={x} className={i?'nm-hand-b':'nm-hand-a'} cx={x} cy="40" rx="3.7" ry="2.6" fill={ink} stroke={ivory} strokeWidth=".65"/>)}
  </>;
}

export function NamayarAvatar({state='idle',small=false}:{state?:AvatarState;small?:boolean}) {
  const working = state === 'thinking';
  const searching = state === 'listening';
  return <svg className={'namayar-avatar nm-avatar '+(small?'is-small ':'')+'is-'+state} viewBox="0 0 64 64" aria-hidden="true">
    <style>{motion}</style>
    <g className="namayar-shell nm-character">
      {working ? <Working/> : searching ? <><Feet/><g className="nm-search-head"><Body/><g className="nm-search-eyes"><Eyes/></g></g></> : state === 'idle' ? <Resting/> : <><Feet/><Body/><Eyes/></>}
    </g>
  </svg>;
}
