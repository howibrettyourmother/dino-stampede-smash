import asyncio,sys,json
from playwright.async_api import async_playwright
URL=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8799/dino-stampede-smash/')+'?notrack'
DUR=float(sys.argv[2]) if len(sys.argv)>2 else 45
SH='/workspace/dino-stampede-smash/dev/shots-zoe-v2/'
PICK='''()=>{const D=__DS,w=D.wv;if(w){if(w.warn>0)return null;const s=D.zstars.find(s=>!s.got);return s?{k:'star',x:s.x,y:s.y}:null}
 if(D.zw.m>=1&&!D.zw.tappedOnce)return null;
 const b=D.balloons.find(b=>b.y>40&&b.y<innerHeight-20);if(b)return{k:'bal',x:b.x,y:b.y};
 const bs=D.B.filter(b=>b.alive&&b.pop>=1);if(!bs.length)return null;const g=bs.find(b=>b.gold)||bs[Math.random()*bs.length|0];return{k:g.gold?'gold':'bld',x:g.x,y:g.y-g.h*.5}}'''
async def run(b,w,h):
  c=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True);pg=await c.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda x:x.type=='error' and errs.append(x.text))
  await pg.goto(URL);await pg.wait_for_function('window.__DS');await pg.evaluate("__DS.start('zoe')")
  st=dict(taps=0,bld=0,gold=0,bal=0,star=0,waves=0,btnWave=0,autoWave=0,maxIdle=0,regrow=0,maxParts=0,surfSeen=0,goldSeen=0,balSeen=0);idle=0;t=0;prevWave=False;prevN=None;shots=set();btnUsed=False
  while t<DUR:
    s=await pg.evaluate('''()=>{const D=__DS,z=D.dinos[0];return{n:D.B.filter(b=>b.alive).length,tap:D.B.some(b=>b.alive&&b.pop>=1)||D.balloons.length>0||!!(D.wv&&!D.wv.warn&&D.zstars.some(s=>!s.got)),wave:!!D.wv,m:D.zw.m,stars:D.zw.stars,surf:!!z.surf,gold:D.B.some(b=>b.gold&&b.alive),bal:D.balloons.length,parts:D.parts}}''')
    st['maxParts']=max(st['maxParts'],s['parts']);st['surfSeen']+=s['surf'];st['goldSeen']|=s['gold'];st['balSeen']|=s['bal']>0
    if prevN is not None and s['n']>prevN and not s['wave']:st['regrow']+=s['n']-prevN
    prevN=s['n']
    if s['wave'] and not prevWave:st['waves']+=1
    if not s['wave'] and prevWave:st['star']+=lastStars
    lastStars=s['stars'];prevWave=s['wave']
    idle=0 if s['tap'] else idle+.25;st['maxIdle']=max(st['maxIdle'],idle)
    if s['m']>=1 and not s['wave']:
      if 'full' not in shots:await pg.wait_for_timeout(300);await pg.screenshot(path=SH+f'{w}x{h}-meter-full.png');shots.add('full')
      if not btnUsed:
        bb=await pg.evaluate('__DS.zBtn()');await pg.touchscreen.tap(bb['x'],bb['y']);btnUsed=True;st['btnWave']+=1;await pg.wait_for_timeout(250);t+=.25;continue
      else:
        await pg.wait_for_timeout(250);t+=.25;continue  # let auto-start happen
    if s['surf'] and 'surf' not in shots and s['stars']>=3:await pg.screenshot(path=SH+f'{w}x{h}-surf-stars.png');shots.add('surf')
    if s['gold'] and s['bal'] and 'gb' not in shots:await pg.screenshot(path=SH+f'{w}x{h}-gold-balloon.png');shots.add('gb')
    p=await pg.evaluate(PICK.replace('!D.zw.tappedOnce','false'))
    if p:
      if p['k']=='gold':k0=await pg.evaluate('__DS.kitties')
      await pg.touchscreen.tap(p['x'],p['y']);st['taps']+=1
      if p['k']=='gold':
        await pg.wait_for_timeout(120);k1=await pg.evaluate('__DS.kitties');st['gold']+= (k1-k0>=2)
      elif p['k']=='bal':st['bal']+=1
      elif p['k']=='bld':st['bld']+=1
    await pg.wait_for_timeout(250);t+=.25
  autos=st['waves']-st['btnWave'];st['autoWave']=autos;st['errs']=errs[:5]
  await c.close();return st
async def modes(b,w,h):
  c=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True);pg=await c.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL);await pg.wait_for_function('window.__DS');out={}
  for m in['alex','together']:
    await pg.evaluate(f"__DS.start('{m}')");await pg.wait_for_timeout(3000)
    out[m]=await pg.evaluate("({n:__DS.B.length,d:__DS.dinos.map(d=>d.kind),bal:__DS.balloons.length,stars:__DS.zstars.length,wave:!!__DS.wv,saveOK:!!localStorage.getItem('dinoStampedeSmash')})")
  await pg.evaluate("__DS.start('together');__DS.meter=1");await pg.wait_for_timeout(7000);out['togetherFinaleWave']=await pg.evaluate("!!__DS.wv")
  out['errs']=errs;await c.close();return out
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for (w,h) in [(1180,820),(844,390),(390,844)]:
      print(w,h,json.dumps(await run(b,w,h)),flush=True)
    print('other',json.dumps(await modes(b,1180,820)))
    await b.close()
asyncio.run(main())
