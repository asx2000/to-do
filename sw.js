// ── To-Do PWA Service Worker ──────────────────────────────────────────────────
const CACHE_VERSION = 'todo-v3.1.1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: cache all app assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // cache:'reload' skips the browser HTTP cache so we never store a stale copy
      .then(cache => Promise.all(ASSETS.map(a =>
        fetch(new Request(a, { cache: 'reload' })).then(r => cache.put(a, r))
      )))
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

// Fetch: network-first (falls back to cache offline) so updates show up straight away
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' }).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const toCache = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, toCache));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
