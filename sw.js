
const CACHE='econya-v977';
const ASSETS=['/','/index.html','/404.html','/assets/style.css','/assets/main.js','/assets/i18n.js','/assets/i18n.json','/assets/logo.svg','/assets/env.js','/manifest.webmanifest'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); });
self.addEventListener('fetch', e=>{
  const url=new URL(e.request.url);
  if(ASSETS.includes(url.pathname)){ e.respondWith(caches.match(e.request)); return; }
  e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));
});
