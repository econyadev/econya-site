/* Econya SW – cache léger “app shell” */
const CACHE = "econya-v1";
const ASSETS = [
  "/", "/index.html",
  "/assets/style.css", "/assets/common.js",
  "/assets/compare.js", "/assets/coach.js", "/assets/deals.js",
  "/assets/logo-leaf.svg", "/manifest.webmanifest"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
});

self.addEventListener("fetch", e=>{
  const { request } = e;
  // Réseau d’abord pour API, cache d’abord pour assets
  if (request.url.includes("/onrender.com/")) return; // ne pas intercepter l’API
  e.respondWith(
    caches.match(request).then(cached=>{
      return cached || fetch(request).then(resp=>{
        // Met en cache les GET “safe”
        if (request.method === "GET" && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c=>c.put(request, copy));
        }
        return resp;
      }).catch(()=> cached || new Response("",{status:504,statusText:"offline"}));
    })
  );
});
