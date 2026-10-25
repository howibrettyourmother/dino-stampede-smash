'use strict';
(function(){
const cv=document.getElementById('c'),g=cv.getContext('2d');
const Q=new URLSearchParams(location.search);
let qmode=(Q.get('mode')||'').toLowerCase();if(!['alex','zoe','together'].includes(qmode))qmode='';
const FONT='"Baloo2Z",system-ui,sans-serif';
let W=0,H=0,DPR=1,U=1,HZ=1,T=0;
let state='title',mode='alex';
let B=[],chunks=[],parts=[],smoke=[],rings=[],kitties=[],jets=[],bombs=[],lava=[],splats=[],rockets=[],texts=[],puddles=[],pending=[],dinos=[];
let ms=null,heli=[],shots=[],strafes=[],boss=null,hurtT=0,heliT=4,strafeT=8;
let zw={m:0,full:0,grow:2,gold:12,bal:3,target:8,cheer:0,stars:0},balloons=[],zstars=[];
let shake=0,flash=0,wave=null,waveTimer=35,meter=0,finale=0,jetTimer=4,volT=5,menuHold=null,titleT=0;
const R=Math.random,rr=(a,b)=>a+R()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,pick=a=>a[R()*a.length|0];
const RAINBOW=['#ff5c8a','#ffa94d','#ffe066','#69db7c','#4dabf7','#b197fc','#f783ac','#ffffff'];
const HOT=['#ffd43b','#ff922b','#ff6b6b','#fff3bf','#74c0fc','#e599f7','#8ce99a'];
// ---------- save ----------
const SK='dinoStampedeSmash';const save={hi:0,biggest:0,lvl:1,smashed:0,kitties:0,coop:0,zoe:0,best:1,cur:1,lb:{},st:{},skin:0};
try{Object.assign(save,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
function persist(){try{localStorage.setItem(SK,JSON.stringify(save))}catch(e){}}
window.hubSave=persist;addEventListener('pagehide',persist);
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});
// ---------- audio ----------
let AC=null,master,sfxG,musG,NB=null,engine=null;
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null;return}
 const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(AC.destination);
 master=AC.createGain();master.gain.value=.85;master.connect(comp);sfxG=AC.createGain();sfxG.connect(master);musG=AC.createGain();musG.gain.value=.28;musG.connect(master);
 NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
 if(AC.state!=='running'){const p=AC.resume();if(p&&p.catch)p.catch(()=>{})}}
function unlock(){initAudio();if(!AC)return;if(AC.state!=='running'){try{AC.resume()}catch(e){}}
 try{const s=AC.createBufferSource();s.buffer=AC.createBuffer(1,1,22050);s.connect(AC.destination);s.start(0)}catch(e){}}
// Zoe mode counting voice (shared kids-voice pack, src/kv): every smash says the running count; music ducks under it
if(window.KV)KV.init({getCtx:()=>{initAudio();return AC},duck:()=>musG,clips:window.KV_CLIPS,preload:['n10','n20']});
const live=()=>AC&&AC.state==='running';
function tone(type,f0,f1,dur,vol,t0=0,dest){if(!live())return;dest=dest||sfxG;const t=AC.currentTime+Math.max(0,t0),o=AC.createOscillator(),gn=AC.createGain();o.type=type;
 o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
 gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+.012);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(gn);gn.connect(dest);o.start(t);o.stop(t+dur+.05)}
function noise(dur,vol,ft,f0,f1,t0=0,q=1,dest){if(!live())return;dest=dest||sfxG;const t=AC.currentTime+Math.max(0,t0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();
 s.buffer=NB;f.type=ft;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
 gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+.01);gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
 s.connect(f);f.connect(gn);gn.connect(dest);s.start(t,R()*1.5);s.stop(t+dur+.05)}
const last={};function ok(n,gap){const t=performance.now();if(last[n]&&t-last[n]<gap)return false;last[n]=t;return true}
const S={
 crunch(v=1){if(!ok('cr',45))return;noise(.3,.45*v,'lowpass',2400,250);tone('square',170,45,.18,.16*v);noise(.12,.25*v,'bandpass',3500,1200,.03,3)},
 boom(v=1){if(!ok('bm',60))return;noise(1.1,.75*v,'lowpass',1300,45);tone('sine',110,26,.8,.6*v);tone('sawtooth',70,30,.4,.15*v)},
 stomp(big){if(!ok('st',60))return;tone('sine',big?95:150,28,big?.9:.35,big?.95:.6);noise(.35,.45,'lowpass',700,80)},
 thud(){if(!ok('th',70))return;tone('sine',200,80,.12,.3);noise(.1,.2,'lowpass',1500,400)},
 roar(){tone('sawtooth',230,70,1.1,.28);tone('sawtooth',165,55,1.1,.28,.02);tone('square',95,48,1.1,.14);noise(1.1,.35,'bandpass',900,220,0,1.5)},
 boing(){if(!ok('bo',70))return;tone('sine',180,760,.22,.3);tone('triangle',360,1300,.18,.1)},
 splash(){if(!ok('sp',160))return;noise(.5,.4,'highpass',700,2600);for(const d of[0,.06,.13])tone('sine',rr(900,1500),rr(300,500),.1,.1,d)},
 firework(){if(!ok('fw',55))return;noise(.6,.45,'bandpass',3000,600,0,.8);for(let i=0;i<6;i++)noise(.05,.14,'highpass',4000,6500,.15+R()*.45)},
 whistle(){if(!ok('wh',110))return;tone('sine',650,2100,.55,.07)},
 sparkle(){if(!ok('sk',70))return;const b=rr(1000,1400);[1,1.26,1.5,2,2.52].forEach((m,i)=>tone('triangle',b*m,b*m,.3,.085,i*.05))},
 heart(){if(!ok('ht',90))return;tone('sine',880,1320,.15,.18);tone('sine',1320,1760,.2,.12,.1)},
 shoot(){if(!ok('sh',120))return;tone('sine',150,60,.25,.25);noise(.15,.2,'lowpass',900,200)},
 pew(){if(!ok('pw',90))return;tone('square',900,300,.08,.05)},
 ouch(){tone('sawtooth',320,110,.25,.16);noise(.2,.3,'lowpass',1200,300)},
 alarm(){for(const d of[0,.25,.5])tone('square',880,660,.16,.07,d)},
 win(){[0,4,7,12].forEach((q,i)=>tone('triangle',523*Math.pow(2,q/12),523*Math.pow(2,q/12),.3,.15,i*.1))},
 lose(){[7,4,0].forEach((q,i)=>tone('triangle',392*Math.pow(2,q/12),392*Math.pow(2,q/12),.3,.12,i*.15))},
 mew(){if(!ok('mw',220))return;const f=rr(650,950);tone('triangle',f,f*1.5,.12,.14);tone('triangle',f*1.5,f*.8,.26,.14,.1)},
 jet(){noise(.22,.1,'bandpass',1600,800,0,1)},
 flyby(){if(!ok('fb',400))return;noise(2.4,.35,'bandpass',250,2600,0,1.3);tone('sawtooth',320,85,2.2,.05)},
 wave(){noise(3.8,.75,'lowpass',180,1900);noise(3.8,.3,'highpass',2200,500)},
 rumble(){noise(2.2,.45,'lowpass',110,220);tone('sine',46,40,2,.3)},
 lava(){if(!ok('lv',90))return;noise(.35,.3,'lowpass',600,150);tone('sine',300,90,.2,.15)},
 build(){[0,4,7,12,16].forEach((s,i)=>tone('triangle',523*Math.pow(2,s/12),523*Math.pow(2,s/12),.25,.1,i*.08))},
 mega(){tone('sawtooth',90,600,.6,.2);noise(.6,.3,'bandpass',500,4000,0,1)},
 horn(){if(!ok('hn',800))return;tone('square',220,220,.25,.12);tone('square',277,277,.25,.1);tone('square',220,220,.35,.12,.3);tone('square',277,277,.35,.1,.3)},
};
function setEngine(v){if(!live())return;if(!engine){const o=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),gn=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();
  o.type='sawtooth';o2.type='square';o.frequency.value=42;o2.frequency.value=43.3;f.type='lowpass';f.frequency.value=260;gn.gain.value=0;
  l.frequency.value=14;lg.gain.value=6;l.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);o.connect(f);o2.connect(f);f.connect(gn);gn.connect(sfxG);o.start();o2.start();l.start();engine={o,o2,f,gn,l}}
 const t=AC.currentTime;engine.gn.gain.setTargetAtTime(v<0?0:.035+v*.13,t,.08);const fr=40+Math.max(0,v)*45;engine.o.frequency.setTargetAtTime(fr,t,.1);engine.o2.frequency.setTargetAtTime(fr*1.03,t,.1);engine.f.frequency.setTargetAtTime(220+Math.max(0,v)*500,t,.1);engine.l.frequency.setTargetAtTime(12+v*10,t,.1)}
// music
const mtof=m=>440*Math.pow(2,(m-69)/12);let musT=0,musStep=0;
const AB=[40,40,52,40,43,40,55,43,38,38,50,38,45,43,40,38],ZM=[72,76,79,76,81,79,76,74,72,74,76,79,84,81,79,0,77,76,74,72,74,76,72,0,69,72,74,76,79,76,74,72],ZB=[48,55,53,55,57,55,53,50];
function musStepPlay(st,t){const m=state==='title'?'title':mode,d=t-AC.currentTime,alexy=m==='alex'||m==='together',zoey=m==='zoe'||m==='together'||m==='title';const s16=st%16;
 if(alexy){if(s16===0||s16===6||s16===8||s16===11)tone('sine',120,40,.25,m==='alex'?.9:.6,d,musG);
  if(s16===4||s16===12)noise(.18,m==='alex'?.5:.35,'bandpass',1800,900,d,.7,musG);
  if(st%2===0)noise(.04,.18,'highpass',7000,9000,d,1,musG);
  if(m==='alex'&&st%2===0){const n=AB[(st/2|0)%16];tone('sawtooth',mtof(n),mtof(n),.22,.35,d,musG);tone('square',mtof(n+7),mtof(n+7),.12,.08,d,musG)}}
 if(zoey&&st%2===0){const n=ZM[(st/2|0)%32];if(n){tone('triangle',mtof(n),mtof(n),.4,.3,d,musG);tone('sine',mtof(n+12),mtof(n+12),.25,.08,d,musG)}
  if(st%8===0){const b=ZB[(st/8|0)%8];tone('sine',mtof(b),mtof(b),.7,.4,d,musG)}
  if(m!=='together'&&st%4===2)noise(.05,.08,'highpass',8000,9000,d,1,musG)}}
setInterval(()=>{if(!live())return;const sd=60/((state==='play'&&mode==='alex')?150:state==='play'&&mode==='together'?132:116)/4;
 if(musT<AC.currentTime)musT=AC.currentTime+.05;while(musT<AC.currentTime+.25){musStepPlay(musStep,musT);musStep++;musT+=sd}},40);
// ---------- layout ----------
const groundTop=()=>HZ+U*6;
function themeAt(x){return mode==='zoe'?'candy':mode==='alex'?'city':(x<W/2?'candy':'city')}
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.width=W+'px';cv.style.height=H+'px';U=Math.min(W,H)/100;HZ=H*.33;
 if(state==='play'){genTown(true);genPuddles();for(const d of dinos){setBounds(d);d.x=clamp(d.x,d.minX,d.maxX);d.y=clamp(d.y,groundTop()+U*4,H-U*3)}}}
addEventListener('resize',resize);
// ---------- town ----------
const CANDY=['castle','cupcake','house','house','cupcake','icecream'],CITY=['block','block','block','hangar','tank','fuel','truck'];
const PAL={castle:['#ffb3d9','#c39bff','#fff'],cupcake:['#fff0c2','#ff7eb6','#ff4d6d'],house:['#b8f2e6','#ff8fab','#fff'],icecream:['#ffd6e7','#9ee7ff','#ffe066'],
 block:['#8d99a6','#5d6875','#ffe27a'],hangar:['#7b8a5a','#5a6640','#ddd'],tank:['#6f7d45','#4e5a2e','#333'],fuel:['#e9ecef','#e53935','#ffd43b'],truck:['#c0752a','#555','#222']};
const lvl=()=>mode==='alex'?Math.min(ms?ms.L:1,10):mode==='zoe'?1:3;
function genTown(pop){B=[];const L=lvl(),top=groundTop()+U*8,bot=H-U*5,cell=U*(mode==='alex'?Math.max(11,17-L*.6):mode==='zoe'?18:14);
 const cols=Math.max(3,Math.floor((W-U*6)/cell)),rows=Math.max(2,Math.floor((bot-top)/(cell*.75)));
 const dens=mode==='zoe'?.5:mode==='alex'?Math.min(.82,.5+L*.035):.6,ox=(W-cols*cell)/2;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(R()>dens)continue;
  const x=ox+cell*(c+.5)+rr(-.12,.12)*cell,y=top+(r+1)*(bot-top)/rows-rr(0,cell*.12);
  if(mode==='together'&&Math.abs(x-W/2)<cell*.45)continue;
  const th=themeAt(x);B.push(mkB(pick(th==='candy'?CANDY:mode==='alex'?cityA():CITY),x,y,cell,th,L,pop?(.1+r*.07+c*.03+R()*.1):0))}
 if(mode==='zoe'){const zb=zBtn();B=B.filter(b=>Math.hypot(b.x-zb.x,b.y-b.h*.4-zb.y)>zb.r+b.w*.7)}
 if(mode==='alex'&&ms&&ms.sea)B=B.filter(b=>b.x>W*.34);B.sort((a,b)=>a.y-b.y)}
function mkB(type,x,y,cell,th,L,delay){const big=1+(th==='city'?(L-1)*.07:0);
 const dm={castle:[.95,1.25],cupcake:[.75,.7],house:[.75,.7],icecream:[.6,.95],block:[.75,rr(.9,1.5)*big],hangar:[.95,.55],tank:[.75,.38],fuel:[.65,.62],truck:[.75,.42],bunker:[.85,.5],turret:[.6,.6],tower:[.5,2.6]}[type];
 const w=cell*dm[0]*rr(.9,1.05),h=cell*dm[1],AL=ms?ms.L:1;let hp={castle:3,cupcake:1,house:1,icecream:1,block:Math.round(2*big),hangar:2,tank:1,fuel:1,truck:1,bunker:5+Math.floor(AL/3),turret:4+Math.floor(AL/4),tower:8+AL}[type];
 let arm=['bunker','turret','tower'].includes(type);if(mode==='alex'&&th==='city'){if(type==='block'&&R()<Math.min(.45,AL*.03)){arm=true;hp+=2}if(type==='tank')hp=1+Math.floor(AL/6)}
 return{type,th,x,y,w,h,d:w*.32,hp,max:hp,alive:true,arm,ft:rr(1.5,4),shake:0,pop:delay>0?-delay:1,col:PAL[type],seed:R(),boom:['tank','fuel','truck'].includes(type),face:R()<.5?1:-1}}
