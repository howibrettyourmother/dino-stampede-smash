import asyncio
from playwright.async_api import async_playwright
O='/workspace/dino-stampede-smash'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for m,out in [('together',f'{O}/icon-512.png'),('alex','/workspace/kids-hubs/dino-stampede-smash-alex.png'),('zoe','/workspace/kids-hubs/dino-stampede-smash-zoe.png')]:
      pg=await b.new_page(viewport={'width':512,'height':512});await pg.goto(f'file://{O}/index.html');await pg.wait_for_timeout(600)
      await pg.evaluate(f"__DS.drawIcon('{m}');var h=document.getElementById('hubHome');if(h)h.remove()");await pg.wait_for_timeout(300);await pg.screenshot(path=out)
    await b.close()
asyncio.run(main())
