const CACHE_NAME = 'civiceye-v1';
const URLS_TO_CACHE = ['/', '/css/style.css', '/js/app.js', '/js/map.js', '/js/dashboard.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
