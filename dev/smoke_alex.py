# Alex mission/enemy/boss smoke test: levels 1-4, bosses 5/10/15, hit->fail->retry, clear->next level.
import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8799/dino-stampede-smash/'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);bad=0
    for (w,h) in [(1180,820),(844,390)]:
      c=await b.new_context(viewport={'width':w,'height':h},has_touch=True,is_mobile=True);pg=await c.new_page();errs=[]
      pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda x:errs.append(x.text) if x.type=='error' else None)
      await pg.goto(URL+'?mode=alex');await pg.wait_for_timeout(800);await pg.evaluate("__DS.start('alex')")
      await pg.wait_for_timeout(1000)
      if w==1180:await pg.screenshot(path='dev/shot-alex-intro.png')
      for L in [1,2,3,4,8,9,5,10,15]:
        await pg.evaluate(f"__DS.level({L})");await pg.wait_for_timeout(3200)
        await pg.evaluate("__DS.AIN.boost=true;__DS.AIN.boostTap=true");await pg.wait_for_timeout(600);await pg.evaluate("__DS.AIN.boost=false;__DS.AIN.roar=true;__DS.dinos[0].mega=1;__DS.AIN.mega=true")
        await pg.wait_for_timeout(5000)
        info=await pg.evaluate("[__DS.ms.L,__DS.ms.def.type,__DS.ms.phase,__DS.ms.n,__DS.ms.def.goal,Math.round(__DS.ms.t),Math.round(__DS.dinos[0].hp),__DS.shots.length,__DS.heli.length,__DS.boss&&[__DS.boss.k,Math.round(__DS.boss.hp)],__DS.B.filter(b=>b.type=='tower'||b.type=='turret'||b.arm).length]")
        print(w,'L',info)
        if w==1180 and L in (4,5,10,15):await pg.screenshot(path=f'dev/shot-alex-L{L}.png')
      # fail + retry
      await pg.evaluate("__DS.hit(999)");await pg.wait_for_timeout(500);ph=await pg.evaluate("__DS.ms.phase");
      if w==1180:await pg.screenshot(path='dev/shot-alex-fail.png')
      rb=await pg.evaluate("[innerWidth/2,innerHeight*.6]");await pg.touchscreen.tap(rb[0],rb[1]);await pg.wait_for_timeout(300)
      ph2=await pg.evaluate("[__DS.ms.phase,__DS.ms.L,__DS.dinos[0].hp]");print('fail->',ph,'after retry tap',ph2)
      # clear -> next
      await pg.evaluate("__DS.level(1)");await pg.wait_for_timeout(3000);await pg.evaluate("for(let i=0;i<40;i++){const b=__DS.B.find(b=>b.alive&&b.pop>=1);if(!b)break;b.hp=0;} ")
      await pg.evaluate("const d=__DS.dinos[0];d.mega=1;__DS.AIN.mega=true");await pg.wait_for_timeout(2500)
      await pg.evaluate("__DS.ms.n=__DS.ms.def.goal-1");
      await pg.evaluate("const d=__DS.dinos[0];const b=__DS.B.find(b=>b.alive&&b.pop>=1);d.x=b.x;d.y=b.y;d.mega=1;__DS.AIN.mega=true");await pg.wait_for_timeout(2500)
      if w==1180:await pg.screenshot(path='dev/shot-alex-clear.png')
      print('clear phase',await pg.evaluate("[__DS.ms.phase,__DS.ms.stars,JSON.stringify(__DS.save)]"))
      await pg.wait_for_timeout(9000);print('next',await pg.evaluate("[__DS.ms.L,__DS.ms.phase]"))
      print('errors',errs[:5]);bad+=len(errs);await c.close()
    await b.close();print('TOTAL ERRORS',bad)
asyncio.run(main())