function genPuddles(){puddles=[];const n=mode==='zoe'?4:6;for(let i=0;i<n;i++){const x=rr(U*10,W-U*10);puddles.push({x,y:rr(groundTop()+U*10,H-U*6),rx:U*rr(6,10),ry:U*rr(2.5,4),th:themeAt(x),cd:0})}}
// ---------- dinos ----------
function mkDino(kind,who,x,y){const d={kind,who,x,y,z:0,vz:0,vx:0,vy:0,face:1,tx:null,ty:null,stompCd:1,fuel:1,fly:false,walkT:0,roarCd:0,mega:0,megaing:false,squash:0,combo:0,comboT:0,chain:0,score:0,whT:0,hopping:false,hp:100,hpMax:100,inv:0,dodge:0,dodgeCd:0,dizzy:0,minX:0,maxX:W,sz:U*(kind==='uni'?15:16)};setBounds(d);return d}
function setBounds(d){d.sz=U*(d.kind==='uni'?15:16);if(mode==='together'){if(d.who==='zoe'){d.minX=U*5;d.maxX=W/2-U*5}else{d.minX=W/2+U*5;d.maxX=W-U*5}}else{d.minX=U*5;d.maxX=W-U*5}}
const alexD=()=>dinos.find(d=>d.who==='alex'),zoeD=()=>dinos.find(d=>d.who==='zoe');
function near(b,x,y,r){const dx=Math.max(Math.abs(x-b.x)-b.w/2,0),dy=Math.max(Math.abs(y-(b.y-b.d*.5))-b.d*.5,0);return dx*dx+(dy*1.6)*(dy*1.6)<r*r}
function hurt(b,dmg,by){if(!b.alive||b.pop<1)return;b.hp-=dmg;b.shake=.3;if(b.hp<=0)destroy(b,by);else S.thud()}
function destroy(b,by){if(!b.alive)return;b.alive=false;const cx=b.x,cy=b.y-b.h*.6,candy=b.th==='candy',n=12+b.w/U;
 for(let i=0;i<n;i++)chunks.push({x:b.x+rr(-.5,.5)*b.w,y:b.y+rr(-.3,.2)*b.d,z:rr(0,b.h),vx:rr(-1,1)*U*45,vy:rr(-.5,.6)*U*20,vz:rr(25,80)*U,s:rr(1.3,3.2)*U,col:pick([].concat(b.col||["#8a8f98","#5b616b"],candy?['#fff','#ffe066','#b2f2bb']:['#444','#9aa'])),rot:R()*6,vr:rr(-9,9),life:rr(2.2,3.8)});
 if(b.gold&&by==='zoe')goldBurst(b);
 if(candy){burst(cx,cy,RAINBOW,34,'mix');glitter(cx,cy,14);S.sparkle();S.crunch(.5);if(R()<.7)kitties.push(mkKitty(b.x,b.y))}
 else{explode(cx,cy,b.w,b.boom);S.crunch();S.boom(b.boom?1:.55)}
 if(b.boom)pending.push({t:.22,x:b.x,y:b.y,r:b.w*1.8,by});
 if(b.type==='tower'){const dir=R()<.5?-1:1;for(let i=0;i<22;i++)chunks.push({x:b.x+dir*i*U*1.7,y:b.y+rr(-1,1)*U,z:U*rr(0,5),vx:dir*U*rr(5,20),vy:0,vz:U*rr(10,40),s:U*rr(1.5,3),col:i%2?'#c92a2a':'#f1f3f5',rot:R()*6,vr:rr(-6,6),life:rr(2,3.5)});shake=Math.max(shake,30);texts.push({x:b.x,y:b.y-b.h,s:'TIMBER!',t:0,col:'#ff922b',sz:U*8,big:1})}
 credit(by,b)}
let zPop=0,zSayT=-1e9;// Zoe count pop on screen; voice only on milestones (10,20..), max one every 4 s
function credit(by,b){save.smashed++;if(by==='wave')return;const pts=b.max*10;
 const a=(by==='alex'||by==='jet')?alexD():null,z=by==='zoe'?zoeD():null;
 if(a){if(a.comboT>0)a.combo++;else a.combo=1;a.comboT=mode==='alex'&&ms?Math.max(1,2.6-ms.L*.07):2.6;a.chain++;a.mega=Math.min(1,a.mega+(by==='jet'?.03:.07)*(ab('MEGA CHARGE')?1.4:1));if(b.type==='fuel'&&a.hp<a.hpMax){a.hp=Math.min(a.hpMax,a.hp+10);texts.push({x:b.x,y:b.y-b.h-U*8,s:'+10 ❤️',t:0,col:'#69db7c',sz:U*4.5})}if(mode==='alex')misCount(b);const p=pts*a.combo;a.score+=p;
  if(a.combo>=3&&a.combo%1===0)texts.push({x:b.x,y:b.y-b.h-U*4,s:'x'+a.combo+'!',t:0,col:'#ffd43b',sz:U*(5+Math.min(a.combo,12)*.4)});
  if(mode==='alex'&&a.score>save.hi)save.hi=a.score}
 if(z){z.score++;save.zoe++;zPop=1;if(mode==='zoe'){texts.push({x:b.x,y:b.y-b.h-U*4,s:''+z.score,t:0,col:'#ff5c8a',sz:U*6});const tn=performance.now();if(window.KV&&z.score%10===0&&z.score<=100&&tn-zSayT>4000){zSayT=tn;KV.say('n'+z.score,{prio:2})}}}
 if(mode==='together'&&!finale&&!wave)meter=Math.min(1,meter+.028);if(mode==='zoe'&&!wave&&by==='zoe')zFill(b.gold?.25:.07)}
function endCombo(a){if(a.chain>save.biggest&&mode==='alex'){save.biggest=a.chain;if(a.chain>=5)texts.push({x:W/2,y:H*.3,s:'BIGGEST SMASH! '+a.chain,t:0,col:'#ff922b',sz:U*7,big:1})}a.chain=0;a.combo=0;persist()}
function stomp(d,r,dmg,big){shake=Math.max(shake,big?26:9);S.stomp(big);
 for(let i=0;i<16;i++){const a=i/16*6.28;parts.push({x:d.x+Math.cos(a)*r*.3,y:d.y+Math.sin(a)*r*.15,vx:Math.cos(a)*U*40,vy:Math.sin(a)*U*18,life:.6,max:.6,col:d.kind==='uni'?pick(RAINBOW):'#d8c8a8',size:U*rr(1.5,2.6),shape:d.kind==='uni'?'star':'dot',gr:0})}
 rings.push({x:d.x,y:d.y,r:r*.2,max:r,life:.35,col:d.kind==='uni'?'#ff9cf0':'#fff8e0',speed:r*4});
 for(const b of B)if(b.alive&&near(b,d.x,d.y,r))hurt(b,dmg,d.who);splashCheck(d,true);
 if(d.who==='alex'){d.inv=Math.max(d.inv||0,.35);if(boss&&boss.k!=='heli'&&Math.hypot(d.x-boss.x,(d.y-boss.y)*1.4)<r+U*12)bossHurt(Math.min(dmg,6)*4)}}
function splashCheck(d,big){for(const p of puddles){const dx=(d.x-p.x)/p.rx,dy=(d.y-p.y)/p.ry;if(dx*dx+dy*dy<1.4&&(big||p.cd<=0)){p.cd=.5;S.splash();
 for(let i=0;i<(big?24:10);i++)parts.push({x:d.x+rr(-1,1)*U*3,y:d.y-U,vx:rr(-1,1)*U*35,vy:-rr(30,80)*U,life:.8,max:.8,col:p.th==='candy'?pick(['#ffc9f1','#a5d8ff','#fff']):pick(['#74c0fc','#a5d8ff','#fff']),size:U*rr(1,2),shape:'dot',gr:U*180})}}}
function megaBlast(d){stomp(d,U*44,99,true);flash=.6;shake=34;S.boom(1.3);texts.push({x:d.x,y:d.y-d.sz*1.5,s:'MEGA STOMP!',t:0,col:'#ff6b6b',sz:U*9,big:1});
 if(d.who==='alex'){for(const h of heli)if(Math.hypot(h.x-d.x,h.y-d.y)<U*70)heliHurt(h,99);if(boss&&boss.k==='heli')bossHurt(22)}
 for(let i=0;i<9;i++)rockets.push({x:clamp(d.x+rr(-30,30)*U,U*5,W-U*5),y:d.y,vy:-U*rr(120,170),ty:rr(.12,.35)*H,cols:HOT})}
// ---------- critters / fx ----------
function mkKitty(x,y){S.mew();save.kitties++;return{x,y,z:U*5,vz:U*95,vx:rr(-1,1)*U*8,t:0,col:pick(['#ffb74d','#c7c7c7','#ffffff','#f8bbd0','#ffe0b2','#8d8d8d']),f:R()<.5?-1:1,j:0}}
function burst(x,y,cols,n,shape){for(let i=0;i<n;i++){const a=R()*6.28,s=U*rr(15,60);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.8,1.5),max:1.5,col:pick(cols),size:U*rr(.8,1.6),shape:shape==='mix'?pick(['dot','star','heart']):shape,gr:U*25})}}
function glitter(x,y,n){for(let i=0;i<n;i++)parts.push({x:x+rr(-6,6)*U,y:y+rr(-6,6)*U,vx:rr(-8,8)*U,vy:-rr(5,20)*U,life:rr(.6,1.3),max:1.3,col:pick(['#fff','#ffe066','#ffd6f5']),size:U*rr(.6,1.2),shape:'star',gr:0})}
function explode(x,y,w,big){parts.push({x,y,vx:0,vy:0,life:.25,max:.25,col:'#fff3bf',size:w*(big?.9:.6),shape:'flash',gr:0});
 for(let i=0;i<22;i++){const a=R()*6.28,s=U*rr(15,55);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-U*10,life:rr(.4,.9),max:.9,col:pick(['#ffd43b','#ff922b','#ff6b6b','#fff']),size:U*rr(1,2.2),shape:'dot',gr:U*40})}
 burst(x,y-U*4,HOT,big?18:8,'dot');for(let i=0;i<(big?7:4);i++)smoke.push({x:x+rr(-1,1)*w*.3,y:y+rr(-1,1)*U*3,r:U*rr(3,6),vy:-U*rr(6,14),vx:rr(-3,3)*U,life:rr(1.5,2.6),max:2.6,col:pick(['#555','#6b6b6b','#3d3d3d'])})}
function flame(d){const s=d.sz;for(let i=0;i<2;i++)parts.push({x:d.x-d.face*s*.3,y:d.y-d.z-s*.45,vx:rr(-5,5)*U,vy:U*rr(30,60),life:.3,max:.3,col:pick(['#ffd43b','#ff922b','#fff']),size:U*rr(1,2),shape:'dot',gr:0})}
// ---------- game flow ----------
function startGame(m){mode=m;state='play';chunks=[];parts=[];smoke=[];rings=[];kitties=[];jets=[];bombs=[];lava=[];splats=[];rockets=[];texts=[];pending=[];wave=null;meter=0;finale=0;ms=null;heli=[];shots=[];strafes=[];boss=null;hurtT=0;balloons=[];zstars=[];
 waveTimer=m!=='zoe'?1e9:ZT.fallback;jetTimer=m!=='together'?1e9:rr(3,6);volT=rr(4,7);dinos=[];
 if(m!=='alex')dinos.push(mkDino('uni','zoe',m==='zoe'?W*.5:W*.25,H*.78));if(m!=='zoe')dinos.push(mkDino('trex','alex',m==='alex'?W*.5:W*.75,H*.78));
 genTown(true);genPuddles();zReset(1);if(m==='together')setTimeout(()=>S.horn(),300);for(const k in AIN)AIN[k]=k[0]==='j'?0:false;ptrs.clear();if(m==='alex')startLevel(save.cur)}
function goTitle(){for(const d of dinos)if(d.who==='alex')endCombo(d);persist();state='title';setEngine(-1);ptrs.clear()}
function startWave(fin){if(mode==='zoe'){zWave();return}wave={x:-W*.6,warn:fin?.6:2.2,fin};S.rumble();texts.push({x:W/2,y:H*.25,s:'🌊 TSUNAMI! 🌊',t:0,col:'#4dabf7',sz:U*10,big:1})}
function rebuild(){if(mode==='alex'){S.build();startLevel(save.cur);return}
 texts.push({x:W/2,y:H*.3,s:mode==='zoe'?'✨🏰✨':'✨ NEW TOWN! ✨',t:0,col:'#ff8fe0',sz:U*8,big:1});
 persist();chunks=[];lava=[];splats=[];genTown(true);genPuddles();S.build();waveTimer=mode==='together'?1e9:mode==='zoe'?ZT.fallback:rr(30,45);if(mode==='zoe')zReset()}
// ---------- Zoe mode v2: wave meter, regrowth, treasure, balloons, surfing + stars ----------
const ZT={fill:.07,autoAfter:2.5,smashFrac:.8,fallback:45,regrow:1.8,goldEvery:[10,16],balEvery:[3.5,6],balMax:3,waveSpd:.3,starN:9};
function zReset(all){zw.m=0;zw.full=0;zw.grow=1.2;if(all){zw.gold=rr(5,8);zw.bal=rr(1.5,3)}zw.target=Math.max(6,B.length);zw.gone=0;zw.cheer=0}
const zBtn=()=>{const r=Math.max(44,U*(W<H?9:10.5));return{x:W-r-U*3,y:H-r-U*3,r}};
const chime=(f,v=.08,t0=0)=>{tone('triangle',f,f,.35,v,t0);tone('sine',f*2,f*2,.25,v*.4,t0)};
function zFill(n){if(zw.m>=1)return;zw.m=Math.min(1,zw.m+n);if(zw.m>=1){zw.full=0;if(ok('zf',800))[0,4,7,12].forEach((q,i)=>chime(784*Math.pow(2,q/12),.07,i*.07))}}
function zTap(x,y){const zb=zBtn();if(!wave&&dist(zb,x,y)<zb.r*1.2){if(zw.m>=1)zWave();else if(ok('zt',300)){glitter(zb.x,zb.y,6);chime(1047,.05)}return true}
 if(wave&&!wave.warn){let hit=null;for(const s of zstars)if(!s.got&&Math.hypot(s.x-x,s.y-y)<s.r*1.6)hit=s;if(hit)zGetStar(hit);const d=zoeD();if(d&&d.surf)d.sty=clamp(y,HZ*.35,H*.8);return true}
 if(wave)return true;
 for(let i=balloons.length-1;i>=0;i--){const b=balloons[i];if(Math.hypot(b.x-x,b.y-y)<b.r*1.5){zPopBalloon(b);return true}}return false}
function zPopBalloon(b){b.done=1;burst(b.x,b.y,[b.col,'#fff','#ffe066'],26,'mix');glitter(b.x,b.y,8);rings.push({x:b.x,y:b.y,r:U,max:U*9,life:.35,col:b.col,speed:U*30});
 if(ok('bp',90)){noise(.08,.18,'bandpass',2600,1200,0,1.2);chime(rr(1000,1300),.06,.03)}zFill(.05)}
function zGetStar(s){s.got=1;zw.stars++;burst(s.x,s.y,['#ffe066','#fff','#ffd6f5'],18,'star');if(ok('zs',80))chime(880*Math.pow(2,[0,2,4,7,9,12,14,16,19][zw.stars%9]/12),.07)}
function goldBurst(b){const cx=b.x,cy=b.y-b.h*.6;burst(cx,cy,RAINBOW.concat(['#ffd43b','#ffe066']),70,'mix');glitter(cx,cy,20);flash=Math.max(flash,.25);
 for(let i=0;i<3;i++){rockets.push({x:clamp(cx+rr(-20,20)*U,U*5,W-U*5),y:b.y,vy:-U*rr(110,150),ty:rr(.12,.3)*H,cols:RAINBOW});kitties.push(mkKitty(b.x+rr(-1,1)*U*4,b.y))}
 [0,4,7,12,16].forEach((q,i)=>chime(659*Math.pow(2,q/12),.08,i*.08))}
function zSpot(){const cell=U*18,top=groundTop()+U*8,bot=H-U*5,d=zoeD(),zb=zBtn();
 for(let i=0;i<25;i++){const x=rr(U*8,W-U*8),y=rr(top+cell*.5,bot);if(Math.hypot(zb.x-x,zb.y-y)<zb.r+cell*.7)continue;if(d&&Math.hypot(d.x-x,d.y-y)<U*12)continue;
  if(B.some(b=>b.alive&&Math.abs(b.x-x)<cell*.75&&Math.abs(b.y-y)<cell*.55))continue;return{x,y,cell}}return null}
function zGrow(gold){const p=zSpot();if(!p)return;const b=mkB(gold?'castle':pick(CANDY),p.x,p.y,p.cell,'candy',1,.05);b.q=1;
 if(gold){b.gold=1;b.col=['#ffe066','#ffc300','#fff'];b.hp=1;b.max=1}B.push(b);B.sort((a,c)=>a.y-c.y);glitter(p.x,p.y-p.cell*.4,10);if(ok('zg',600))chime(gold?1568:rr(1200,1500),.04)}
function zWave(){if(wave)return;zw.m=0;zw.full=0;wave={x:-W*.12,warn:1,fin:false};zw.stars=0;texts.push({x:W/2,y:H*.25,s:'🌊🦄🌊',t:0,col:'#4dabf7',sz:U*11,big:1});
 S.rumble();[0,4,7,12,16,19].forEach((q,i)=>chime(523*Math.pow(2,q/12),.08,i*.09));for(let i=0;i<4;i++)rockets.push({x:rr(.15,.85)*W,y:H,vy:-U*rr(120,160),ty:rr(.1,.3)*H,cols:RAINBOW});
 zstars=[];for(let i=0;i<ZT.starN;i++)zstars.push({x:W*(.18+.78*i/(ZT.starN-1))+rr(-3,3)*U,y:rr(HZ*.4,H*.75),r:Math.max(26,U*5),ph:R()*6});
 balloons=[];const d=zoeD();if(d){d.surf=true;d.tx=null;d.hopping=false;d.sty=HZ;d.face=1}}
