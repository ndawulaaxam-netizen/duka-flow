// DukaFlow Smart Sync addon
(function () {
  function safeSync() {
    try {
      if (typeof syncAll === 'function') {
        syncAll();
      }
    } catch (e) {}
  }

  function registerBackgroundSync() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(function (reg) {
      if (reg.sync && reg.sync.register) {
        reg.sync.register('dukaflow-sync').catch(function () {});
      }
    }).catch(function () {});
  }

  function registerPeriodicSync() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(function (reg) {
      if (reg.periodicSync && reg.periodicSync.register) {
        reg.periodicSync.register('dukaflow-periodic', {
          minInterval: 21600000
        }).catch(function () {});
      }
    }).catch(function () {});
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'DF_SYNC_NOW') {
        safeSync();
      }
    });
  }

  window.addEventListener('online', function () {
    safeSync();
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      safeSync();
      registerBackgroundSync();
      registerPeriodicSync();
    }, 2000);
  });

  setInterval(function () {
    try {
      if (typeof pendingCount === 'function' && pendingCount() > 0) {
        if (navigator.onLine) {
          safeSync();
        } else {
          registerBackgroundSync();
        }
      }
    } catch (e) {}
  }, 30000);
})();
