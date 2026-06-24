// ── To-Do PWA Service Worker ──────────────────────────────────────────────────
// v1.9 — adds background notification scheduling
const CACHE_VERSION = 'todo-v1.9';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Pending notifications synced from the main thread
let pendingNotifications = [];

// Install: cache all app assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete any old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, toCache));
        return response;
      });
    })
  );
});

// ── Notification scheduling ─────────────────────────────────────────────────
// Receive pending notification list from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SYNC_NOTIFICATIONS') {
    pendingNotifications = event.data.pending || [];
    scheduleNextCheck();
  }
});

let checkTimer = null;

function scheduleNextCheck() {
  if (checkTimer) clearTimeout(checkTimer);
  if (pendingNotifications.length === 0) return;

  // Find the soonest notification
  const now = new Date();
  const hhmm = now.toTimeString().slice(0, 5);
  const today = now.toISOString().slice(0, 10);

  let soonestMs = Infinity;
  pendingNotifications.forEach(n => {
    if (n.date === today && n.time > hhmm) {
      const [h, m] = n.time.split(':').map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      const diff = target - now;
      if (diff > 0 && diff < soonestMs) soonestMs = diff;
    }
  });

  if (soonestMs < Infinity) {
    // Wake up at the target time (plus a small buffer)
    checkTimer = setTimeout(() => fireReadyNotifications(), Math.max(soonestMs, 1000));
  }
}

function fireReadyNotifications() {
  const now = new Date();
  const hhmm = now.toTimeString().slice(0, 5);
  const today = now.toISOString().slice(0, 10);
  const fired = [];

  pendingNotifications.forEach(n => {
    if (n.date === today && hhmm >= n.time) {
      self.registration.showNotification(n.title, {
        body: n.body,
        icon: 'icon.svg',
        badge: 'icon.svg',
        tag: n.id + '-' + today  // prevents duplicates
      });
      fired.push(n.id);
    }
  });

  // Remove fired notifications
  pendingNotifications = pendingNotifications.filter(n => !fired.includes(n.id));

  // Schedule next check if there are still pending ones
  scheduleNextCheck();
}

// Handle notification clicks — focus the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Focus existing tab if open
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      // Otherwise open a new tab
      return self.clients.openWindow('./');
    })
  );
});

// Periodic background sync (where supported) — re-check notifications
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(fireReadyNotifications());
  }
});
