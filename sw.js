var CACHE='dukaflow-v75';
self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(function(res){
        var c=res.clone();caches.open(CACHE).then(function(ca){ca.put(e.request,c)});return res;
      }).catch(function(){
        return caches.match(e.request).then(function(m){return m||caches.match('./index.html')});
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(m){
        return m||fetch(e.request).then(function(res){
          var c=res.clone();caches.open(CACHE).then(function(ca){ca.put(e.request,c)});return res;
        });
      })
    );
  }
});