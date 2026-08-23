var CACHE = 'dukaflow-v12-smart-inject';
var SHELL = [
  './',
  './index.html',
  './manifest.json',
  './smartsync.js',
  './icon-512.png',
  './logo.png'
];

function clearAllCaches() {
  return caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      return caches.delete(k);
    }));
  });
}

function forceUpdate() {
  return clearAllCaches().then(function () {
    return caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL);
    });
  });
}

function pingClients() {
  return self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function (list) {
    list.forEach(function (client) {
      client.postMessage({ type: 'DF_SYNC_NOW' });
    });
  });
}

function injectSmartSync(response) {
  return response.text().then(function (html) {
    if (html.indexOf('smartsync.js') === -1) {
      html = html.replace('</body>', '<script src="smartsync.js"></script></body>');
    }

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  });
}

function fetchIndexWithInjection(request) {
  return fetch(request, { cache: 'no-store' }).then(function (response) {
    return injectSmartSync(response);
  }).catch(function () {
    return caches.match('./index.html').then(function (cached) {
      if (cached) return injectSmartSync(cached);
      return caches.match('./');
    });
  });
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) {
          return caches.delete(k);
        }
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'DF_FORCE_UPDATE') {
    e.waitUntil(forceUpdate());
  }
});

self.addEventListener('sync', function (e) {
  if (e.tag === 'dukaflow-sync') {
    e.waitUntil(pingClients());
  }
});

self.addEventListener('periodicsync', function (e) {
  if (e.tag === 'dukaflow-periodic') {
    e.waitUntil(pingClients());
  }
});

self.addEventListener('fetch', function (e) {
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
        fetch(e.request, { cache: 'no-store' }).then(function (response) {
          return forceUpdate().then(function () {
            return injectSmartSync(response);
          });
        }).catch(function () {
          return caches.match('./index.html').then(function (cached) {
            if (cached) return injectSmartSync(cached);
            return caches.match('./');
          });
        })
      );
      return;
    }

    e.respondWith(fetchIndexWithInjection(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request);
    })
  );
});
