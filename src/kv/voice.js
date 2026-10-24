/* kids-voice/voice.js — shared speech player for Zoe's and Alex's games (v1.1.0).
   KV.init({base:'voice/kv/zoe/', ctx:existingAudioContext? | getCtx:()=>ctxOrNull, out:node|()=>node, duck:fn(on)|GainNode, clips:{key:base64}?})
   KV.say(key,{prio=1,force=false})  one line at a time; same key debounced 1.5 s; higher prio cuts a lower one, else queued (max 2) or dropped
   KV.count(n?)        real running count (or say the game's own count n): 1,2,3,... speaks every number (no wrap, no reset on pauses); KV.count.reset(n=0) only when a new round starts
   KV.readOnTap(el,key) tap/click el to hear key (longer text is never auto-read)
   Music ducking: duck(true) when speech starts, duck(false) 250 ms after it ends (GainNode: 40 ms attack to 0.3).
   iOS: unlocks on the first touchstart/touchend/pointerdown/click/keydown; resumes on visibilitychange/pageshow/focus and after the
   'interrupted' state (calls, Siri, backgrounding) — if Safari refuses resume() outside a gesture it re-arms the next-touch unlock. */
(function(g){
  const KV={},RE=/^(n\d+)$/;let C=null,out=null,own=false,base='',buf={},pend={},cfg={},cur=null,curP=0,q=[],last={},duckT=0,armed=true,embedded=null;
  const now=()=>performance.now();
  KV.stats={said:0,dropped:0,queued:0,resumes:0,lastKey:'',maxOverlap:0,playing:0};
  function ctx(){if(C)return C;if(cfg.getCtx){const c=cfg.getCtx();if(c){C=c;out=null;watch()}return C}const AC=g.AudioContext||g.webkitAudioContext;if(!AC)return null;C=new AC();own=true;out=C.destination;watch();return C}
  function watch(){if(!C||C._kvw)return;C._kvw=1;C.addEventListener&&C.addEventListener('statechange',()=>{if(C.state!=='running'&&!document.hidden)wake()})}
  function wake(){if(!C)return;if(C.state==='running')return;KV.stats.resumes++;const p=C.resume&&C.resume();p&&p.then?p.then(()=>{if(C.state!=='running')armed=true}).catch(()=>{armed=true}):0;armed=true}
  function unlock(){const c=ctx();if(!c)return;if(c.state!=='running'){c.resume&&c.resume().catch(()=>{})}
    try{const s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0)}catch(e){}
    if(armed){armed=false;preload(cfg.preload||[])}}
  ['touchstart','touchend','pointerdown','mousedown','click','keydown'].forEach(e=>g.addEventListener(e,unlock,{capture:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();else stop()});
  g.addEventListener('pageshow',wake);g.addEventListener('focus',wake);
  function b64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer}
  function load(k){if(buf[k])return Promise.resolve(buf[k]);if(pend[k])return pend[k];const c=ctx();if(!c)return Promise.resolve(null);
    const src=embedded&&embedded[k]?Promise.resolve(b64(embedded[k])):fetch(base+k+'.mp3').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()});
    return pend[k]=src.then(a=>new Promise((res,rej)=>{const p=c.decodeAudioData(a,res,rej);p&&p.catch&&p.catch(rej)})).then(x=>{buf[k]=x;delete pend[k];return x}).catch(()=>{delete pend[k];return null})}
  function preload(ks){ks.forEach(load)}
  function duck(on){let d=cfg.duck;if(typeof d==='function'&&d.length===0)d=d();if(!d)return;clearTimeout(duckT);const f=()=>{if(typeof d==='function')d(on);else if(d.gain&&C){if(d._kvBase==null)d._kvBase=d.gain.value;const t=C.currentTime;d.gain.cancelScheduledValues(t);d.gain.setValueAtTime(d.gain.value,t);d.gain.linearRampToValueAtTime(d._kvBase*(on?(cfg.duckTo||0.3):1),t+(on?0.04:0.25))}};on?f():(duckT=setTimeout(f,250))}
  function stop(){if(cur){try{cur.onended=null;cur.stop()}catch(e){}cur=null;KV.stats.playing=0;duck(false)}q=[]}
  function play(k,o){const c=ctx();const b=buf[k];if(!c||!b)return false;if(c.state!=='running'){wake();return false}
    const s=c.createBufferSource();s.buffer=b;const gn=c.createGain();gn.gain.value=cfg.gain||1;s.connect(gn);gn.connect((typeof cfg.out==='function'?cfg.out():cfg.out)||out||c.destination);
    cur=s;curP=o.prio||1;KV.stats.playing++;KV.stats.maxOverlap=Math.max(KV.stats.maxOverlap,KV.stats.playing);KV.stats.said++;KV.stats.lastKey=k;duck(true);
    s.onended=()=>{if(cur!==s)return;cur=null;KV.stats.playing=0;const n=q.shift();if(n)go(n[0],n[1]);else duck(false)};s.start();return true}
  function go(k,o){if(buf[k])return play(k,o);load(k).then(x=>{if(x&&(!o.t||now()-o.t<1500))say(k,Object.assign({},o,{_loaded:1}))});return false}
  function say(k,o){o=o||{};if(!o._loaded){const t=now();if(!o.force&&last[k]&&t-last[k]<(cfg.debounce||1500)){KV.stats.dropped++;return false}last[k]=t;o.t=t}
    if(cur){const p=o.prio||1;if(p>curP||o.force){try{cur.onended=null;cur.stop()}catch(e){}cur=null;KV.stats.playing=0}else{if(q.length<2&&p>=1){q.push([k,o]);KV.stats.queued++}else KV.stats.dropped++;return false}}
    return go(k,o)}
  KV.say=say;KV.stop=stop;KV.load=load;KV.preload=preload;KV.wake=wake;
  KV.busy=()=>!!cur;
  // running count: every tap speaks the true number; a newer number cuts the older one so the voice keeps up with fast tapping
  let cnt=0;KV.count=function(n){cnt=n>0?n:cnt+1;KV.count.n=cnt;const k='n'+Math.min(cnt,100);load('n'+Math.min(cnt+1,100));say(k,{prio:2,force:true});return cnt};
  KV.count.n=0;KV.count.reset=function(n){cnt=n||0;KV.count.n=cnt};
  KV.readOnTap=function(el,k){const h=e=>{e.stopPropagation&&e.stopPropagation();unlock();say(k,{prio:3,force:true})};el.addEventListener('click',h);el.addEventListener('touchend',e=>{e.preventDefault();h(e)},{passive:false})};
  KV.init=function(o){cfg=o||{};base=cfg.base||'';embedded=cfg.clips||null;if(cfg.ctx){C=cfg.ctx;watch()}out=typeof cfg.out==='function'?null:(cfg.out||(C?C.destination:null));if(C&&C.state==='running')preload(cfg.preload||[]);return KV};
  Object.defineProperty(KV,'ctx',{get:()=>C});
  g.KV=KV;
})(window);
