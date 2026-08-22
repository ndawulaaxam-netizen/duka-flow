var CACHE = 'dukaflow-v9-force';
var SHELL = ['./', './index.html', './logo.png'];

function clearAllCaches() {
  return caches.keys().then(function(keys) {
    return Promise.all(keys.map(function(k) {
      return caches.delete(k);
    }));
  });
}

function forceUpdate() {
  return clearAllCaches().then(function() {
    return caches.open(CACHE).then(function(c) {
      return c.addAll(SHELL);
    });
  });
}

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'DF_FORCE_UPDATE') {
    e.waitUntil(forceUpdate());
  }
});

self.addEventListener('fetch', function(e) {
  if (e.request.mode === 'navigate') {
    var force = false;
    try {
      var u = new URL(e.request.url);
      force = u.search.indexOf('dfupdate=1') > -1;
    } catch (err) {
      force = false;
    }

    if (force) {
      e.respondWith(
        fetch(e.request, { cache: 'no-store' }).then(function(response) {
          return forceUpdate().then(function() {
            return response;
          });
        }).catch(function() {
          return caches.match('./index.html');
        })
      );
      return;
    }

    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(function() {
        return caches.match('./index.html');
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request);
    })
  );
});