function zSurf(d,dt){if(!wave){d.surf=false;return}const top=HZ-U*14;if(wave.warn>0){d.vz=0;d.z=Math.max(0,d.z);return}
 const gx=clamp(wave.x-U*2,U*5,W-U*5);d.x+=(gx-d.x)*Math.min(1,dt*6);d.face=1;
 const ty=d.sty==null?top:d.sty;d.y=clamp(d.y+(H*.85-d.y)*Math.min(1,dt*3),groundTop()+U*4,H-U*3);const want=Math.max(0,d.y-ty);d.z+=(want-d.z)*Math.min(1,dt*4);
 const hy=d.y-d.z-d.sz*.5;for(const s of zstars)if(!s.got&&Math.abs(s.x-d.x)<U*10&&Math.abs(s.y-hy)<U*12)zGetStar(s);
 if(R()<dt*20)parts.push({x:d.x-U*3,y:d.y-d.z,vx:-U*rr(10,30),vy:-U*rr(0,15),life:.6,max:.6,col:pick(RAINBOW),size:U*rr(.8,1.4),shape:'star',gr:U*30})}
function zUpdate(dt){const d=zoeD();
 if(!wave){if(d&&d.surf){d.surf=false;d.vz=0;d.x=clamp(d.x,d.minX,d.maxX)}zstars=[];
  const alive=B.filter(b=>b.alive).length;zw.grow-=dt;zw.gold-=dt;if(zw.grow<=0){zw.grow=ZT.regrow;if(alive<zw.target||zw.gold<=0){const gd=zw.gold<=0&&!B.some(b=>b.gold&&b.alive);if(gd)zw.gold=rr(...ZT.goldEvery);zGrow(gd)}}
  if(zw.m>=1){zw.full+=dt;if(zw.full>ZT.autoAfter)zWave()}
  else if(alive<=zw.target*(1-ZT.smashFrac)&&zw.m>.6)zWave();
  zw.bal-=dt;if(zw.bal<=0){zw.bal=rr(...ZT.balEvery);if(balloons.length<ZT.balMax&&zw.m<1){const zb=zBtn();balloons.push({x:rr(U*10,Math.min(W-U*10,zb.x-zb.r-U*6)),y:H+U*8,r:Math.max(28,U*6),col:pick(RAINBOW.slice(0,7)),ph:R()*6,vy:-U*rr(7,10)})}}}
 else{balloons=[];zw.sp=(zw.sp||0)-dt;if(!wave.warn&&zw.sp<=0&&wave.x<W*.8&&zstars.filter(s=>!s.got).length<5){zw.sp=.5;zstars.push({x:rr(Math.max(wave.x+W*.15,W*.2),W*.95),y:rr(HZ*.4,H*.75),r:Math.max(26,U*5),ph:R()*6})}}
 for(const b of balloons){b.y+=b.vy*dt;b.x+=Math.sin(T*1.5+b.ph)*U*4*dt;if(b.y<-U*12)b.done=1}balloons=balloons.filter(b=>!b.done);
 for(const s of zstars){if(s.got){s.y-=U*40*dt;s.r*=.97}}zstars=zstars.filter(s=>!s.got||s.r>4)}
function zDraw(){for(const b of balloons){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=U*.3;g.beginPath();g.moveTo(b.x,b.y+b.r*1.1);g.quadraticCurveTo(b.x+Math.sin(T*3+b.ph)*U*2,b.y+b.r*1.8,b.x,b.y+b.r*2.6);g.stroke();
  g.lineWidth=U*.4;g.strokeStyle='rgba(122,59,111,.6)';ell(b.x,b.y,b.r*.85,b.r,b.col,1);g.globalAlpha=.55;ell(b.x-b.r*.3,b.y-b.r*.35,b.r*.18,b.r*.28,'#fff');g.globalAlpha=1;poly([b.x-U,b.y+b.r*1.12,b.x+U,b.y+b.r*1.12,b.x,b.y+b.r*.95],b.col)}
 for(const s of zstars){const sc=1+.12*Math.sin(T*6+s.ph);g.globalAlpha=s.got?.7:1;g.globalAlpha*=.35;circ(s.x,s.y,s.r*1.2*sc,'#fff8c4');g.globalAlpha=s.got?.7:1;g.lineWidth=U*.4;g.strokeStyle='#e8a800';star5Z(s.x,s.y,s.r*sc);g.globalAlpha=1}}
function star5Z(x,y,r){g.beginPath();for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,rd=i%2?r*.45:r;g.lineTo(x+Math.cos(an)*rd,y+Math.sin(an)*rd)}g.closePath();g.fillStyle='#ffe066';g.fill();g.stroke()}
function zBtnDraw(){const b=zBtn(),full=zw.m>=1&&!wave,p=full?1+.08*Math.sin(T*8):1,r=b.r*p;g.save();g.globalAlpha=wave?.4:1;
 if(full){g.globalAlpha=.4+.3*Math.sin(T*8);circ(b.x,b.y,r*1.3,'#fff6a8');g.globalAlpha=1}
 g.lineWidth=U*.8;g.strokeStyle='#fff';circ(b.x,b.y,r,'rgba(90,40,120,.45)',1);
 if(zw.m>0){g.save();g.beginPath();g.arc(b.x,b.y,r*.92,0,6.2832);g.clip();const gr=g.createLinearGradient(0,b.y+r,0,b.y-r);RAINBOW.slice(0,6).forEach((c,i)=>gr.addColorStop(i/5,c));g.fillStyle=gr;g.fillRect(b.x-r,b.y+r-2*r*zw.m,2*r,2*r*zw.m);g.restore()}
 if(full){g.strokeStyle='#ffe066';g.lineWidth=U*(1+.6*Math.sin(T*10));g.beginPath();g.arc(b.x,b.y,r*1.08,0,6.3);g.stroke()}
 g.font=Math.round(r*1.05)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('🌊',b.x,b.y+r*.05);g.restore()}

// ---------- input ----------
const ptrs=new Map(),AIN={jx:0,jy:0,boost:false,boostTap:false,roar:false,mega:false},keys={};
const region=x=>mode==='alex'?'alex':mode==='zoe'?'zoe':(x<W/2?'zoe':'alex');
function btns(){const k=U*(W<H?.9:1);return{boost:{x:W-k*15,y:H-k*15,r:k*11.5,ic:'🚀'},roar:{x:W-k*39,y:H-k*11,r:k*9,ic:'🦖'},mega:{x:W-k*14,y:H-k*41,r:k*9,ic:'💥'}}}
const menuBtn=()=>({x:W-U*7,y:U*7,r:U*5});
let fsTried=false;function goFS(){if(fsTried)return;fsTried=true;const el=document.documentElement,f=el.requestFullscreen||el.webkitRequestFullscreen;if(f&&!document.fullscreenElement){try{const p=f.call(el);if(p&&p.catch)p.catch(()=>{})}catch(e){}}}
const dist=(a,x,y)=>Math.hypot(a.x-x,a.y-y);
cv.addEventListener('pointerdown',e=>{e.preventDefault();unlock();goFS();const x=e.clientX,y=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(_){}
 if(state==='title'){titleTap(x,y);return}
 const mb=menuBtn();if(dist(mb,x,y)<mb.r*1.3){ptrs.set(e.pointerId,{k:'menu',t0:T});return}
 if(mode==='alex'&&ms&&ms.phase==='fail'){failTap(x,y);return}
 if(region(x)==='alex'){const bb=btns();for(const k of['boost','roar','mega'])if(dist(bb[k],x,y)<bb[k].r*1.2){ptrs.set(e.pointerId,{k});if(k==='boost'){AIN.boost=true;AIN.boostTap=true}else AIN[k]=true;return}
  ptrs.set(e.pointerId,{k:'joy',ox:x,oy:y,x,y});return}
 if(mode==='zoe'&&zTap(x,y)){ptrs.set(e.pointerId,{k:'zb',x,y,t0:T});return}
 tapZoe(x,y);ptrs.set(e.pointerId,{k:'zoe',x,y,t0:T})},{passive:false});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;e.preventDefault();p.x=e.clientX;p.y=e.clientY;
 if(p.k==='zoe'&&T-p.t0>.25){const d=zoeD();if(d){d.tx=clamp(p.x,d.minX,d.maxX);d.ty=clamp(p.y,groundTop()+U*4,H-U*3)}}},{passive:false});
function pup(e){const p=ptrs.get(e.pointerId);if(!p)return;ptrs.delete(e.pointerId);if(p.k==='boost'&&![...ptrs.values()].some(q=>q.k==='boost'))AIN.boost=false}
cv.addEventListener('pointerup',pup);cv.addEventListener('pointercancel',pup);
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturestart',e=>e.preventDefault());
addEventListener('keydown',e=>{unlock();if(keys[e.code])return;keys[e.code]=1;if(state==='title'){if(e.code==='Digit1')startGame('alex');if(e.code==='Digit2')startGame('zoe');if(e.code==='Digit3')startGame('together');if(e.code==='Enter'||e.code==='Space')startGame(qmode||'alex');return}
 if(mode==='alex'&&ms&&ms.phase==='fail'){if(e.code==='Enter'||e.code==='KeyR'||e.code==='Space')startLevel(ms.L);if(e.code==='Escape')goTitle();return}
 if(e.code==='Space'){AIN.boost=true;AIN.boostTap=true}if(e.code==='KeyR')AIN.roar=true;if(e.code==='KeyM'||e.code==='KeyE')AIN.mega=true;if(e.code==='Escape')goTitle()});
addEventListener('keyup',e=>{keys[e.code]=0;if(e.code==='Space')AIN.boost=false});
['pointerdown','touchend','keydown','click'].forEach(n=>addEventListener(n,unlock,{passive:true}));
function tapZoe(x,y){const d=zoeD();if(!d)return;let hitB=null;for(const b of B)if(b.alive&&b.pop>=1&&Math.abs(x-b.x)<b.w*.6&&y<b.y+U*2&&y>b.y-b.h-b.d*.6-U*3&&(!hitB||b.y>hitB.y))hitB=b;
 if(mode==='together'&&x>=W/2)hitB=null;
 if(hitB){destroy(hitB,'zoe');burst(hitB.x,hitB.y-hitB.h*.6,RAINBOW,30,'heart');S.heart();d.tx=clamp(hitB.x+(d.x<hitB.x?-1:1)*hitB.w*.5,d.minX,d.maxX);d.ty=clamp(hitB.y+U*3,groundTop()+U*4,H-U*3)}
 else{d.tx=clamp(x,d.minX,d.maxX);d.ty=clamp(y,groundTop()+U*4,H-U*3);glitter(x,y,8);rings.push({x:d.tx,y:d.ty,r:U,max:U*6,life:.4,col:'#ffb3f0',speed:U*20});S.sparkle()}}
// ---------- title ----------
function titleCards(){const land=W>=H,cw=land?Math.min(W*.27,H*.48):Math.min(W*.6,H*.22),gap=land?cw*.12:cw*.08;const ms=['alex','zoe','together'],out=[];
 for(let i=0;i<3;i++){const x=land?W/2+(i-1)*(cw+gap):W/2,y=land?H*.6:H*.36+i*(cw+gap);out.push({m:ms[i],x,y,s:cw})}return out}
function titleTap(x,y){for(const c of titleCards())if(Math.abs(x-c.x)<c.s*.55&&Math.abs(y-c.y)<c.s*.55){S.boing();startGame(c.m);return}}
// ---------- update ----------
function upAlex(d,dt){d.inv=Math.max(0,d.inv-dt);d.dodge=Math.max(0,d.dodge-dt);d.dodgeCd-=dt;
 if(d.dizzy>0){d.dizzy-=dt;if(d.dizzy<=0){d.hp=d.hpMax;d.inv=1.5}AIN.boostTap=false;AIN.roar=false;AIN.mega=false;d.vx*=.9;d.vy*=.9;d.z=Math.max(0,d.z-U*60*dt);d.vz=0;d.fly=false;if(R()<dt*6)parts.push({x:d.x+rr(-1,1)*U*4,y:d.y-d.sz*1.1,vx:0,vy:-U*5,life:.6,max:.6,col:'#ffe066',size:U*1.2,shape:'star',gr:0});setEngine(0);return}
 let jx=AIN.jx,jy=AIN.jy;if(keys.ArrowLeft||keys.KeyA)jx=-1;if(keys.ArrowRight||keys.KeyD)jx=1;if(keys.ArrowUp||keys.KeyW)jy=-1;if(keys.ArrowDown||keys.KeyS)jy=1;
 const sp=U*(d.z>2?78:58),k=Math.min(1,dt*8);d.vx+=(jx*sp-d.vx)*k;d.vy+=(jy*sp*.7-d.vy)*k;
 d.x=clamp(d.x+d.vx*dt,d.minX,d.maxX);d.y=clamp(d.y+d.vy*dt,groundTop()+U*4,H-U*3);if(Math.abs(d.vx)>U*3)d.face=d.vx>0?1:-1;
 const spd=Math.hypot(d.vx,d.vy);if(spd>U*8&&d.z<1){d.walkT+=dt*13;if(Math.sin(d.walkT)>.95)splashCheck(d,false)}
 if(AIN.boostTap&&d.dodgeCd<=0){d.dodge=.45;d.dodgeCd=.9}if(AIN.boostTap&&d.z<1&&!d.megaing){d.vz=U*115;S.boing()}AIN.boostTap=false;
 d.fly=false;if(AIN.boost&&d.fuel>0&&!d.megaing){d.vz=Math.min(d.vz+U*430*dt,U*95);d.fuel=Math.max(0,d.fuel-dt*(ab('TURBO JET')?.22:.33));d.fly=true;flame(d);if(T-d.whT>.13){d.whT=T;S.jet()}}
 d.vz-=U*(d.megaing&&d.vz<0?750:300)*dt;d.z+=d.vz*dt;if(d.z>U*42){d.z=U*42;d.vz=Math.min(d.vz,0)}
 if(d.z<=0){const fall=-d.vz;d.z=0;d.vz=0;if(d.megaing){d.megaing=false;megaBlast(d)}else if(fall>U*70)stomp(d,U*10+fall*.08,fall>U*150?3:2,fall>U*150);else if(fall>U*15)d.squash=.15;d.fuel=Math.min(1,d.fuel+dt*.45)}
 if(d.z<U*4&&spd>U*30)for(const b of B)if(b.alive&&b.pop>=1&&near(b,d.x,d.y,d.sz*.4)){b.hp-=dt*(b.arm?1.5:7);b.shake=.2;if(T-(b.ct||0)>.15){b.ct=T;S.crunch(.4);chunks.push({x:b.x,y:b.y,z:b.h*.5,vx:rr(-1,1)*U*30,vy:0,vz:U*40,s:U*1.5,col:b.col[0],rot:0,vr:5,life:1.2})}if(b.hp<=0)destroy(b,'alex')}
 d.roarCd-=dt;if(AIN.roar){AIN.roar=false;if(d.roarCd<=0){d.roarCd=2.2;S.roar();shake=Math.max(shake,12);rings.push({x:d.x,y:d.y,hy:d.y-d.z-d.sz*.6,r:U*4,max:U*(ab('BIG ROAR')?55:40),life:.6,col:'#ffe066',speed:U*95,dmg:ab('BIG ROAR')?3:2,hit:new Set(),who:'alex'});texts.push({x:d.x,y:d.y-d.z-d.sz*1.3,s:'ROAR!',t:0,col:'#fff',sz:U*6})}}
 if(AIN.mega){AIN.mega=false;if(d.mega>=1&&!d.megaing){d.megaing=true;d.vz=U*210;d.mega=0;S.mega()}}
 if(d.comboT>0){d.comboT-=dt;if(d.comboT<=0)endCombo(d)}
 setEngine(Math.min(1,spd/(U*60))+(d.fly?.3:0))}
function hop(d){d.vz=U*85;d.hopping=true;d.stompCd=1.1;S.boing()}
function upZoe(d,dt){if(d.surf){zSurf(d,dt);return}d.stompCd-=dt;if(d.tx!=null){const dx=d.tx-d.x,dy=d.ty-d.y,ds=Math.hypot(dx,dy),sp=U*40;
  if(ds<U*1.5){d.tx=null;if(d.z<1)hop(d)}else{const m=Math.min(ds,sp*dt);d.x+=dx/ds*m;d.y+=dy/ds*m;if(Math.abs(dx)>U)d.face=dx>0?1:-1;if(d.z<1){d.walkT+=dt*10;splashCheck(d,false)}}}
 if(d.z<1&&d.stompCd<=0&&B.some(b=>b.alive&&b.pop>=1&&near(b,d.x,d.y,U*9)))hop(d);
 d.vz-=U*300*dt;d.z+=d.vz*dt;if(d.z<=0){if(d.hopping&&d.vz<0){d.hopping=false;stomp(d,U*12,3,false);glitter(d.x,d.y-U*3,10)}d.z=0;d.vz=0}
 if(R()<dt*8)glitter(d.x+rr(-1,1)*d.sz*.4,d.y-d.z-rr(0,1)*d.sz,1)}
