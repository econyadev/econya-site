
const CACHE_NAME = 'econya-v7-5';
const ASSETS = [
  '/', '/index.html', '/assistant.html', '/messages.html', '/partenaires.html',
  '/assets/style.css','/assets/main.js','/assets/ai.js','/assets/chat.js','/assets/ws.js','/assets/personalize.js','/manifest.webmanifest'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k===CACHE_NAME?null:caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});


self.addEventListener('push', event => {
  let data = {};
  try { data = event.data.json(); } catch(e){}
  const title = data.title || 'Econya';
  const body = data.body || 'Notification';
  const url = data.url || '/';
  event.waitUntil(self.registration.showNotification(title, { body, data:{url} }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.openWindow(url));
});
