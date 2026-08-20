const CACHE = 'dukaflow-v5-pin';
const SHELL = ['./', './index.html', './logo.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.delete('dukaflow-v4').then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(r){ return r || fetch(e.request); }));
});