function update(dt){T+=dt;titleT+=dt;shake*=Math.pow(.02,dt);flash=Math.max(0,flash-dt);
 for(const p of parts){p.life-=dt;p.vx*=Math.pow(.3,dt);p.vy=p.vy*Math.pow(.3,dt)+p.gr*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}parts=parts.filter(p=>p.life>0);if(parts.length>1400)parts.splice(0,parts.length-1400);
 for(const s of smoke){s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=U*3*dt}smoke=smoke.filter(s=>s.life>0);
 for(const r of rockets){r.y+=r.vy*dt;if(R()<.6)parts.push({x:r.x,y:r.y,vx:rr(-3,3)*U,vy:U*10,life:.4,max:.4,col:'#fff3bf',size:U*.8,shape:'dot',gr:0});if(r.y<=r.ty){r.done=1;burst(r.x,r.y,r.cols,45,r.cols===RAINBOW?'mix':'dot');S.firework()}}rockets=rockets.filter(r=>!r.done);
 for(const t of texts)t.t+=dt;texts=texts.filter(t=>t.t<(t.big?2.2:1.2));
 if(state!=='play')return;
 // joystick
 AIN.jx=0;AIN.jy=0;for(const p of ptrs.values()){if(p.k==='joy'){let dx=(p.x-p.ox)/(U*11),dy=(p.y-p.oy)/(U*11);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}if(l>.15){AIN.jx=dx;AIN.jy=dy}}
  if(p.k==='menu'&&T-p.t0>.8){goTitle();return}}
 hurtT=Math.max(0,hurtT-dt);const frozen=mode==='alex'&&ms&&ms.phase==='fail';
 for(const d of dinos){if(frozen)continue;if(d.who==='alex')upAlex(d,dt);else upZoe(d,dt);d.squash=Math.max(0,d.squash-dt)}
 for(const b of B){b.shake=Math.max(0,b.shake-dt);if(b.pop<1){const was=b.pop;b.pop+=dt*2.5;if(was<0&&b.pop>=0&&!b.q)S.boing()}}
 for(const r of rings){r.r+=r.speed*dt;r.life-=dt;if(r.dmg)for(const b of B)if(b.alive&&!r.hit.has(b)&&near(b,r.x,r.y,r.r)){r.hit.add(b);hurt(b,r.dmg,r.who)}if(r.who==='alex')ringHits(r)}rings=rings.filter(r=>r.life>0&&r.r<r.max*1.2);
 for(const p of pending){p.t-=dt;if(p.t<=0){p.done=1;explode(p.x,p.y-U*3,p.r,true);S.boom(.8);shake=Math.max(shake,12);for(const b of B)if(b.alive&&near(b,p.x,p.y,p.r))hurt(b,3,p.by)}}pending=pending.filter(p=>!p.done);
 for(const c of chunks){c.life-=dt;c.vz-=U*260*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;c.rot+=c.vr*dt;if(c.z<0){c.z=0;c.vz*=-.35;c.vx*=.6;c.vy*=.6;c.vr*=.5}}chunks=chunks.filter(c=>c.life>0);if(chunks.length>500)chunks.splice(0,chunks.length-500);
 for(const p of puddles)p.cd-=dt;
 for(const k of kitties){k.t+=dt;k.vz-=U*300*dt;k.z+=k.vz*dt;if(k.z<=0){k.z=0;if(k.t<4){k.vz=U*rr(45,75);k.j++;if(k.j%2===0)parts.push({x:k.x,y:k.y-U*8,vx:0,vy:-U*20,life:1,max:1,col:'#ff5c8a',size:U*1.6,shape:'heart',gr:0});if(R()<.15)S.mew()}else k.vz=0}
  if(k.t>4)k.x+=k.f*U*45*dt;else k.x+=k.vx*dt;if(wave&&!wave.warn&&wave.x>k.x-U*14&&k.z<U*20)k.vz=Math.max(k.vz,U*140)}kitties=kitties.filter(k=>k.x>-U*10&&k.x<W+U*10&&k.t<10);
 // jets
 jetTimer-=dt;if(jetTimer<=0){jetTimer=mode==='alex'?rr(5,9):rr(7,12);const dir=R()<.5?1:-1;jets.push({x:dir>0?-U*20:W+U*20,y:rr(.08,.22)*H,vx:dir*U*rr(75,100),nd:rr(.3,.7)});S.flyby()}
 for(const j of jets){j.x+=j.vx*dt;j.nd-=dt;if(R()<.7)smoke.push({x:j.x-Math.sign(j.vx)*U*7,y:j.y,r:U*1.2,vy:0,vx:0,life:1.2,max:1.2,col:'#ffffff'});
  if(j.nd<=0&&j.x>U*5&&j.x<W-U*5){j.nd=rr(.3,.6);const cs=B.filter(b=>b.alive&&b.pop>=1&&themeAt(b.x)==='city'&&Math.abs(b.x-j.x)<U*25);if(cs.length){const b=pick(cs);bombs.push({x:j.x,y:j.y,vy:0,b});S.whistle()}}}
 jets=jets.filter(j=>j.x>-U*30&&j.x<W+U*30);
 for(const m of bombs){m.vy+=U*160*dt;m.y+=m.vy*dt;m.x+=(m.b.x-m.x)*Math.min(1,dt*2);parts.push({x:m.x,y:m.y,vx:0,vy:0,life:.3,max:.3,col:pick(HOT),size:U*.9,shape:'star',gr:0});
  if(m.y>=m.b.y-m.b.h*.6){m.done=1;burst(m.x,m.y,HOT.concat(RAINBOW),50,'mix');S.firework();if(m.b.alive)hurt(m.b,99,'jet')}}bombs=bombs.filter(m=>!m.done);
 // volcano
 if(mode!=='zoe'){volT-=dt;if(volT<=0){volT=rr(6,11);S.boom(.7);shake=Math.max(shake,6);const vx=volX(),vy=HZ-H*.17;for(let i=0;i<rr(4,8);i++){const tx=rr(mode==='together'?W*.55:W*.1,W*.95),ty=rr(groundTop()+U*8,H-U*5);lava.push({x:vx,y:vy,sx:vx,sy:vy,tx,ty,t:0,dur:rr(1.2,2)})}}
  for(const l of lava){l.t+=dt;const p=Math.min(1,l.t/l.dur);l.x=l.sx+(l.tx-l.sx)*p;l.y=l.sy+(l.ty-l.sy)*p-Math.sin(p*Math.PI)*H*.35;if(R()<.5)smoke.push({x:l.x,y:l.y,r:U*1.3,vx:0,vy:-U*4,life:.6,max:.6,col:'#777'});
   if(p>=1){l.done=1;S.lava();{const a=alexD();if(a&&Math.hypot(a.x-l.tx,(a.y-l.ty)*1.6)<U*8&&a.z<U*10)hitDino(a,mode==='alex'?9*dmul():6,l.tx,l.ty)}splats.push({x:l.tx,y:l.ty,life:6});explode(l.tx,l.ty-U*2,U*5,false);for(const b of B)if(b.alive&&near(b,l.tx,l.ty,U*7))hurt(b,2,'jet')}}lava=lava.filter(l=>!l.done);for(const s of splats)s.life-=dt;splats=splats.filter(s=>s.life>0)}
 if(mode==='alex')updMission(dt,frozen);else if(mode==='together')upEnemies(dt);
 if(mode==='zoe')zUpdate(dt);
 // wave + finale
 if(!wave){waveTimer-=dt;if(waveTimer<=0)startWave(false)}
 if(mode==='together'&&meter>=1&&!finale&&!wave){finale=5;save.coop++;persist();texts.push({x:W/2,y:H*.3,s:'SUPER SMASH! 🎆',t:0,col:'#fff',sz:U*10,big:1});S.horn()}
 if(finale>0){finale-=dt;if(R()<dt*7){const left=R()<.5;rockets.push({x:left?rr(.05,.45)*W:rr(.55,.95)*W,y:H,vy:-U*rr(130,180),ty:rr(.08,.35)*H,cols:left?RAINBOW:HOT});S.whistle()}
  if(R()<dt*1.5){const dir=R()<.5?1:-1;jets.push({x:dir>0?-U*20:W+U*20,y:rr(.08,.2)*H,vx:dir*U*110,nd:.2});S.flyby()}
  if(finale<=0){finale=0;startWave(true)}}
 if(wave){if(wave.warn>0){wave.warn-=dt;if(wave.warn<=0){wave.warn=0;S.wave()}}else{wave.x+=W*(mode==='zoe'?ZT.waveSpd:.42)*dt;
   for(const b of B)if(b.alive&&b.x-b.w/2<wave.x){destroy(b,'wave');S.crunch(.5)}chunks=chunks.filter(c=>c.x>wave.x-U*5);splats=splats.filter(s=>s.x>wave.x);
   for(const d of dinos)if(!d.surf&&Math.abs(d.x-wave.x)<U*12&&d.z<U*8){d.vz=Math.max(d.vz,U*110);if(d.who==='zoe')d.hopping=false;S.splash()}
   if(R()<.8)parts.push({x:wave.x,y:rr(groundTop(),H),vx:U*rr(20,60),vy:-U*rr(20,60),life:.7,max:.7,col:'#fff',size:U*rr(1,2.2),shape:'dot',gr:U*120});
   if(wave.x>W*(mode==='zoe'?1.1:1.45)){const fin=wave.fin;wave=null;if(fin)meter=0;rebuild()}}}
 B=B.filter(b=>b.alive)}
const volX=()=>mode==='together'?W*.86:W*.8;
// ---------- Alex missions: levels, enemies, bosses ----------
const SKINS=[{n:'GREEN',at:1,b:'#5cc94a',d:'#2e8b3a',l:'#f4e27a',o:'#1f4d23'},{n:'LAVA',at:5,b:'#ff6b3d',d:'#c92a2a',l:'#ffd43b',o:'#5c1a0a'},{n:'ROBO',at:10,b:'#adb5bd',d:'#6c757d',l:'#74c0fc',o:'#212529'},{n:'GOLD',at:15,b:'#ffd43b',d:'#f08c00',l:'#fff3bf',o:'#7a4a00'},{n:'SHADOW',at:20,b:'#7048e8',d:'#3b1f99',l:'#e599f7',o:'#120a2e'},{n:'ICE',at:30,b:'#a5d8ff',d:'#4dabf7',l:'#ffffff',o:'#1c4f7a'}];
const ABIL=[{n:'BIG ROAR',at:3},{n:'TURBO JET',at:7},{n:'TOUGH HIDE',at:12},{n:'MEGA CHARGE',at:18}];
const ab=n=>{if(mode!=='alex')return false;const x=ABIL.find(q=>q.n===n);return !!x&&save.best>=x.at};
const skinOf=o=>o.who==='alex'&&mode==='alex'?(SKINS[save.skin]||SKINS[0]):null;
const dmul=()=>mode==='alex'&&ms?1+Math.min(ms.L,40)*.03:.7;
function cityA(){const L=ms?ms.L:1,a=['block','block','block','hangar','tank','fuel','truck'];if(L>=2)a.push('bunker');if(L>=4)a.push('turret');if(L>=8)a.push('tank','turret','bunker');return a}
function misDef(L){if(L%5===0){const b=['mech','ship','heli'][(L/5-1)%3];return{type:'boss',boss:b,goal:1,time:100+Math.min(L,40),lab:'BOSS',txt:b==='mech'?'BEAT THE GIANT MECH!':b==='ship'?'SINK THE BATTLESHIP!':'DOWN THE MEGA COPTER!'}}
 const k=(L-1)%5;
 if(k===0){const n=L<=20?14+L*2:54+(L-20);return{type:'smash',goal:n,time:60,lab:'SMASH',txt:'SMASH '+n+' BUILDINGS!'}}
 if(k===1){const n=3+Math.floor(L/2);return{type:'tanks',goal:n,time:40+n*4,lab:'TANKS',txt:'DESTROY '+n+' TANKS!'}}
 if(k===2){const n=1+Math.floor(L/10);return{type:'tower',goal:n,time:45+n*10,lab:'TOWER',txt:n>1?'TOPPLE '+n+' RADIO TOWERS!':'TOPPLE THE RADIO TOWER!'}}
 const n=2+Math.floor(L/3);return{type:'turrets',goal:n,time:40+n*6,lab:'TURRETS',txt:'WRECK '+n+' DINO TURRETS!'}}
function startLevel(L){L=Math.max(1,L|0);const def=misDef(L);ms={L,def,n:0,t:def.time,phase:'intro',pt:2.6,spawnT:1,base:0,sea:def.boss==='ship',stars:0,unl:[]};
 heli=[];shots=[];strafes=[];boss=null;jets=[];bombs=[];lava=[];wave=null;chunks=[];splats=[];pending=[];texts=[];heliT=rr(3,6);strafeT=rr(6,9);volT=rr(5,8);
 const a=alexD();if(a){a.hpMax=ab('TOUGH HIDE')?130:100;a.hp=a.hpMax;a.inv=0;a.dodge=0;a.dizzy=0;a.score=0;a.combo=0;a.comboT=0;a.chain=0;a.mega=ab('MEGA CHARGE')?.5:0;a.fuel=1;a.x=ms.sea?W*.62:W*.5;a.y=H*.8;a.z=0;a.vz=0;a.vx=0;a.vy=0;a.megaing=false}
 genTown(true);genPuddles();if(ms.sea)puddles=puddles.filter(p=>p.x>W*.34);ms.base=B.length;
 for(let i=0;i<12;i++)if(!needSpawn())break;
 if(def.type==='boss')spawnBoss(def.boss);
 save.cur=L;persist();S.horn();setEngine(0)}
function needSpawn(){const d=ms.def,alive=B.filter(b=>b.alive),cnt=t=>alive.filter(b=>b.type===t).length;
 const need=d.type==='tanks'?['tank',Math.min(d.goal-ms.n,2+Math.floor(ms.L/4))]:d.type==='tower'?['tower',d.goal-ms.n]:d.type==='turrets'?['turret',Math.min(d.goal-ms.n,2+Math.floor(ms.L/5))]:null;
 if(need&&cnt(need[0])<need[1]){spawnB(need[0]);return true}return false}
function spawnB(type){const cell=U*Math.max(11,17-Math.min(ms.L,10)*.6),a=alexD(),x0=ms.sea?W*.36:U*8;
 for(let i=0;i<30;i++){const x=rr(x0,W-U*8),y=rr(groundTop()+U*12,H-U*5);if(a&&Math.hypot(a.x-x,a.y-y)<U*16)continue;if(B.some(b=>b.alive&&Math.abs(b.x-x)<cell*.8&&Math.abs(b.y-y)<cell*.6))continue;
  B.push(mkB(type,x,y,cell,'city',lvl(),.05));B.sort((p,q)=>p.y-q.y);return true}return false}
function regrow(dt){ms.spawnT-=dt;if(ms.spawnT>0)return;ms.spawnT=Math.max(.45,1.3-ms.L*.03);if(needSpawn())return;if(B.filter(b=>b.alive).length<ms.base*.75)spawnB(pick(cityA()))}
function misCount(b){if(!ms||ms.phase!=='go')return;const t=ms.def.type;
 if(t==='smash'||(t==='tanks'&&b.type==='tank')||(t==='tower'&&b.type==='tower')||(t==='turrets'&&b.type==='turret')){ms.n++;if(t!=='smash')texts.push({x:b.x,y:b.y-b.h-U*10,s:ms.n+' / '+ms.def.goal,t:0,col:'#8ce99a',sz:U*6})}
 if(ms.n>=ms.def.goal)clearLevel()}
function clearLevel(){if(!ms||ms.phase!=='go')return;const a=alexD(),L=ms.L,tl=ms.t/ms.def.time,hpf=a.hp/a.hpMax,st=1+(tl>=.3?1:0)+(hpf>=.6?1:0);
 const bonus=Math.round(ms.t)*10;a.score+=bonus;ms.stars=st;ms.bonus=bonus;const prev=save.best;
 save.st[L]=Math.max(save.st[L]||0,st);ms.newBest=a.score>(save.lb[L]||0);save.lb[L]=Math.max(save.lb[L]||0,a.score);if(a.score>save.hi)save.hi=a.score;save.best=Math.max(save.best,L+1);save.cur=L+1;
 ms.unl=[];SKINS.forEach((q,i)=>{if(q.at>prev&&q.at<=save.best){ms.unl.push('NEW SKIN: '+q.n+'!');save.skin=i}});for(const q of ABIL)if(q.at>prev&&q.at<=save.best)ms.unl.push('NEW POWER: '+q.n+'!');
 endCombo(a);persist();ms.phase='clear';ms.pt=3.4;shots=[];strafes=[];for(const h of heli)explode(h.x,h.y,U*8,true);heli=[];
 S.win();flash=.3;for(let i=0;i<10;i++)rockets.push({x:rr(.1,.9)*W,y:H,vy:-U*rr(120,170),ty:rr(.08,.35)*H,cols:HOT})}
