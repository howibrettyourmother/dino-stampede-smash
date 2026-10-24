# Bundle into one self-contained index.html + write sw.js with a bumped cache version. Usage: python3 src/build.py 1.0.0-20261024a
import base64,os,re,sys
D=os.path.dirname(os.path.abspath(__file__));O=os.path.dirname(D);V=sys.argv[1]
font=base64.b64encode(open(f'{D}/baloo.woff','rb').read()).decode()
t=open(f'{D}/template.html').read().replace('/*__FONT__*/',font).replace('%VER%',V.split('-')[0]).replace('/*__GAME__*/',open(f'{D}/game.js').read())
# shared kids-hub snippets (hold-home button + SW auto-reload), same as the other games
home=open('/workspace/kids-hubs/home.js').read().strip().replace('%OWN%','alex').replace('%POS%','left:calc(6px + env(safe-area-inset-left));top:calc(6px + env(safe-area-inset-top))')
sw=re.search(r'SNIP="""(.*?)"""',open('/workspace/kids-hubs/swfix.py').read(),re.S).group(1)
i=t.rfind('</body>');t=t[:i]+sw+'\n'+home+'\n'+t[i:]
open(f'{O}/index.html','w').write(t)
fetch=re.search(r'FETCH=r"""(.*?)"""',open('/workspace/kids-hubs/swfix.py').read(),re.S).group(1)
A=["./","index.html","manifest.json","apple-touch-icon.png","favicon-32.png","icon-192.png","icon-512.png"]
s=("// offline support: precache everything; pages+scripts network-first (cache fallback offline), media cache-first.\n// Bump V on each release so old caches are dropped.\n"
 f"const P='dino-stampede-smash-',V='{V}',C=P+V,A={A!r};\n".replace("'",'"').replace('"dino-stampede-smash-"',"'dino-stampede-smash-'").replace(f'"{V}"',f"'{V}'")+
 "self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});\n"
 "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(P)&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});\n"+fetch)
open(f'{O}/sw.js','w').write(s);print(len(t),'bytes',V)
