// apps/api/public/sw.js
const CACHE_NAME = 'cloudassistant6-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // navigation: try network first then cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).then(r => {
      // optionally cache new GET requests
      if (event.request.method === 'GET' && r && r.status === 200) {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return r;
    })).catch(() => {
      // as last resort, return a generic fallback (could add an offline page)
      return caches.match('/index.html');
    })
  );
});