function failLevel(why){if(!ms||ms.phase!=='go')return;ms.phase='fail';ms.why=why;shots=[];strafes=[];const a=alexD();if(a){a.fly=false;endCombo(a)}setEngine(0);S.lose();persist()}
function failBtns(){const s=Math.min(U,W/120);return{retry:{x:W/2,y:H*.6,w:s*46,h:s*15},easy:{x:W/2-s*34,y:H*.6+s*20,w:s*26,h:s*10},skin:{x:W/2+s*34,y:H*.6+s*20,w:s*26,h:s*10}}}
function inB(b,x,y){return Math.abs(x-b.x)<b.w/2&&Math.abs(y-b.y)<b.h/2}
const skinsOpen=()=>SKINS.filter(q=>q.at<=save.best);
function failTap(x,y){const f=failBtns();if(inB(f.retry,x,y)){S.boing();startLevel(ms.L)}else if(ms.L>1&&inB(f.easy,x,y)){S.boing();startLevel(ms.L-1)}
 else if(skinsOpen().length>1&&inB(f.skin,x,y)){const op=skinsOpen().map(q=>SKINS.indexOf(q)),i=op.indexOf(save.skin);save.skin=op[(i+1)%op.length];persist();S.sparkle()}}
function hitDino(a,dmg,x,y){if(mode==='zoe'||!a)return false;if(mode==='alex'&&(!ms||ms.phase!=='go'))return false;
 if(a.dizzy>0||a.inv>0)return false;if(a.dodge>0){if(ok('dg',400)){texts.push({x:a.x,y:a.y-a.z-a.sz*1.3,s:'DODGE!',t:0,col:'#74c0fc',sz:U*5});a.score+=25}return false}
 a.hp-=dmg;a.inv=1.1;hurtT=.45;shake=Math.max(shake,14);S.ouch();const k=Math.sign(a.x-x)||1;a.vx+=k*U*60;
 texts.push({x:a.x,y:a.y-a.z-a.sz*1.2,s:'-'+Math.round(dmg),t:0,col:'#ff6b6b',sz:U*5});
 if(a.hp<=0){a.hp=0;if(mode==='alex')failLevel('KNOCKED OUT!');else{a.dizzy=2.2;texts.push({x:a.x,y:a.y-a.sz*1.5,s:'DIZZY!',t:0,col:'#ffe066',sz:U*6})}}return true}
function fireShell(sx,sy,tx,ty,dur,dmg){shots.push({k:'s',sx,sy,tx:clamp(tx,U*3,W-U*3),ty:clamp(ty,groundTop()+U*4,H-U*3),t:0,dur,dmg,r:U*8});parts.push({x:sx,y:sy,vx:0,vy:0,life:.15,max:.15,col:'#fff3bf',size:U*2.5,shape:'flash',gr:0});S.shoot()}
function fireBullet(sx,sy,a,spd,dmg,spr){const an=Math.atan2(a.y-a.z-a.sz*.5-sy,a.x-sx)+(spr||0);shots.push({k:'b',x:sx,y:sy,vx:Math.cos(an)*spd,vy:Math.sin(an)*spd,life:6,dmg});S.pew()}
function heliHurt(h,n){if(h.dead)return;h.hp-=n;h.hitT=.15;if(h.hp<=0){h.dead=1;explode(h.x,h.y,U*9,true);S.boom(1);shake=Math.max(shake,14);
 for(let i=0;i<8;i++)chunks.push({x:h.x+rr(-1,1)*U*3,y:clamp(h.y+U*30,groundTop()+U*4,H-U*3),z:U*30,vx:rr(-1,1)*U*30,vy:0,vz:U*rr(0,30),s:U*rr(1.2,2.5),col:pick(['#5c6b3a','#333','#888']),rot:0,vr:rr(-8,8),life:2.5});
 const a=alexD();if(a){a.score+=50;a.mega=Math.min(1,a.mega+.1);texts.push({x:h.x,y:h.y-U*6,s:'+50 🚁',t:0,col:'#ffd43b',sz:U*5})}}}
function spawnBoss(k){const hp=Math.round(40+ms.L*6);boss={k,hp,max:hp,x:k==='ship'?W*.15:W*.5,y:k==='mech'?H*.5:k==='ship'?H*.7:HZ*.75,tx:W*.5,ty:HZ*.75,ft:3,ft2:1.5,st:6,t:0,hitT:0,face:-1,slam:0}}
function bossHurt(n){if(!boss||boss.dead||!ms||ms.phase!=='go')return;boss.hp-=n;boss.hitT=.15;S.thud();const a=alexD();if(a)a.score+=Math.round(n*5);
 texts.push({x:boss.x+rr(-1,1)*U*5,y:boss.y-U*(boss.k==='heli'?8:30),s:'-'+Math.round(n),t:0,col:'#ffd43b',sz:U*4.5});
 if(boss.hp<=0){const b=boss;b.dead=1;for(let i=0;i<8;i++)pending.push({t:i*.15,x:b.x+rr(-1,1)*U*12,y:(b.k==='heli'?clamp(b.y+U*25,groundTop()+U*4,H-U*3):b.y)+rr(-1,1)*U*5,r:U*14,by:'alex'});
  texts.push({x:W/2,y:H*.35,s:'BOSS DOWN!',t:0,col:'#ff922b',sz:U*11,big:1});shake=40;flash=.5;S.boom(1.4);boss=null;ms.n=1;clearLevel()}}
function updBoss(dt,a,mul){const b=boss;if(!b)return;b.t+=dt;b.hitT=Math.max(0,b.hitT-dt);b.slam-=dt;const L=ms.L;b.ft-=dt;b.ft2-=dt;
 if(b.k==='mech'){const dx=a.x-b.x;b.face=dx>0?1:-1;if(Math.abs(dx)>U*12)b.x+=Math.sign(dx)*U*(6+Math.min(L,40)*.1)*dt;b.y=clamp(b.y+clamp(a.y-b.y,-1,1)*U*4*dt,groundTop()+U*10,H-U*6);
  if(b.ft<=0){b.ft=Math.max(2,4-L*.04);for(let i=0;i<3;i++)fireShell(b.x+b.face*U*12,b.y-U*25,a.x+rr(-1,1)*U*10,a.y+rr(-1,1)*U*6,1.6+i*.25,13*mul)}
  b.st-=dt;if(b.st<=0){b.st=Math.max(4,7-L*.05);shots.push({k:'w',x:b.x,y:b.y,r:U*4,max:U*65,dmg:12*mul});shake=Math.max(shake,20);S.stomp(true)}
  if(a.z<U*3&&Math.hypot(a.x-b.x,(a.y-b.y)*1.6)<U*9)hitDino(a,10*mul,b.x,b.y)}
 else if(b.k==='ship'){b.y=clamp(H*.7+Math.sin(b.t*.6)*(H-groundTop())*.25,groundTop()+U*12,H-U*8);
  if(b.ft<=0){b.ft=Math.max(2,3.6-L*.03);for(let i=0;i<4;i++)fireShell(b.x+U*8,b.y-U*12,a.x+rr(-1,1)*U*14,a.y+rr(-1,1)*U*8,1.5+i*.3,12*mul)}
  if(b.ft2<=0){b.ft2=Math.max(1,2-L*.02);fireBullet(b.x+U*10,b.y-U*10,a,U*(34+Math.min(L,30)),7*mul)}
  if(a.z<U*6&&Math.abs(a.x-b.x)<U*16&&Math.abs(a.y-b.y)<U*8&&Math.hypot(a.vx,a.vy)>U*25){bossHurt(dt*12)}}
 else{if(Math.hypot(b.tx-b.x,b.ty-b.y)<U*4||R()<dt*.3){b.tx=rr(W*.15,W*.85);b.ty=rr(HZ*.45,HZ+U*18)}const dx=b.tx-b.x,dy=b.ty-b.y,l=Math.hypot(dx,dy)||1,sp=U*(16+Math.min(L,40)*.2);b.x+=dx/l*Math.min(l,sp*dt);b.y+=dy/l*Math.min(l,sp*dt);b.face=a.x>b.x?1:-1;
  if(b.ft<=0){b.ft=Math.max(1.8,3-L*.03);for(let i=-2;i<=2;i++)fireBullet(b.x+b.face*U*8,b.y+U*4,a,U*(30+Math.min(L,30)),8*mul,i*.22)}
  if(b.ft2<=0){b.ft2=Math.max(3,6-L*.05);fireShell(b.x,b.y+U*6,a.x,a.y,1.4,12*mul)}
  if(b.slam<=0&&Math.hypot(a.x-b.x,a.y-a.z-a.sz*.55-b.y)<U*18&&a.z>U*6){b.slam=.5;bossHurt(6);a.vx+=Math.sign(a.x-b.x||1)*U*80;a.vz=Math.max(a.vz,U*40);shake=Math.max(shake,12);S.boom(.6)}}}
function ringHits(r){for(const h of heli)if(!h.dead&&!r.hit.has(h)&&Math.hypot(h.x-r.x,h.y-r.hy)<r.r){r.hit.add(h);heliHurt(h,r.dmg)}
 if(boss&&!r.hit.has(boss)){const hy=boss.k==='heli'?r.hy:r.y,fy=boss.k==='heli'?1:1.6;if(Math.hypot(boss.x-r.x,(boss.y-hy)*fy)<r.r+U*8){r.hit.add(boss);bossHurt(r.dmg*2.5)}}}
function upEnemies(dt){const a=alexD();if(!a)return;const am=mode==='alex',L=am?ms.L:2,mul=dmul();
 for(const b of B)if(b.alive&&b.pop>=1&&(b.type==='tank'||b.type==='turret')&&themeAt(b.x)==='city'){b.ft-=dt;if(b.ft<=0){
  if(b.type==='tank'){b.ft=(am?Math.max(2.4,6.5-L*.18):9)+rr(0,2.5);b.face=a.x>b.x?1:-1;fireShell(b.x+b.face*b.w*.5,b.y-b.h*.9,a.x+a.vx*.4,a.y+a.vy*.4,am?1.7:2.3,am?12*mul:9)}
  else{b.ft=Math.max(1.3,3.6-L*.1)+rr(0,1);fireBullet(b.x,b.y-b.h*.7,a,U*(30+Math.min(L,25)),7*mul)}}}
 if(am){const mx=L>=2?Math.min(6,1+Math.floor((L-2)/3)):0,cap=ms.def.type==='boss'?Math.floor(mx/2):mx;heliT-=dt;
  if(heliT<=0&&heli.filter(h=>!h.dead).length<cap){heliT=Math.max(3,8-L*.15);const l=R()<.5;heli.push({x:l?-U*10:W+U*10,y:rr(HZ*.5,HZ+U*15),tx:rr(W*.2,W*.8),ty:rr(HZ*.5,HZ+U*18),hp:1+Math.floor(L/10),ft:rr(2,3.5),hitT:0,face:l?1:-1})}
  for(const h of heli){if(h.dead)continue;h.hitT=Math.max(0,h.hitT-dt);if(Math.hypot(h.tx-h.x,h.ty-h.y)<U*3){h.tx=rr(W*.1,W*.9);h.ty=rr(HZ*.45,HZ+U*20)}const dx=h.tx-h.x,dy=h.ty-h.y,l=Math.hypot(dx,dy)||1;h.x+=dx/l*Math.min(l,U*22*dt);h.y+=dy/l*Math.min(l,U*22*dt);h.face=a.x>h.x?1:-1;
   h.ft-=dt;if(h.ft<=0&&h.x>0&&h.x<W){h.ft=Math.max(1.6,3.2-L*.06)+rr(0,1);fireBullet(h.x+h.face*U*4,h.y+U*2,a,U*(28+Math.min(L,25)),6*mul)}
   if(Math.hypot(a.x-h.x,a.y-a.z-a.sz*.55-h.y)<U*9&&(a.fly||a.z>U*6)){heliHurt(h,99);a.vz=Math.max(a.vz,U*30)}}
  heli=heli.filter(h=>!h.dead);
  if(L>=3){strafeT-=dt;if(strafeT<=0){strafeT=Math.max(5,13-L*.3)+rr(0,3);const dir=R()<.5?1:-1;strafes.push({y:clamp(a.y,groundTop()+U*8,H-U*6),warn:1.4,x:dir>0?-U*20:W+U*20,dir,hd:0});S.alarm()}}
  for(const s of strafes){if(s.warn>0){s.warn-=dt;if(s.warn<=0)S.flyby();continue}s.x+=s.dir*U*130*dt;
   if(R()<dt*14){const ex=s.x-s.dir*U*5;parts.push({x:ex,y:s.y,vx:0,vy:0,life:.2,max:.2,col:'#fff3bf',size:U*4,shape:'flash',gr:0});for(let i=0;i<4;i++)parts.push({x:ex,y:s.y,vx:rr(-1,1)*U*30,vy:-rr(10,40)*U,life:.5,max:.5,col:pick(HOT),size:U*1.2,shape:'dot',gr:U*80});S.thud();for(const b of B)if(b.alive&&b.pop>=1&&Math.abs(b.x-ex)<U*5&&Math.abs(b.y-s.y)<U*7)hurt(b,1,'jet')}
   if(!s.hd&&Math.abs(a.x-s.x)<U*7&&Math.abs(a.y-s.y)<U*6&&a.z<U*22){s.hd=1;hitDino(a,14*mul,s.x,s.y)}
   if(s.x<-U*30||s.x>W+U*30)s.done=1}strafes=strafes.filter(s=>!s.done);
  if(boss)updBoss(dt,a,mul)}
 for(const s of shots){if(s.k==='s'){s.t+=dt;if(s.t>=s.dur){s.done=1;explode(s.tx,s.ty-U*2,U*6,false);S.boom(.45);shake=Math.max(shake,6);if(Math.hypot(a.x-s.tx,(a.y-s.ty)*1.6)<s.r&&a.z<U*12)hitDino(a,s.dmg,s.tx,s.ty)}}
  else if(s.k==='b'){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life<=0||s.x<-U*5||s.x>W+U*5||s.y<-U*5||s.y>H+U*5)s.done=1;else if(Math.hypot(a.x-s.x,a.y-a.z-a.sz*.5-s.y)<a.sz*.32){s.done=1;hitDino(a,s.dmg,s.x,s.y)}}
  else{s.r+=U*55*dt;if(s.r>s.max)s.done=1;if(!s.hd&&a.z<U*5&&Math.abs(Math.hypot(a.x-s.x,(a.y-s.y)*2)-s.r)<U*3){s.hd=1;hitDino(a,s.dmg,s.x,s.y)}}}
 shots=shots.filter(s=>!s.done)}
function updMission(dt,frozen){if(!ms||frozen)return;
 if(ms.phase==='intro'){ms.pt-=dt;if(ms.pt<=0){ms.phase='go';S.horn();texts.push({x:W/2,y:H*.4,s:'GO!',t:0,col:'#8ce99a',sz:U*14,big:1})}}
 else if(ms.phase==='go'){ms.t-=dt;upEnemies(dt);if(ms.phase==='go')regrow(dt);if(ms.phase==='go'&&ms.t<=0){ms.t=0;failLevel('TIME UP!')}}
 else if(ms.phase==='clear'){ms.pt-=dt;if(ms.pt<=0&&!wave)startWave(false)}}
// ---- drawing ----
function drawUnder(){if(mode==='alex'&&ms&&ms.sea){const x1=W*.3,top=groundTop()-U*2;const gr=g.createLinearGradient(0,top,0,H);gr.addColorStop(0,'#1c7ed6');gr.addColorStop(1,'#0b3d6e');g.fillStyle=gr;g.beginPath();g.moveTo(0,top);g.lineTo(x1,top);for(let y=top;y<=H;y+=U*4)g.lineTo(x1+Math.sin(y*.05+T*3)*U*3,y);g.lineTo(0,H);g.closePath();g.fill();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=U*.6;for(let i=0;i<6;i++){const y=top+(i+.5)*(H-top)/6,o=(T*20+i*37)%(x1);g.beginPath();g.moveTo(o,y);g.quadraticCurveTo(o+U*3,y-U*2,o+U*6,y);g.stroke()}
  if(boss&&boss.k==='ship')drawShip(boss)}
 for(const s of strafes){g.globalAlpha=s.warn>0?.25+.2*Math.sin(T*20):.15;g.fillStyle='#ff2020';g.fillRect(0,s.y-U*6,W,U*12);g.globalAlpha=1;if(s.warn>0)txt('⚠️',s.dir>0?U*6:W-U*6,s.y,U*6,'#fff')}
 for(const s of shots)if(s.k==='s'){const p=s.t/s.dur;g.globalAlpha=.35+.5*p;g.strokeStyle='#ff3b3b';g.lineWidth=U*.7;g.beginPath();g.ellipse(s.tx,s.ty,s.r,s.r*.55,0,0,6.3);g.stroke();g.fillStyle='rgba(255,40,40,.25)';g.beginPath();g.ellipse(s.tx,s.ty,s.r*p,s.r*.55*p,0,0,6.3);g.fill();g.globalAlpha=1}
 if(mode==='alex')for(const l of lava){g.globalAlpha=.4;g.strokeStyle='#ff922b';g.lineWidth=U*.6;g.beginPath();g.ellipse(l.tx,l.ty,U*7,U*3.8,0,0,6.3);g.stroke();g.globalAlpha=1}}
