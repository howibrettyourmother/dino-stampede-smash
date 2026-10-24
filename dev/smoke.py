import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8799/dino-stampede-smash/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    bad=0
    for (w,h) in [(1180,820),(844,390)]:
     for m in ['alex','zoe','together']:
      c=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True);pg=await c.new_page();errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda x:errs.append(x.text) if x.type=='error' else None)
      await pg.goto(URL+'?mode='+m);await pg.wait_for_timeout(1200)
      if w==1180:await pg.screenshot(path=f'/workspace/dino-stampede-smash/dev/shot-title-{m}.png')
      await pg.evaluate(f"__DS.start('{m}')");await pg.wait_for_timeout(1500)
      # exercise controls
      if m!='zoe':
        await pg.evaluate("__DS.AIN.boost=true;__DS.AIN.boostTap=true");await pg.wait_for_timeout(700);await pg.evaluate("__DS.AIN.boost=false;__DS.AIN.roar=true;__DS.dinos.find(d=>d.who=='alex').mega=1;__DS.AIN.mega=true");
      if m!='alex':
        for i in range(6):
          bs=await pg.evaluate("__DS.B.filter(b=>b.x<(__DS.mode=='together'?innerWidth/2:9e9)).map(b=>[b.x,b.y-b.h*.4])")
          if bs:await pg.touchscreen.tap(bs[0][0],bs[0][1])
          await pg.wait_for_timeout(250)
      n0=await pg.evaluate("__DS.B.length");await pg.wait_for_timeout(2500)
      if m=='together':await pg.evaluate("__DS.meter=1")
      else:await pg.evaluate("__DS.wave()")
      await pg.wait_for_timeout(2500)
      if w==1180:await pg.screenshot(path=f'/workspace/dino-stampede-smash/dev/shot-{m}.png')
      await pg.wait_for_timeout(7000)
      info=await pg.evaluate("[__DS.state,__DS.B.length,__DS.dinos.map(d=>d.score),JSON.stringify(__DS.save)]")
      print(w,h,m,'buildings before',n0,'after rebuild',info,'errors',errs[:3]);bad+=len(errs)
      await c.close()
    await b.close();print('TOTAL ERRORS',bad)
asyncio.run(main())
