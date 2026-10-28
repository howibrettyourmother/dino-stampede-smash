# Together-mode check: first wave < 60s, meter never stalls, buildings regrow on both halves, no JS errors.
# Usage: python3 dev/smoke_together.py [URL]   (serve repo root; URL points at index.html dir)
import asyncio,sys,os
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8799/dino-stampede-smash/'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'shots');os.makedirs(SH,exist_ok=True)
STEP="""(()=>{const W=innerWidth,z=__DS.B.filter(b=>b.alive&&b.pop>=1&&b.x<W/2).sort((p,q)=>p.y-q.y).pop();
 const a=__DS.dinos.find(d=>d.who=='alex'),t=__DS.B.filter(b=>b.alive&&b.pop>=1&&b.x>=W/2)[0];if(t&&a){a.x+=(t.x-a.x)*.5;a.y+=(t.y-a.y)*.5;__DS.AIN.jx=Math.sign(t.x-a.x)||1}
 const bl=__DS.balloons[0];return {z:z?[z.x,z.y-z.h*.4]:null,bl:bl&&bl.x<W/2&&bl.y>0&&bl.y<innerHeight?[bl.x,bl.y]:null,m:__DS.meter,w:!!__DS.wv,
  zl:__DS.B.filter(b=>b.alive&&b.x<W/2).length,al:__DS.B.filter(b=>b.alive&&b.x>=W/2).length,st:__DS.zstars.filter(s=>!s.got).map(s=>[s.x,s.y])}})()"""
async def run(b,w,h,active,dur):
  c=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True);pg=await c.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda x:errs.append(x.text) if x.type=='error' else None)
  await pg.goto(URL+'?mode=together&notrack=1');await pg.wait_for_timeout(1500);await pg.evaluate("__DS.start('together')")
  t0=await pg.evaluate("performance.now()");waves=[];was=False;last_m=0;last_up=0;max_stall=0;minz=99;mina=99;shot=set();pm=0
  while True:
    now=(await pg.evaluate("performance.now()")-t0)/1000
    if now>dur:break
    s=await pg.evaluate(STEP)
    if s['w'] and not was:waves.append(round(now,1))
    was=s['w']
    if now>3 and not s['w']:minz=min(minz,s['zl']);mina=min(mina,s['al'])
    if s['m']!=last_m or s['w']:last_up=now;last_m=s['m']
    elif active:max_stall=max(max_stall,now-last_up)
    if active:
      if s['w'] and s['st']:await pg.touchscreen.tap(*s['st'][0])
      elif s['bl'] and now%3<1:await pg.touchscreen.tap(*s['bl'])
      elif s['z']:await pg.touchscreen.tap(*s['z'])
      if w==1180 and 'play' not in shot and now>12 and not s['w']:shot.add('play');await pg.screenshot(path=f'{SH}/together-play.png')
      if w==1180 and 'wave' not in shot and s['w'] and len(s['st'])>=3:
        await pg.wait_for_timeout(1800);shot.add('wave');await pg.screenshot(path=f'{SH}/together-wave-unicorn-stars.png')
      tm=await pg.evaluate("document.body&&0")
    await pg.wait_for_timeout(700)
  if w==1180 and active:
    await pg.wait_for_timeout(300)
  res=dict(size=f'{w}x{h}',active=active,waves=waves,first_wave=waves[0] if waves else None,max_meter_stall_s=round(max_stall,1),min_zoe_bldgs=minz,min_alex_bldgs=mina,errors=errs[:3])
  await c.close();return res
async def team_shot(b):
  c=await b.new_context(viewport={'width':1180,'height':820},has_touch=True,is_mobile=True);pg=await c.new_page()
  await pg.goto(URL+'?mode=together&notrack=1');await pg.wait_for_timeout(1500);await pg.evaluate("__DS.start('together')");await pg.wait_for_timeout(2500)
  ok=await pg.evaluate("""(()=>{const W=innerWidth,a=__DS.dinos.find(d=>d.who=='alex'),t=__DS.B.find(b=>b.alive&&b.x>=W/2);t.hp=0;a.x=t.x;a.y=t.y;a.z=0;a.vx=a.vy=U=0;return 1})()""") if False else 1
  # Alex smash via megaBlast-free path: set tiny hp + stomp-walk
  await pg.evaluate("""(()=>{const W=innerWidth,a=__DS.dinos.find(d=>d.who=='alex');for(const b of __DS.B)if(b.x>=W/2)b.hp=.01;const t=__DS.B.find(b=>b.alive&&b.x>=W/2);a.x=t.x;a.y=t.y+5;a.roarCd=0;__DS.AIN.roar=true})()""")
  await pg.wait_for_timeout(300)
  z=await pg.evaluate("(()=>{const z=__DS.B.find(b=>b.alive&&b.pop>=1&&b.x<innerWidth/2);return [z.x,z.y-z.h*.4]})()")
  await pg.touchscreen.tap(*z);await pg.wait_for_timeout(400)
  print('team smash fired:',await pg.evaluate("__DS.meter"))
  await pg.screenshot(path=f'{SH}/together-team-smash.png');await c.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);bad=0
    for (w,h) in [(1180,820),(1024,768)]:
      for active,dur in [(True,130),(False,62)]:
        r=await run(b,w,h,active,dur);print(r)
        fail=(r['first_wave'] is None or r['first_wave']>=60) or r['errors'] or (active and (r['max_meter_stall_s']>15 or r['min_zoe_bldgs']<2 or len(r['waves'])<2))
        if fail:bad+=1;print('  FAIL')
    await team_shot(b);await b.close();print('FAILURES',bad);sys.exit(1 if bad else 0)
asyncio.run(main())