function drawOver(){for(const s of shots){if(s.k==='s'){const p=Math.min(1,s.t/s.dur),x=s.sx+(s.tx-s.sx)*p,y=s.sy+(s.ty-s.sy)*p-Math.sin(p*Math.PI)*H*.25;circ(x,y,U*1.7,'#212529');circ(x-U*.4,y-U*.4,U*.6,'#ff922b')}
  else if(s.k==='b'){g.globalAlpha=.5;circ(s.x-s.vx*.03,s.y-s.vy*.03,U*.9,'#ffd43b');g.globalAlpha=1;circ(s.x,s.y,U*1.1,'#ff6b6b');circ(s.x,s.y,U*.5,'#fff')}
  else{g.globalAlpha=Math.max(0,1-s.r/s.max);g.strokeStyle='#ff6b6b';g.lineWidth=U*1.6;g.beginPath();g.ellipse(s.x,s.y,s.r,s.r*.5,0,0,6.3);g.stroke();g.globalAlpha=1}}
 for(const s of strafes)if(s.warn<=0)drawJet({x:s.x,y:s.y-U*18,vx:s.dir});
 for(const h of heli){g.globalAlpha=.2;ell(h.x,clamp(h.y+U*30,groundTop()+U*4,H),U*5,U*1.5,'#000');g.globalAlpha=1;drawHeli(h.x,h.y,U*5,h.face,h.hitT>0?'#fff':'#5c6b3a')}
 if(boss&&boss.k==='heli')drawHeli(boss.x+(boss.hitT>0?rr(-1,1)*U:0),boss.y,U*13,boss.face,boss.hitT>0?'#fff':'#343a40')}
function drawHeli(x,y,s,f,col){g.save();g.translate(x,y);g.scale(f,1);g.lineWidth=Math.max(1,s*.06);g.strokeStyle='#1e2227';
 g.fillStyle=col;g.fillRect(-s*1.4,-s*.12,s*1.0,s*.2);g.strokeRect(-s*1.4,-s*.12,s*1.0,s*.2);poly([-s*1.45,-s*.1,-s*1.6,-s*.5,-s*1.32,-s*.1],col,1);
 ell(0,0,s*.6,s*.38,col,1);ell(s*.28,-s*.06,s*.24,s*.18,'#74c0fc',1);g.beginPath();g.moveTo(-s*.45,s*.52);g.lineTo(s*.45,s*.52);g.moveTo(-s*.25,s*.36);g.lineTo(-s*.25,s*.52);g.moveTo(s*.25,s*.36);g.lineTo(s*.25,s*.52);g.stroke();
 g.fillStyle='#222';g.fillRect(-s*.05,-s*.52,s*.1,s*.16);const rw=s*1.3*Math.abs(Math.cos(T*30));g.fillRect(-rw,-s*.56,rw*2,s*.07);g.restore()}
function drawMech(b){const s=U*30,st=Math.sin(b.t*4)*s*.05;g.save();g.translate(b.x+(b.hitT>0?rr(-1,1)*U:0),b.y);g.globalAlpha=.3;ell(0,0,s*.45,s*.1,'#000');g.globalAlpha=1;g.scale(b.face,1);g.lineWidth=U*.5;g.strokeStyle='#111';
 box(-s*.28,-s*.45+st,s*.16,s*.45-st,'#495057');box(s*.12,-s*.45-st,s*.16,s*.45+st,'#495057');box(-s*.34,-s*.06,s*.28,s*.06,'#343a40');box(s*.06,-s*.06,s*.28,s*.06,'#343a40');
 const c=b.hitT>0?'#fff':'#868e96';box(-s*.4,-s*.88,s*.8,s*.46,c,U);box(-s*.2,-s*1.08,s*.4,s*.22,'#adb5bd',U);box(-s*.1,-s*1.03,s*.3,s*.1,'#ff3b3b',U*.5);
 box(s*.36,-s*.82,s*.38,s*.12,'#343a40');box(-s*.62,-s*.82,s*.24,s*.26,'#e03131');g.fillStyle='#ffd43b';starP(0,-s*.64,s*.08);g.fill();g.restore()}
function drawShip(b){const s=U*30,y=b.y+Math.sin(b.t*2)*U;g.save();g.translate(b.x+(b.hitT>0?rr(-1,1)*U:0),y);g.lineWidth=U*.5;g.strokeStyle='#111';const c=b.hitT>0?'#fff':'#5c636a';
 poly([-s*.5,-s*.15,s*.5,-s*.15,s*.4,s*.06,-s*.4,s*.06],c,1);box(-s*.22,-s*.36,s*.3,s*.21,'#868e96');box(-s*.1,-s*.56,s*.1,s*.2,'#495057');
 for(const tx of[-s*.36,s*.24]){circ(tx,-s*.2,s*.06,'#343a40',1);box(tx,-s*.23,s*.16,s*.04,'#212529')}if(R()<.3)smoke.push({x:b.x-s*.05,y:y-s*.58,r:U*2,vx:U*2,vy:-U*6,life:1.5,max:1.5,col:'#555'});g.restore()}
function hpBar(a,x,y,w){const h=U*3.4,f=Math.max(0,a.hp/a.hpMax);g.lineWidth=U*.5;g.strokeStyle='#222';box(x,y,w,h,'rgba(0,0,0,.45)',h/2);
 if(f>0){g.fillStyle=f>.6?'#51cf66':f>.3?'#ffd43b':(Math.sin(T*10)>0?'#ff6b6b':'#c92a2a');g.beginPath();rrect(x,y,w*f,h,h/2);g.fill()}txt(a.dizzy>0?'💫 DIZZY':'❤️',x+(a.dizzy>0?w/2:U*2.5),y+h/2,U*2.6,'#fff')}
function star5(x,y,r,on){g.beginPath();for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,rd=i%2?r*.45:r;g.lineTo(x+Math.cos(an)*rd,y+Math.sin(an)*rd)}g.closePath();g.fillStyle=on?'#ffd43b':'rgba(255,255,255,.25)';g.fill();g.lineWidth=U*.5;g.strokeStyle='#7a4a00';g.stroke()}
function panel(cx,cy,w,h){g.lineWidth=U*.7;g.strokeStyle='#fff';box(cx-w/2,cy-h/2,w,h,'rgba(20,24,40,.82)',U*4)}
function drawMission(){const d=ms.def,s=Math.min(U,W/120),pw=s*50,px=W/2-pw/2,py=s*2;
 panel(W/2,py+s*6,pw,s*12);txt('LVL '+ms.L,px+s*7,py+s*3.8,s*3.2,'#ffe066');
 txt('⏱ '+Math.ceil(ms.t),px+pw-s*8,py+s*3.8,s*3.6,ms.t<10&&ms.phase==='go'&&Math.sin(T*10)>0?'#ff6b6b':'#fff');
 const prog=d.type==='boss'?(boss?boss.hp/boss.max:0):Math.min(1,ms.n/d.goal);txt(d.type==='boss'?'BOSS':d.lab+' '+ms.n+'/'+d.goal,W/2,py+s*3.8,s*3.6,'#fff');
 g.lineWidth=s*.4;g.strokeStyle='#000';box(px+s*3,py+s*7.6,pw-s*6,s*2.8,'rgba(0,0,0,.5)',s*1.4);if(prog>0){g.fillStyle=d.type==='boss'?'#ff6b6b':'#8ce99a';g.beginPath();rrect(px+s*3,py+s*7.6,(pw-s*6)*prog,s*2.8,s*1.4);g.fill()}
 const cy=H*.42;
 if(ms.phase==='intro'){panel(W/2,cy,s*80,s*38);txt(d.type==='boss'?'⚠️ BOSS LEVEL '+ms.L+' ⚠️':'LEVEL '+ms.L,W/2,cy-s*11,s*8,d.type==='boss'?'#ff6b6b':'#ffe066');txt(d.txt,W/2,cy,s*5.4,'#fff');txt('⏱ '+d.time+' SECONDS',W/2,cy+s*8,s*3.6,'#a5d8ff');
  const got=save.st[ms.L]||0;for(let i=0;i<3;i++)star5(W/2+(i-1)*s*7,cy+s*14,s*2.6,i<got)}
 else if(ms.phase==='clear'&&!(wave&&!wave.warn)){panel(W/2,cy,s*80,s*44+ms.unl.length*s*5);txt('LEVEL '+ms.L+' CLEAR!',W/2,cy-s*14,s*8,'#8ce99a');
  for(let i=0;i<3;i++){const sc=i<ms.stars?1+.08*Math.sin(T*8+i):1;star5(W/2+(i-1)*s*14,cy-s*2,s*5.5*sc,i<ms.stars)}
  const a=alexD();txt('⭐ '+(a?a.score:0)+(ms.newBest?'  NEW BEST!':'')+'   ⏱ +'+ms.bonus,W/2,cy+s*9,s*3.8,'#fff');ms.unl.forEach((u,i)=>txt(u,W/2,cy+s*15+i*s*5,s*4,'#ffd43b'))}
 else if(ms.phase==='fail'){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W,H);panel(W/2,H*.56,s*96,s*64);txt(ms.why,W/2,H*.6-s*26,s*8,'#ff922b');txt('LEVEL '+ms.L+' · '+d.txt,W/2,H*.6-s*17,s*3.6,'#fff');
  const f=failBtns();g.lineWidth=s*.8;g.strokeStyle='#fff';box(f.retry.x-f.retry.w/2,f.retry.y-f.retry.h/2,f.retry.w,f.retry.h,'#2f9e44',s*5);txt('↻ RETRY',f.retry.x,f.retry.y,s*6.5,'#fff');
  if(ms.L>1){box(f.easy.x-f.easy.w/2,f.easy.y-f.easy.h/2,f.easy.w,f.easy.h,'#495057',s*3);txt('◀ LEVEL '+(ms.L-1),f.easy.x,f.easy.y,s*3.4,'#fff')}
  if(skinsOpen().length>1){box(f.skin.x-f.skin.w/2,f.skin.y-f.skin.h/2,f.skin.w,f.skin.h,'#7048e8',s*3);txt('🎨 '+(SKINS[save.skin]||SKINS[0]).n,f.skin.x,f.skin.y,s*3.4,'#fff')}}}

