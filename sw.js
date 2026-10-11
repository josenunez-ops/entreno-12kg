// Cache para funcionar sin conexión. La página se pide primero a la red (máx. 4 s) para recibir actualizaciones.
// Los vídeos van siempre a la red: Safari los pide por trozos (Range) y la caché no sabe servirlos;
// sin conexión, la app muestra la figura animada.
const C='gis-salud-v4';
const CORE=['./','index.html','manifest.webmanifest','logo.svg','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const put=(req,res)=>caches.open(C).then(c=>c.put(req,res)).catch(()=>{});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
 const url=new URL(r.url);
 if(r.headers.has('range')||/\.mp4$/.test(url.pathname))return;
 if(r.mode==='navigate'){
  e.respondWith(Promise.race([fetch(r),new Promise((_,no)=>setTimeout(()=>no(new Error('lenta')),4000))])
   .then(res=>{if(res.ok&&res.type==='basic')put('index.html',res.clone());return res})
   .catch(()=>caches.match('index.html').then(h=>h||fetch(r))));return}
 e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||(res.type==='opaque'&&url.hostname.endsWith('gstatic.com')))put(r,res.clone());return res})))});