// ---------- drawing helpers ----------
function rrect(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function box(x,y,w,h,f,r){g.fillStyle=f;g.beginPath();rrect(x,y,w,h,r||0);g.fill();g.stroke()}
function circ(x,y,r,f,st){g.fillStyle=f;g.beginPath();g.arc(x,y,Math.max(.1,r),0,6.2832);g.fill();if(st)g.stroke()}
function ell(x,y,rx,ry,f,st){g.fillStyle=f;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,6.2832);g.fill();if(st)g.stroke()}
function poly(pts,f,st){g.fillStyle=f;g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();g.fill();if(st)g.stroke()}
function heartP(x,y,s){g.beginPath();g.moveTo(x,y+s*.35);g.bezierCurveTo(x-s*1.1,y-s*.4,x-s*.4,y-s*1.1,x,y-s*.45);g.bezierCurveTo(x+s*.4,y-s*1.1,x+s*1.1,y-s*.4,x,y+s*.35);g.closePath()}
function starP(x,y,s){g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?s*.38:s;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath()}
function txt(s,x,y,sz,col,al){g.font='800 '+Math.round(sz)+'px '+FONT;g.textAlign=al||'center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=sz*.2;g.strokeStyle='rgba(40,20,60,.85)';g.strokeText(s,x,y);g.fillStyle=col;g.fillText(s,x,y)}
// ---------- backgrounds ----------
function bg(x0,x1,th){g.save();g.beginPath();g.rect(x0,0,x1-x0,H);g.clip();
 if(th==='candy'){let gr=g.createLinearGradient(0,0,0,HZ);gr.addColorStop(0,'#ffc2ec');gr.addColorStop(1,'#fff4c9');g.fillStyle=gr;g.fillRect(x0,0,x1-x0,HZ+2);
  const cx=(x0+x1)/2;g.lineWidth=U*2.2;RAINBOW.slice(0,6).forEach((c,i)=>{g.strokeStyle=c;g.globalAlpha=.6;g.beginPath();g.arc(cx,HZ+U*8,(x1-x0)*.42-i*U*2.2,Math.PI,0);g.stroke()});g.globalAlpha=1;
  for(let i=0;i<4;i++){const x=x0+((i*0.29+T*.01*(i+1))%1.2-.1)*(x1-x0),y=HZ*(.18+i*.15);g.fillStyle='#fff';for(const [a,b,r] of[[0,0,4],[4,1,3],[-4,1,3],[2,-2,3]]){g.beginPath();g.arc(x+a*U,y+b*U,r*U,0,6.3);g.fill()}}
  // castle on horizon
  g.lineWidth=U*.4;g.strokeStyle='#b86fb0';const kx=x0+(x1-x0)*.28,ky=HZ;box(kx-U*12,ky-U*12,U*24,U*12,'#ffd1f0');for(const t of[-12,-4,6]){box(kx+t*U,ky-U*20,U*6,U*20,'#ffb8e6');poly([kx+t*U-U,ky-U*20,kx+t*U+U*3,ky-U*28,kx+t*U+U*7,ky-U*20],'#c99bff',1)}
  g.fillStyle='#ff5c8a';heartP(kx,ky-U*6,U*2);g.fill();
  for(let i=0;i<6;i++){g.globalAlpha=.6+.4*Math.sin(T*3+i);g.fillStyle=i%2?'#fff':'#ff8fd0';heartP(x0+((i*.17+T*.02)%1)*(x1-x0),HZ*(.2+((i*.37)%1)*.6),U*1.4);g.fill()}g.globalAlpha=1;
  gr=g.createLinearGradient(0,HZ,0,H);gr.addColorStop(0,'#c3fae8');gr.addColorStop(1,'#ffd8f0');g.fillStyle=gr;g.fillRect(x0,HZ,x1-x0,H-HZ);
  for(let i=0;i<80;i++){const x=x0+((i*0.618)%1)*(x1-x0),y=HZ+U*4+((i*0.377)%1)*(H-HZ);g.fillStyle=RAINBOW[i%6];g.globalAlpha=.5;g.fillRect(x,y,U*1.2,U*.45);}g.globalAlpha=1;
 }else{let gr=g.createLinearGradient(0,0,0,HZ);gr.addColorStop(0,'#3c4a6b');gr.addColorStop(.7,'#c96f4a');gr.addColorStop(1,'#f2a65a');g.fillStyle=gr;g.fillRect(x0,0,x1-x0,HZ+2);
  // mountains + volcano
  g.lineWidth=U*.4;g.strokeStyle='#2a1d1a';poly([x0,HZ,x0+(x1-x0)*.2,HZ-H*.1,x0+(x1-x0)*.45,HZ],'#5b4a5e');const vx=volX(),vh=H*.17;
  poly([vx-H*.22,HZ,vx-U*5,HZ-vh,vx+U*5,HZ-vh,vx+H*.22,HZ],'#4a3428',1);poly([vx-U*5,HZ-vh,vx+U*5,HZ-vh,vx+U*3,HZ-vh+U*4,vx-U*1,HZ-vh+U*6,vx-U*4,HZ-vh+U*3],'#ff6b1a');
  g.strokeStyle='#ff8c1a';g.lineWidth=U*1.2;g.beginPath();g.moveTo(vx-U,HZ-vh+U*5);g.quadraticCurveTo(vx-U*6,HZ-vh*.5,vx-U*9,HZ-U*2);g.stroke();
  g.globalAlpha=.5+.3*Math.sin(T*5);circ(vx,HZ-vh,U*6,'#ffb347');g.globalAlpha=1;
  if(R()<.4)smoke.push({x:vx+rr(-2,2)*U,y:HZ-vh,r:U*2.5,vx:U*rr(1,4),vy:-U*rr(6,10),life:2.5,max:2.5,col:'#58504e'});
  // base skyline
  g.fillStyle='#3f4452';for(let i=0;i<14;i++){const x=x0+i/14*(x1-x0),h=U*(4+((i*7)%5)*2);g.fillRect(x,HZ-h,(x1-x0)/14-U,h)}
  g.fillStyle='#2e3340';g.fillRect(x0,HZ-U*1.2,x1-x0,U*1.2);
  gr=g.createLinearGradient(0,HZ,0,H);gr.addColorStop(0,'#7a7d82');gr.addColorStop(1,'#55585e');g.fillStyle=gr;g.fillRect(x0,HZ,x1-x0,H-HZ);
  g.strokeStyle='#ffd43b';g.lineWidth=U*.7;g.setLineDash([U*4,U*4]);for(const yy of[.55,.85]){const y=HZ+(H-HZ)*yy;g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke()}g.setLineDash([]);
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=U*.5;const hx=x0+(x1-x0)*.15,hy=HZ+(H-HZ)*.25;g.beginPath();g.ellipse(hx,hy,U*6,U*2.5,0,0,6.3);g.stroke();
 }
 g.restore()}
// ---------- buildings ----------
function drawB(b){const s=b.pop<0?0:b.pop<1?easeBack(b.pop):1;if(s<=0)return;if(b.gold){g.save();g.globalAlpha=.35+.2*Math.sin(T*6);circ(b.x,b.y-b.h*.6*s,b.w*.95*s,'#fff3a0');g.restore()}const w=b.w,h=b.h,d=b.d,c=b.col,candy=b.th==='candy';
 g.save();g.translate(b.x+(b.shake>0?Math.sin(T*70)*U*.7:0),b.y);g.scale(s,s);g.lineWidth=U*.45;g.strokeStyle=candy?'#7a3b6f':'#1e2227';g.lineJoin='round';
 g.fillStyle='rgba(0,0,0,.15)';g.beginPath();g.ellipse(0,0,w*.6,d*.4,0,0,6.3);g.fill();
 switch(b.type){
 case'castle':{box(-w*.3,-h*.75,w*.6,h*.75,c[0]);for(let i=0;i<4;i++)box(-w*.3+i*w*.16,-h*.82,w*.1,h*.08,c[0]);for(const sx of[-1,1]){box(sx*w*.35-w*.12,-h,w*.24,h,'#ffc8e8');poly([sx*w*.35-w*.16,-h,sx*w*.35,-h*1.3,sx*w*.35+w*.16,-h],c[1],1)}
  g.beginPath();g.moveTo(w*.35,-h*1.3);g.lineTo(w*.35,-h*1.45);g.stroke();poly([w*.35,-h*1.45,w*.48,-h*1.4,w*.35,-h*1.35],'#ff5c8a');box(-w*.1,-h*.3,w*.2,h*.3,'#d6336c',w*.1);g.fillStyle='#ff5c8a';heartP(0,-h*.55,w*.08);g.fill();g.stroke();break}
 case'cupcake':{box(-w/2,-h*.6,w,h*.6,c[0],U);for(let i=0;i<5;i++){g.fillStyle=i%2?'#fff':c[1];g.fillRect(-w/2+i*w/5,-h*.6,w/5,h*.12)}g.strokeRect(-w/2,-h*.6,w,h*.12);box(-w*.12,-h*.35,w*.24,h*.35,'#c2255c',U);
  poly([-w*.3,-h*.6,w*.3,-h*.6,w*.22,-h*.85,-w*.22,-h*.85],'#f4a3c8',1);for(const [a,r] of[[-.18,.16],[.18,.16],[0,.2]]){circ(w*a,-h*.92,w*r,'#ffd1e8',1)}circ(0,-h*1.15,w*.07,c[2],1);break}
 case'house':{box(-w/2,-h*.6,w,h*.6,c[0]);poly([-w*.6,-h*.6,0,-h*1.05,w*.6,-h*.6],c[1],1);g.save();g.clip();g.restore();box(-w*.12,-h*.32,w*.24,h*.32,'#ffd43b',U*.6);g.fillStyle='#ff5c8a';heartP(w*.28,-h*.4,w*.08);g.fill();g.stroke();heartP(-w*.28,-h*.4,w*.08);g.fill();g.stroke();break}
 case'icecream':{box(-w/2,-h*.5,w,h*.5,c[0],U);box(-w*.15,-h*.3,w*.3,h*.3,'#9775fa',U);poly([-w*.3,-h*.5,w*.3,-h*.5,0,-h*.35],'#e8b36b',1);circ(0,-h*.65,w*.32,c[1],1);circ(0,-h*.88,w*.26,'#ffafcc',1);circ(0,-h*1.05,w*.08,'#ff4d6d',1);break}
 case'block':{box(-w/2,-h,w,h,c[0]);poly([-w/2,-h,w/2,-h,w/2-d*.3,-h-d*.4,-w/2+d*.3,-h-d*.4],c[1],1);const rows=Math.max(2,Math.floor(h/(U*3.4)));g.lineWidth=U*.25;
  for(let r=0;r<rows;r++)for(let k=0;k<3;k++){const lit=((b.seed*97+r*7+k*3)%1)>.4;g.fillStyle=lit?c[2]:'#3b4552';g.fillRect(-w*.38+k*w*.27,-h+U*1.4+r*(h-U*2)/rows,w*.2,(h-U*2)/rows*.55)}
  g.lineWidth=U*.45;g.beginPath();g.moveTo(w*.2,-h-d*.4);g.lineTo(w*.2,-h-d*.4-U*4);g.stroke();circ(w*.2,-h-d*.4-U*4,U*.8,Math.sin(T*6+b.seed*9)>0?'#ff3b3b':'#661010');break}
 case'hangar':{box(-w/2,-h*.55,w,h*.55,c[0]);g.fillStyle=c[1];g.beginPath();g.ellipse(0,-h*.55,w/2,h*.45,0,Math.PI,0);g.fill();g.stroke();box(-w*.25,-h*.45,w*.5,h*.45,'#2b2f22');g.fillStyle='#fff';starP(0,-h*.75,w*.08);g.fill();break}
 case'tank':{g.save();g.scale(b.face,1);box(-w/2,-h*.35,w,h*.35,'#333',h*.17);for(let i=0;i<5;i++)circ(-w*.38+i*w*.19,-h*.17,h*.1,'#777');box(-w*.42,-h*.7,w*.84,h*.38,c[0],U*.6);g.fillStyle=c[0];g.beginPath();g.ellipse(-w*.05,-h*.72,w*.22,h*.28,0,Math.PI,0);g.fill();g.stroke();box(w*.1,-h*.95,w*.5,h*.1,c[1]);g.fillStyle='#fff';starP(-w*.2,-h*.5,h*.12);g.fill();g.restore();break}
 case'fuel':{box(-w/2,-h,w,h,c[0],w*.2);g.fillStyle=c[1];g.fillRect(-w/2+U*.3,-h*.6,w-U*.6,h*.2);ell(0,-h,w/2,d*.35,'#dee2e6',1);g.fillStyle=c[2];poly([0,-h*.38,-w*.12,-h*.15,w*.12,-h*.15],'#ffd43b',1);break}
 case'bunker':{box(-w/2,-h*.7,w,h*.7,'#6b705c',U);poly([-w/2,-h*.7,w/2,-h*.7,w*.36,-h,-w*.36,-h],'#565a4a',1);box(-w*.3,-h*.5,w*.6,h*.12,'#1b1d17');break}
 case'turret':{box(-w*.4,-h*.5,w*.8,h*.5,'#495057',U*.5);const a=alexD();const an=a?Math.atan2((a.y-a.z-a.sz*.5)-(b.y-h*.7),a.x-b.x):0;g.save();g.translate(0,-h*.7);g.rotate(an);box(0,-h*.08,w*.65,h*.16,'#343a40');g.restore();circ(0,-h*.7,w*.3,'#868e96',1);circ(0,-h*.7,w*.11,b.ft<.6?'#ff3b3b':'#7a1010');break}
 case'tower':{g.lineWidth=U*.5;g.strokeStyle='#8a1c1c';g.beginPath();g.moveTo(-w/2,0);g.lineTo(-w*.08,-h);g.moveTo(w/2,0);g.lineTo(w*.08,-h);for(let i=0;i<8;i++){const y1=-h*i/8,y2=-h*(i+1)/8,x1=w/2-(w*.42)*i/8,x2=w/2-(w*.42)*(i+1)/8;g.moveTo(-x1,y1);g.lineTo(x2,y2);g.moveTo(x1,y1);g.lineTo(-x2,y2)}g.stroke();g.strokeStyle='#1e2227';circ(0,-h,w*.18,Math.sin(T*6)>0?'#ff3b3b':'#661010',1);ell(w*.2,-h*.75,w*.22,w*.12,'#dee2e6',1);break}
 case'truck':{g.save();g.scale(b.face,1);box(-w/2,-h,w*.65,h*.8,'#5c7a3a',U*.5);box(w*.17,-h*.75,w*.33,h*.55,c[0],U*.6);box(w*.28,-h*.68,w*.16,h*.22,'#9fd3ff');for(const x of[-w*.32,w*.0,w*.35])circ(x,-h*.15,h*.18,'#222',1);g.restore();break}}
 if(b.arm&&b.type!=='tower'){const top=b.type==='block'?-h:-h*.7;g.strokeStyle='#ced4da';g.lineWidth=U*.7;g.strokeRect(-w/2+U*.3,top+U*.3,w-U*.6,-top-U*.6);for(const xx of[-w/2+U,w/2-U])for(const yy of[top+U,-U])circ(xx,yy,U*.45,'#f1f3f5')}
 if(b.arm&&b.hp<b.max&&b.hp>0){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(-w*.4,-h-U*4,w*.8,U*1.4);g.fillStyle='#ffd43b';g.fillRect(-w*.4,-h-U*4,w*.8*b.hp/b.max,U*1.4)}
 if(b.hp<b.max){g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=U*.35;g.beginPath();g.moveTo(-w*.2,-h*.8);g.lineTo(0,-h*.6);g.lineTo(-w*.1,-h*.4);g.lineTo(w*.1,-h*.25);g.stroke()}
 g.restore()}
const easeBack=t=>{const c=1.9;t=t-1;return 1+(c+1)*t*t*t+c*t*t};
// ---------- characters ----------
function drawDino(kind,x,y,s,o){const uni=kind==='uni',sk=!uni&&o.skin,body=uni?'#f7b2ff':sk?sk.b:'#5cc94a',dark=uni?'#d79bff':sk?sk.d:'#2e8b3a',belly=uni?'#fff0fb':sk?sk.l:'#f4e27a';
 g.save();g.translate(x,y);g.scale(o.face||1,1);const sq=o.squash||0;g.scale(1+sq,1-sq);g.lineWidth=s*.035;g.strokeStyle=uni?'#7a3b8f':sk?sk.o:'#1f4d23';g.lineJoin='round';g.lineCap='round';
 const lw=Math.sin(o.walk||0)*s*.07,tw=Math.sin((o.t||0)*4)*s*.04;
 g.fillStyle=body;g.beginPath();g.moveTo(-s*.2,-s*.6);g.quadraticCurveTo(-s*.6,-s*.55,-s*.88,-s*.28+tw);g.quadraticCurveTo(-s*.5,-s*.3,-s*.15,-s*.28);g.closePath();g.fill();g.stroke();
 if(uni){for(let i=0;i<4;i++)circ(-s*.88-i*s*.03,-s*.28+tw+(i-1.5)*s*.05,s*.06,RAINBOW[i],0)}
 if(!uni){box(-s*.42,-s*.88,s*.2,s*.36,'#9aa3ad',s*.05);box(-s*.4,-s*.55,s*.07,s*.08,'#555');box(-s*.31,-s*.55,s*.07,s*.08,'#555');
  if(o.fly){for(const fx of[-s*.365,-s*.275]){poly([fx-s*.04,-s*.47,fx+s*.04,-s*.47,fx,-s*.47+s*(.22+R()*.15)],'#ff922b');poly([fx-s*.02,-s*.47,fx+s*.02,-s*.47,fx,-s*.47+s*.12],'#ffe066')}}}
 box(-s*.14+lw,-s*.32,s*.15,s*.32,dark,s*.05);
 ell(0,-s*.47,s*.34,s*.26,body,1);ell(s*.1,-s*.42,s*.17,s*.15,belly,0);
 if(!uni){g.fillStyle=dark;for(let i=0;i<3;i++){g.beginPath();g.ellipse(-s*.15+i*s*.11,-s*.66,s*.035,s*.07,0,0,6.3);g.fill()}}
 else{g.fillStyle='#fff';for(let i=0;i<5;i++){const a=(o.t||0)*2+i;starP(Math.cos(a)*s*.25,-s*.47+Math.sin(a*1.3)*s*.15,s*.03);g.fill()}}
 box(s*.06-lw,-s*.3,s*.15,s*.3,body,s*.05);
 // neck + head
 g.fillStyle=body;g.beginPath();g.moveTo(s*.1,-s*.65);g.quadraticCurveTo(s*.2,-s*.9,s*.3,-s*.88);g.lineTo(s*.32,-s*.6);g.closePath();g.fill();
 box(s*.12,-s*1.08,s*.48,s*.3,body,s*.12);
 if(!uni){box(s*.22,-s*.82,s*.38,s*.1,body,s*.05);g.fillStyle='#fff';for(let i=0;i<5;i++)poly([s*(.28+i*.06),-s*.82,s*(.31+i*.06),-s*.77,s*(.34+i*.06),-s*.82],'#fff');
  circ(s*.36,-s*.98,s*.065,'#fff',1);circ(s*.385,-s*.975,s*.032,'#111');g.beginPath();g.moveTo(s*.29,-s*1.07);g.lineTo(s*.44,-s*1.03);g.stroke();circ(s*.55,-s*1.0,s*.012,'#1f4d23');
  g.beginPath();g.moveTo(s*.24,-s*.56);g.lineTo(s*.34,-s*.5);g.stroke()}
 else{poly([s*.36,-s*1.06,s*.44,-s*1.36,s*.5,-s*1.06],'#ffd43b',1);g.strokeStyle='#e8a800';g.beginPath();g.moveTo(s*.39,-s*1.13);g.lineTo(s*.48,-s*1.17);g.moveTo(s*.41,-s*1.22);g.lineTo(s*.46,-s*1.25);g.stroke();g.strokeStyle='#7a3b8f';
  for(let i=0;i<6;i++)circ(s*(.16-i*.05),-s*(1.04-i*.08),s*.07,RAINBOW[i],0);
  circ(s*.38,-s*.96,s*.075,'#fff',1);circ(s*.4,-s*.955,s*.045,'#4a2a6a');circ(s*.41,-s*.97,s*.015,'#fff');g.beginPath();g.moveTo(s*.33,-s*1.03);g.lineTo(s*.3,-s*1.07);g.moveTo(s*.37,-s*1.04);g.lineTo(s*.36,-s*1.09);g.stroke();
  circ(s*.5,-s*.88,s*.04,'#ff8fab');g.beginPath();g.arc(s*.5,-s*.9,s*.06,.3,1.4);g.stroke();
  g.beginPath();g.moveTo(s*.24,-s*.56);g.lineTo(s*.34,-s*.5);g.stroke()}
 g.restore()}
function drawKitty(k){const s=U*5,y=k.y-k.z;g.save();g.translate(k.x,y);g.scale(k.t>4?k.f:1,1);g.lineWidth=U*.3;g.strokeStyle='#5a3d5c';
 ell(0,-s*.35,s*.42,s*.3,k.col,1);g.beginPath();g.moveTo(-s*.4,-s*.4);g.quadraticCurveTo(-s*.8,-s*.6,-s*.6,-s*1);g.stroke();
 circ(s*.3,-s*.75,s*.32,k.col,1);poly([s*.06,-s*.9,s*.12,-s*1.2,s*.26,-s*1.0],k.col,1);poly([s*.36,-s*1.0,s*.5,-s*1.2,s*.56,-s*.9],k.col,1);
 circ(s*.2,-s*.78,s*.05,'#222');circ(s*.42,-s*.78,s*.05,'#222');circ(s*.31,-s*.68,s*.04,'#ff8fab');
 g.beginPath();g.arc(s*.31,-s*.66,s*.08,.3,2.8);g.stroke();if(k.z>U*2){g.beginPath();g.moveTo(-s*.1,-s*.5);g.lineTo(-s*.3,-s*.9);g.moveTo(s*.1,-s*.5);g.lineTo(s*.0,-s*.95);g.stroke()}g.restore()}
function drawJet(j){const s=U*7,d=Math.sign(j.vx);g.save();g.translate(j.x,j.y);g.scale(d,1);g.lineWidth=U*.35;g.strokeStyle='#1e2227';
 poly([-s,0,s*.9,-s*.05,s*1.2,s*.05,s*.9,s*.15,-s,s*.15],'#9aa6b2',1);poly([-s*.2,s*.05,-s*.7,s*.6,-s*.45,s*.6,s*.25,s*.08],'#7b8794',1);poly([-s*.75,0,-s,-s*.45,-s*.82,-s*.45,-s*.5,0],'#7b8794',1);
 ell(s*.55,-s*.03,s*.25,s*.09,'#74c0fc',1);poly([-s,s*.02,-s*1.3-R()*s*.2,s*.08,-s,s*.13],'#ff922b');g.restore()}
// ---------- HUD ----------
function drawHUD(){const a=alexD(),z=zoeD();
 if(a){const x0=mode==='together'?W/2:0,bb=btns();
  const tx=mode==='together'?x0+U*4:U*14;txt('⭐ '+a.score,tx,U*6,U*5.5,'#fff','left');hpBar(a,tx,U*10.5,mode==='alex'?U*28:U*22);
  // mega meter
  const mw=U*26,mx=mode==='together'?W*.75-mw/2:U*14,my=mode==='together'?U*15:U*16;g.lineWidth=U*.5;g.strokeStyle='#222';box(mx,my,mw,U*4,'rgba(0,0,0,.4)',U*2);
  if(a.mega>0){g.fillStyle=a.mega>=1?(Math.sin(T*12)>0?'#ff6b6b':'#ffd43b'):'#ff922b';g.beginPath();rrect(mx,my,mw*a.mega,U*4,U*2);g.fill()}txt(a.mega>=1?'MEGA READY!':'MEGA',mx+mw/2,my+U*2,U*2.8,'#fff');
  if(a.combo>1)txt('COMBO x'+a.combo,mx+mw/2,my+U*7.5,U*4,'#ffe066');
  for(const k of['boost','roar','mega']){const b=bb[k],ready=k==='roar'?a.roarCd<=0:k==='mega'?a.mega>=1:a.fuel>.05;const held=[...ptrs.values()].some(p=>p.k===k);
   g.globalAlpha=ready?.9:.45;g.lineWidth=U*.6;g.strokeStyle='#fff';circ(b.x,b.y,b.r*(held?.92:1),k==='mega'?'#e03131':k==='roar'?'#e8590c':'#1971c2',1);
   if(k==='boost'){g.strokeStyle='#ffe066';g.lineWidth=U*1.2;g.beginPath();g.arc(b.x,b.y,b.r*.82,-Math.PI/2,-Math.PI/2+6.283*a.fuel);g.stroke()}
   if(k==='mega'&&ready){g.strokeStyle='#ffe066';g.lineWidth=U*(1+Math.sin(T*10)*.5);g.beginPath();g.arc(b.x,b.y,b.r*1.15,0,6.3);g.stroke()}
   g.font=Math.round(b.r*.9)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(b.ic,b.x,b.y);g.globalAlpha=1}
  for(const p of ptrs.values())if(p.k==='joy'){g.globalAlpha=.35;circ(p.ox,p.oy,U*11,'#fff');g.globalAlpha=.7;let dx=p.x-p.ox,dy=p.y-p.oy;const l=Math.hypot(dx,dy),m=U*11;if(l>m){dx*=m/l;dy*=m/l}circ(p.ox+dx,p.oy+dy,U*5,'#fff');g.globalAlpha=1}}
 if(z&&mode==='zoe'){zPop=Math.max(0,zPop-.06);txt('💖 '+z.score,W/2,U*6,U*6*(1+.45*zPop),'#ff5c8a');zBtnDraw()}
 if(mode==='together'){const mw=W*.4,mx=W/2-mw/2,my=U*3;g.lineWidth=U*.6;g.strokeStyle='#fff';box(mx,my,mw,U*6,'rgba(60,20,80,.5)',U*3);
  if(meter>0){const gr=g.createLinearGradient(mx,0,mx+mw,0);RAINBOW.slice(0,6).forEach((c,i)=>gr.addColorStop(i/5,c));g.fillStyle=gr;g.beginPath();rrect(mx,my,mw*meter,U*6,U*3);g.fill()}
  g.font=Math.round(U*6)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🦄',mx-U*4,my+U*3);g.fillText('🦖',mx+mw+U*4,my+U*3);txt('SMASH METER',W/2,my+U*3,U*3,'#fff');
  if(z)txt('💖 '+z.score,W*.25,U*14,U*5,'#ff5c8a');
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=U*.6;g.setLineDash([U*2,U*2]);g.beginPath();g.moveTo(W/2,my+U*8);g.lineTo(W/2,H);g.stroke();g.setLineDash([])}
 if(mode==='alex'&&ms)drawMission();
 if(hurtT>0){g.globalAlpha=hurtT;g.strokeStyle='#ff2020';g.lineWidth=U*4;g.strokeRect(0,0,W,H);g.globalAlpha=1}
 // menu button (hold)
 const mb=menuBtn(),mp=[...ptrs.values()].find(p=>p.k==='menu');g.globalAlpha=.55;g.lineWidth=U*.4;g.strokeStyle='#fff';circ(mb.x,mb.y,mb.r,'rgba(0,0,0,.35)',1);g.globalAlpha=1;
 g.fillStyle='#fff';for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)g.fillRect(mb.x+i*U*1.6-U*.6,mb.y+j*U*1.6-U*.6,U*1.2,U*1.2);
 if(mp){g.strokeStyle='#ffd54a';g.lineWidth=U*.9;g.beginPath();g.arc(mb.x,mb.y,mb.r,-Math.PI/2,-Math.PI/2+6.283*Math.min(1,(T-mp.t0)/.8));g.stroke()}}
function drawFX(){for(const s of smoke){g.globalAlpha=Math.max(0,s.life/s.max)*.7;circ(s.x,s.y,s.r,s.col)}g.globalAlpha=1;
 for(const p of parts){const a=Math.max(0,Math.min(1,p.life/p.max*1.5));g.globalAlpha=a;g.fillStyle=p.col;
  if(p.shape==='flash'){g.globalAlpha=a*.8;circ(p.x,p.y,p.size*(1.3-p.life/p.max*.5),p.col)}else if(p.shape==='star'){starP(p.x,p.y,p.size*1.3);g.fill()}else if(p.shape==='heart'){heartP(p.x,p.y,p.size);g.fill()}else{g.beginPath();g.arc(p.x,p.y,p.size,0,6.3);g.fill()}}g.globalAlpha=1;
 for(const r of rockets){circ(r.x,r.y,U*1,'#fff')}}
function drawWave(){if(!wave||wave.warn>0)return;const x=wave.x,top=HZ-U*14;g.save();const gr=g.createLinearGradient(x-W*.6,0,x,0);gr.addColorStop(0,'#1864ab');gr.addColorStop(1,'#4dabf7');g.fillStyle=gr;
 g.beginPath();g.moveTo(-10,H);g.lineTo(-10,top);g.lineTo(x-U*30,top);for(let y=top;y<=H;y+=U*4)g.lineTo(x+Math.sin(y*.05+T*8)*U*3,y);g.lineTo(x,H);g.closePath();g.fill();
 g.fillStyle='#a5d8ff';g.beginPath();g.moveTo(x-U*30,top);g.quadraticCurveTo(x+U*10,top-U*16,x+U*14,top+U*4);g.quadraticCurveTo(x-U*2,top-U*4,x-U*6,top+U*8);g.closePath();g.fill();
 for(let y=top;y<H;y+=U*5)circ(x+Math.sin(y*.07+T*9)*U*3,y,U*rr(1.8,3),'#fff');g.globalAlpha=.25;g.strokeStyle='#fff';g.lineWidth=U;for(let i=1;i<5;i++){g.beginPath();g.moveTo(x-i*U*25,top+U*5);g.quadraticCurveTo(x-i*U*25+U*10,H*.6,x-i*U*25,H);g.stroke()}g.restore()}
function drawWorld(){if(mode==='together'){bg(0,W/2,'candy');bg(W/2,W,'city')}else bg(0,W,mode==='zoe'?'candy':'city');
 for(const s of splats){g.globalAlpha=Math.min(1,s.life/2);ell(s.x,s.y,U*5,U*2,'#ff6b1a');ell(s.x,s.y,U*3,U*1.2,'#ffd43b');g.globalAlpha=1}
 drawUnder();
 for(const p of puddles){ell(p.x,p.y,p.rx,p.ry,p.th==='candy'?'#a5d8ff':'#4f7fa8');g.globalAlpha=.5;ell(p.x-p.rx*.25,p.y-p.ry*.3,p.rx*.4,p.ry*.3,'#fff');g.globalAlpha=1}
 for(const d of dinos){g.globalAlpha=.25;ell(d.x,d.y,d.sz*.45/(1+d.z/(U*30)),d.sz*.12/(1+d.z/(U*30)),'#000');g.globalAlpha=1}
 for(const r of rings){g.globalAlpha=Math.max(0,Math.min(1,r.life*3));g.strokeStyle=r.col;g.lineWidth=U*1.2;g.beginPath();g.ellipse(r.x,r.y,r.r,r.r*.5,0,0,6.3);g.stroke()}g.globalAlpha=1;
 const L=[];for(const b of B)L.push([b.y,0,b]);for(const d of dinos)L.push([d.y+1,1,d]);for(const k of kitties)L.push([k.y+.5,2,k]);for(const c of chunks)L.push([c.y,3,c]);if(boss&&boss.k==='mech')L.push([boss.y,4,boss]);L.sort((a,b)=>a[0]-b[0]);
 for(const [,t,o] of L){if(t===0)drawB(o);else if(t===4)drawMech(o);else if(t===1){const bl=o.inv>0&&Math.sin(T*40)>0;if(o.dodge>0){g.globalAlpha=.3;drawDino(o.kind,o.x-o.vx*.08,o.y-o.z-o.vy*.08,o.sz,{face:o.face,skin:skinOf(o),t:T});g.globalAlpha=1}if(bl)g.globalAlpha=.4;drawDino(o.kind,o.x,o.y-o.z,o.sz,{face:o.face,walk:o.walkT,squash:o.squash,fly:o.fly||o.megaing,t:T,skin:skinOf(o)});g.globalAlpha=1;if(o.dizzy>0)txt('💫',o.x,o.y-o.z-o.sz*1.25,U*5,'#fff')}else if(t===2)drawKitty(o);
  else{g.save();g.translate(o.x,o.y-o.z);g.rotate(o.rot);g.globalAlpha=Math.min(1,o.life);g.fillStyle=o.col;g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=U*.25;g.fillRect(-o.s/2,-o.s/2,o.s,o.s);g.strokeRect(-o.s/2,-o.s/2,o.s,o.s);g.restore()}}
 for(const l of lava){circ(l.x,l.y,U*1.8,'#ff6b1a');circ(l.x,l.y,U*1,'#ffe066')}
 for(const m of bombs){circ(m.x,m.y,U*1.3,pick(HOT))}
 drawOver();for(const j of jets)drawJet(j);drawFX();drawWave();if(mode==='zoe')zDraw();
 if(wave&&wave.warn>0){g.globalAlpha=.4+.3*Math.sin(T*12);g.fillStyle='#4dabf7';g.fillRect(0,0,U*3,H);g.globalAlpha=1}
 for(const t of texts){const a=t.t<.15?t.t/.15:1-Math.max(0,(t.t-(t.big?1.6:.7))/.5);g.globalAlpha=Math.max(0,a);txt(t.s,t.x,t.y-t.t*U*(t.big?2:8),t.sz*(t.t<.15?.6+t.t/.15*.4:1),t.col);g.globalAlpha=1}
 if(flash>0){g.globalAlpha=flash;g.fillStyle='#fff';g.fillRect(0,0,W,H);g.globalAlpha=1}}
function drawTitle(){const pm=mode;mode='together';bg(0,W/2,'candy');bg(W/2,W,'city');mode=pm;drawFX();
 const land=W>=H,ty=land?H*.17:H*.1,ts=Math.min(W*.085,H*.12);txt('DINO STAMPEDE',W/2,ty,ts,'#ffe066');txt('SMASH!',W/2,ty+ts*1.05,ts*1.2,'#ff6b6b');
 for(const c of titleCards()){const sel=c.m===qmode,sc=sel?1.06+Math.sin(titleT*4)*.03:1,s=c.s*sc;g.save();g.translate(c.x,c.y);
  if(sel){g.globalAlpha=.6+.3*Math.sin(titleT*6);g.fillStyle='#fff';g.beginPath();rrect(-s*.56,-s*.56,s*1.12,s*1.12,s*.18);g.fill();g.globalAlpha=1}
  g.lineWidth=U*.9;g.strokeStyle='#fff';const col=c.m==='alex'?'#2b4a6f':c.m==='zoe'?'#ffb3e6':'#8e6bd6';box(-s/2,-s/2,s,s,col,s*.15);
  if(c.m==='alex'){g.fillStyle='#ff922b';g.beginPath();g.moveTo(-s*.5,s*.3);for(let i=0;i<=8;i++)g.lineTo(-s*.5+i*s/8,s*.3-(i%2?s*.12:0));g.lineTo(s*.5,s*.5);g.lineTo(-s*.5,s*.5);g.fill();drawDino('trex',-s*.05,s*.28,s*.55,{face:1,t:titleT,fly:1,walk:titleT*6});drawJetAt(s*.25,-s*.32,s*.06)}
  else if(c.m==='zoe'){g.fillStyle='#fff';for(let i=0;i<6;i++){starP(Math.cos(i+titleT)*s*.36,Math.sin(i*2+titleT)*s*.3-s*.05,s*.04);g.fill()}drawDino('uni',-s*.05,s*.3,s*.52,{face:1,t:titleT,walk:titleT*5});drawKittyAt(s*.3,s*.32,s*.12)}
  else{drawDino('uni',-s*.24,s*.3,s*.34,{face:1,t:titleT,walk:titleT*5});drawDino('trex',s*.24,s*.3,s*.36,{face:-1,t:titleT,walk:titleT*6})}
  txt(c.m==='alex'?'ALEX':c.m==='zoe'?'ZOE':'TOGETHER',0,s*.6,s*.14,'#fff');if(c.m==='alex'&&save.best>1)txt('LEVEL '+save.best,0,-s*.42,s*.09,'#ffe066');g.restore()}
 if(R()<.04)rockets.push({x:rr(.1,.9)*W,y:H,vy:-U*rr(120,160),ty:rr(.05,.3)*H,cols:R()<.5?RAINBOW:HOT})}
function drawJetAt(x,y,s){const j={x,y,vx:1};g.save();g.translate(x,y);g.scale(s/(U*7),s/(U*7));g.translate(-x,-y);drawJet(j);g.restore()}
function drawKittyAt(x,y,s){g.save();g.translate(x,y);g.scale(s/(U*5),s/(U*5));drawKitty({x:0,y:0,z:0,t:0,col:'#ffb74d',f:1});g.restore()}
function drawIconArt(){const s=Math.min(W,H);const pm=mode;if(pm==='zoe')bg(0,W,'candy');else if(pm==='alex')bg(0,W,'city');else{mode='together';bg(0,W/2,'candy');bg(W/2,W,'city')}mode=pm;
 if(pm==='zoe'){drawDino('uni',W*.42,H*.96,s*.68,{face:1,t:1})}else if(pm==='alex'){drawDino('trex',W*.47,H*.93,s*.72,{face:1,t:1,fly:1})}else{drawDino('uni',W*.28,H*.92,s*.5,{face:1,t:1});drawDino('trex',W*.72,H*.92,s*.52,{face:-1,t:1})}}
// ---------- loop ----------
let lt=performance.now();function frame(now){const dt=Math.min(.05,(now-lt)/1000);lt=now;try{update(dt)}catch(e){console.error(e)}
 g.setTransform(DPR,0,0,DPR,0,0);if(shake>.3)g.translate(rr(-1,1)*shake*.4,rr(-1,1)*shake*.4);if(state==='icon')drawIconArt();else if(state==='title')drawTitle();else{drawWorld();drawHUD()}
 requestAnimationFrame(frame)}
resize();initAudio();requestAnimationFrame(frame);
window.__DS={start:startGame,title:goTitle,get state(){return state},get mode(){return mode},get B(){return B},get dinos(){return dinos},get meter(){return meter},set meter(v){meter=v},wave:()=>startWave(false),save,get ms(){return ms},level:startLevel,get heli(){return heli},get shots(){return shots},get boss(){return boss},hit:(n)=>{const a=alexD();if(a){a.inv=0;a.dodge=0;hitDino(a,n,a.x,a.y)}},AIN,tapZoe,get audio(){return AC&&AC.state},drawIcon:(m)=>{state='icon';mode=m},get zw(){return zw},get balloons(){return balloons},get zstars(){return zstars},get wv(){return wave},zBtn:()=>zBtn(),get parts(){return parts.length},get kitties(){return kitties.length}};
})();
